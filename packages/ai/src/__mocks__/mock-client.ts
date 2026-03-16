import { BaseModelClient, ChatOptions, ChatResponse, StreamChunk } from '../client.js';
import { AIModel } from '../manager.js';

export interface MockResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const WATER_INTENT_RESPONSE: MockResponse = {
  content: JSON.stringify({
    tool: 'health_log_water',
    args: { amount: 3 },
    confidence: 0.95,
    reasoning: 'User explicitly mentions drinking water with quantity',
  }),
  usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
};

const EXERCISE_INTENT_RESPONSE: MockResponse = {
  content: JSON.stringify({
    tool: 'health_log_exercise',
    args: { activity: 'running', duration: 30 },
    confidence: 0.92,
    reasoning: 'User mentions running exercise with duration',
  }),
  usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
};

const UNKNOWN_INTENT_RESPONSE: MockResponse = {
  content: JSON.stringify({
    tool: null,
    args: {},
    confidence: 0,
    reasoning: 'No matching tool found for this request',
  }),
  usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
};

const FINANCE_INTENT_RESPONSE: MockResponse = {
  content: JSON.stringify({
    tool: 'finance_record',
    args: { type: 'expense', amount: 50, category: 'food' },
    confidence: 0.88,
    reasoning: 'User mentions spending money on food',
  }),
  usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
};

export class MockAIClient extends BaseModelClient {
  private mockResponse: MockResponse;

  constructor(model: AIModel, _responseType: 'water' | 'exercise' | 'finance' | 'unknown' = 'water') {
    super(model);
    this.mockResponse = this.getResponseForType(_responseType);
  }

  private getResponseForType(type: string): MockResponse {
    switch (type) {
      case 'water':
        return WATER_INTENT_RESPONSE;
      case 'exercise':
        return EXERCISE_INTENT_RESPONSE;
      case 'finance':
        return FINANCE_INTENT_RESPONSE;
      case 'unknown':
      default:
        return UNKNOWN_INTENT_RESPONSE;
    }
  }

  setResponseType(type: 'water' | 'exercise' | 'finance' | 'unknown'): void {
    this.mockResponse = this.getResponseForType(type);
  }

  async chat(_options: ChatOptions): Promise<ChatResponse> {
    return {
      content: this.mockResponse.content,
      usage: this.mockResponse.usage,
    };
  }

  async *chatStream(_options: ChatOptions): AsyncGenerator<StreamChunk> {
    const response = await this.chat(_options);
    yield { delta: response.content, done: true, usage: response.usage };
  }

  calculateCost(_promptTokens: number, _completionTokens: number): number {
    return 0;
  }
}

export function createMockClient(model: AIModel, responseType?: 'water' | 'exercise' | 'finance' | 'unknown'): MockAIClient {
  return new MockAIClient(model, responseType);
}
