import { createModelClient } from './client.js';
import { AIManager } from './manager.js';

export interface ToolDefinition {
  name: string;
  description: string;
  keywords: string[];
  paramMapping: Record<string, 'numeric_extraction' | 'date_extraction' | 'keyword_extraction' | 'direct'>;
  requiredParams: string[];
}

export interface ParsedIntent {
  tool: string | null;
  args: Record<string, unknown>;
  confidence: number;
  error?: string;
  reasoning?: string;
}

export interface ToolExecutor {
  (args: Record<string, unknown>): Promise<unknown>;
}

const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

const DEFAULT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'health_log_water',
    description: 'Log water intake in milliliters',
    keywords: ['water', 'drink', 'hydration', 'cups', 'glasses', 'ml', 'milliliter'],
    paramMapping: {
      amount: 'numeric_extraction',
      date: 'date_extraction',
    },
    requiredParams: ['amount'],
  },
  {
    name: 'health_log_exercise',
    description: 'Log exercise activity',
    keywords: ['exercise', 'run', 'walk', 'workout', 'gym', 'yoga', 'swim', 'bike', 'cycling', 'minutes', 'hour'],
    paramMapping: {
      activity: 'keyword_extraction',
      duration: 'numeric_extraction',
      date: 'date_extraction',
    },
    requiredParams: ['activity', 'duration'],
  },
  {
    name: 'finance_record',
    description: 'Record income or expense',
    keywords: ['spent', 'earned', 'income', 'expense', 'bought', 'paid', 'money', '$', 'cost'],
    paramMapping: {
      type: 'direct',
      amount: 'numeric_extraction',
      category: 'keyword_extraction',
      date: 'date_extraction',
    },
    requiredParams: ['type', 'amount'],
  },
];

const INTENT_PARSING_PROMPT = `You are an intent parser for a personal assistant system. Your task is to understand user requests and map them to available tools.

Available tools:
{TOOL_DEFINITIONS}

User request: "{USER_INPUT}"

Analyze the request and determine:
1. Which tool best matches the user's intent
2. Extract the necessary parameters from the user's input
3. Rate your confidence in the match (0-1)

Respond in JSON format:
{{
  "tool": "tool_name" or null if no match,
  "args": {{"param1": "value1", "param2": "value2"}},
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}}

If no tool matches, set tool to null and confidence to 0.
If the request is ambiguous, set confidence below 0.8.`;

export class NLUService {
  private aiManager: AIManager;
  private toolDefinitions: ToolDefinition[];
  private toolExecutors: Map<string, ToolExecutor>;
  private confidenceThreshold: number;

  constructor(
    aiManager: AIManager,
    toolDefinitions: ToolDefinition[] = DEFAULT_TOOL_DEFINITIONS,
    confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD
  ) {
    this.aiManager = aiManager;
    this.toolDefinitions = toolDefinitions;
    this.toolExecutors = new Map();
    this.confidenceThreshold = confidenceThreshold;
  }

  registerTool(name: string, executor: ToolExecutor): void {
    this.toolExecutors.set(name, executor);
  }

  private buildToolDefinitionsPrompt(): string {
    return this.toolDefinitions
      .map(t => `- ${t.name}: ${t.description}`)
      .join('\n');
  }

  async parseIntent(userInput: string): Promise<ParsedIntent> {
    const model = this.aiManager.getActiveModel();
    if (!model) {
      return {
        tool: null,
        args: {},
        confidence: 0,
        error: 'No AI model configured. Please set up an AI provider.',
      };
    }

    try {
      const client = createModelClient(model);
      const toolDefsPrompt = this.buildToolDefinitionsPrompt();
      const prompt = INTENT_PARSING_PROMPT
        .replace('{TOOL_DEFINITIONS}', toolDefsPrompt)
        .replace('{USER_INPUT}', userInput);

      const response = await client.chat({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 500,
      });

      return this.extractIntent(response.content);
    } catch (error) {
      return {
        tool: null,
        args: {},
        confidence: 0,
        error: error instanceof Error ? error.message : 'Failed to parse intent',
      };
    }
  }

  private extractIntent(responseContent: string): ParsedIntent {
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          tool: null,
          args: {},
          confidence: 0,
          error: 'Invalid response format',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.tool) {
        return {
          tool: null,
          args: parsed.args || {},
          confidence: parsed.confidence || 0,
          error: 'Could not understand request',
        };
      }

      return {
        tool: parsed.tool,
        args: this.normalizeArgs(parsed.tool, parsed.args || {}),
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning,
      };
    } catch {
      return {
        tool: null,
        args: {},
        confidence: 0,
        error: 'Failed to parse AI response',
      };
    }
  }

  private normalizeArgs(toolName: string, args: Record<string, unknown>): Record<string, unknown> {
    const tool = this.toolDefinitions.find(t => t.name === toolName);
    if (!tool) return args;

    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(args)) {
      const mapping = tool.paramMapping[key];

      if (mapping === 'numeric_extraction') {
        normalized[key] = this.extractNumeric(value);
      } else if (mapping === 'date_extraction') {
        normalized[key] = this.extractDate(value);
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private extractNumeric(value: unknown): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseInt(value.replace(/[^\d]/g, ''), 10);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }

  private extractDate(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value === 'today') return new Date().toISOString().split('T')[0];
      if (value === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
      }
      return value;
    }
    return undefined;
  }

  async executeTool(intent: ParsedIntent): Promise<unknown> {
    if (!intent.tool) {
      throw new Error(intent.error || 'No tool specified');
    }

    if (intent.confidence < this.confidenceThreshold) {
      throw new Error(`Low confidence (${intent.confidence.toFixed(2)}). Please be more specific.`);
    }

    const executor = this.toolExecutors.get(intent.tool);
    if (!executor) {
      throw new Error(`Tool ${intent.tool} not registered`);
    }

    const tool = this.toolDefinitions.find(t => t.name === intent.tool);
    if (tool) {
      for (const required of tool.requiredParams) {
        if (!(required in intent.args) || intent.args[required] === undefined) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }

    return executor(intent.args);
  }

  async processNaturalLanguage(userInput: string): Promise<unknown> {
    const intent = await this.parseIntent(userInput);
    return this.executeTool(intent);
  }

  getToolDefinitions(): ToolDefinition[] {
    return [...this.toolDefinitions];
  }

  addToolDefinition(definition: ToolDefinition): void {
    this.toolDefinitions.push(definition);
  }
}

export function createNLUService(aiManager: AIManager): NLUService {
  return new NLUService(aiManager);
}
