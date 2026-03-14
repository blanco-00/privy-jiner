import { AIModel, AIManager } from './manager.js';
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface ChatOptions {
    model: AIModel;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}
export interface ChatResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface StreamChunk {
    delta: string;
    done: boolean;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export declare abstract class BaseModelClient {
    protected model: AIModel;
    constructor(model: AIModel);
    abstract chat(options: ChatOptions): Promise<ChatResponse>;
    abstract chatStream(options: ChatOptions): AsyncGenerator<StreamChunk>;
    abstract calculateCost(promptTokens: number, completionTokens: number): number;
}
export declare class OpenAIClient extends BaseModelClient {
    chat(options: ChatOptions): Promise<ChatResponse>;
    chatStream(options: ChatOptions): AsyncGenerator<StreamChunk>;
    calculateCost(promptTokens: number, completionTokens: number): number;
}
export declare class ClaudeClient extends BaseModelClient {
    chat(options: ChatOptions): Promise<ChatResponse>;
    chatStream(options: ChatOptions): AsyncGenerator<StreamChunk>;
    calculateCost(promptTokens: number, completionTokens: number): number;
}
export declare function createModelClient(model: AIModel): BaseModelClient;
export declare class ChatService {
    private aiManager;
    constructor(aiManager: AIManager);
    sendMessage(conversationId: string, message: string): Promise<ChatResponse>;
    sendMessageStream(conversationId: string, message: string): AsyncGenerator<StreamChunk>;
}
//# sourceMappingURL=client.d.ts.map