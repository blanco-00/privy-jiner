import { NLUService } from '../nlu.js';
import { AIManager } from '../manager.js';
import { createMockClient } from '../__mocks__/mock-client.js';

jest.mock('../client.js', () => ({
  createModelClient: jest.fn((model: any) => createMockClient(model, 'water')),
}));

const mockAIModel = {
  id: 'test-model',
  provider: 'openai' as const,
  name: 'Test Model',
  model: 'gpt-4',
  type: 'text' as const,
  isDefault: true,
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAIManager = {
  getActiveModel: jest.fn(() => mockAIModel),
  getDefaultModel: jest.fn(() => mockAIModel),
} as unknown as AIManager;

describe('NLUService', () => {
  let nluService: NLUService;

  beforeEach(() => {
    nluService = new NLUService(mockAIManager);
    jest.clearAllMocks();
  });

  describe('parseIntent', () => {
    it('should parse water logging intent', async () => {
      nluService.registerTool('health_log_water', async (args) => {
        return { success: true, tool: 'health_log_water', args };
      });

      const result = await nluService.parseIntent('I drank 3 glasses of water');
      
      expect(result.tool).toBe('health_log_water');
      expect(result.args).toHaveProperty('amount');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should parse exercise logging intent', async () => {
      nluService.registerTool('health_log_exercise', async (args) => {
        return { success: true, tool: 'health_log_exercise', args };
      });

      const result = await nluService.parseIntent('I ran for 30 minutes');
      
      expect(result.tool).toBe('health_log_exercise');
      expect(result.args).toHaveProperty('duration');
    });

    it('should return null for unknown intent', async () => {
      const result = await nluService.parseIntent('What is the weather?');
      
      expect(result.tool).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('extractNumeric', () => {
    it('should extract number from string', () => {
      const result = (nluService as any).extractNumeric('3 glasses');
      expect(result).toBe(3);
    });

    it('should extract number with units', () => {
      const result = (nluService as any).extractNumeric('500ml');
      expect(result).toBe(500);
    });

    it('should return undefined for non-numeric', () => {
      const result = (nluService as any).extractNumeric('no number');
      expect(result).toBeUndefined();
    });
  });

  describe('extractDate', () => {
    it('should return today for "today"', () => {
      const result = (nluService as any).extractDate('today');
      expect(result).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should return yesterday for "yesterday"', () => {
      const result = (nluService as any).extractDate('yesterday');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(result).toBe(yesterday.toISOString().split('T')[0]);
    });

    it('should return date string as-is', () => {
      const result = (nluService as any).extractDate('2026-03-15');
      expect(result).toBe('2026-03-15');
    });
  });

  describe('executeTool', () => {
    it('should execute tool with valid intent', async () => {
      let executed = false;
      nluService.registerTool('health_log_water', async (args) => {
        executed = true;
        return { success: true, logged: args };
      });

      const intent = {
        tool: 'health_log_water',
        args: { amount: 3 },
        confidence: 0.9,
      };

      const result = await nluService.executeTool(intent);
      
      expect(executed).toBe(true);
      expect((result as any).success).toBe(true);
    });

    it('should throw error for missing required params', async () => {
      nluService.registerTool('health_log_water', async () => {
        return { success: true };
      });

      const intent = {
        tool: 'health_log_water',
        args: {},
        confidence: 0.9,
      };

      await expect(nluService.executeTool(intent)).rejects.toThrow('Missing required parameter: amount');
    });

    it('should throw error for low confidence', async () => {
      const intent = {
        tool: 'health_log_water',
        args: { amount: 3 },
        confidence: 0.5,
      };

      await expect(nluService.executeTool(intent)).rejects.toThrow('Low confidence');
    });
  });

  describe('processNaturalLanguage', () => {
    it('should process NL end-to-end', async () => {
      nluService.registerTool('health_log_water', async (args) => {
        return { success: true, logged: args };
      });

      const result = await nluService.processNaturalLanguage('I drank 3 glasses of water');
      
      expect((result as any).success).toBe(true);
    });
  });
});
