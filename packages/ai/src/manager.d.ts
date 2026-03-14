import Database from 'better-sqlite3';
export interface AIModel {
    id: string;
    provider: 'openai' | 'claude' | 'other';
    name: string;
    model: string;
    type: 'text' | 'voice' | 'embedding';
    apiKey?: string;
    baseUrl?: string;
    isDefault: boolean;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TokenUsage {
    id: string;
    modelId: string;
    conversationId?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    currency: string;
    createdAt: Date;
}
export interface Conversation {
    id: string;
    modelId: string;
    title?: string;
    messages: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Prompt {
    id: string;
    name: string;
    content: string;
    modelId?: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AIManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    addModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): AIModel;
    getModel(id: string): AIModel | undefined;
    listModels(): AIModel[];
    getEnabledModels(): AIModel[];
    getDefaultModel(): AIModel | undefined;
    updateModel(id: string, updates: Partial<Pick<AIModel, 'name' | 'model' | 'apiKey' | 'baseUrl' | 'isDefault' | 'enabled'>>): AIModel | undefined;
    deleteModel(id: string): boolean;
    recordTokenUsage(usage: Omit<TokenUsage, 'id' | 'createdAt'>): TokenUsage;
    getTokenUsage(modelId?: string, startDate?: Date, endDate?: Date): TokenUsage[];
    getTokenStats(modelId?: string): {
        totalTokens: number;
        totalCost: number;
        count: number;
    };
    createConversation(modelId: string, title?: string): Conversation;
    getConversation(id: string): Conversation | undefined;
    updateConversation(id: string, messages: unknown[]): Conversation | undefined;
    addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Prompt;
    getPrompt(id: string): Prompt | undefined;
    listPrompts(systemOnly?: boolean): Prompt[];
    private mapRowToModel;
    private mapRowToTokenUsage;
    private mapRowToConversation;
    private mapRowToPrompt;
}
//# sourceMappingURL=manager.d.ts.map