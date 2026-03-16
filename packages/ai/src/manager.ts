import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface ProviderModel {
  id: string;
  name: string;
  created?: number;
  description?: string;
}

export interface AIModel {
  id: string;
  provider: 'openai' | 'claude' | 'zhipu' | 'minimax' | 'other';
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

export class AIManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        name TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        api_key TEXT,
        base_url TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS token_usage (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        conversation_id TEXT,
        prompt_tokens INTEGER NOT NULL DEFAULT 0,
        completion_tokens INTEGER NOT NULL DEFAULT 0,
        total_tokens INTEGER NOT NULL DEFAULT 0,
        cost REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        created_at TEXT NOT NULL,
        FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        title TEXT,
        messages TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        model_id TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model_id);
      CREATE INDEX IF NOT EXISTS idx_token_usage_created ON token_usage(created_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_model ON conversations(model_id);
    `);
  }

  addModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): AIModel {
    const id = uuidv4();
    const now = new Date().toISOString();

    if (model.isDefault) {
      this.db.prepare('UPDATE ai_models SET is_default = 0').run();
    }

    const stmt = this.db.prepare(`
      INSERT INTO ai_models (id, provider, name, model, type, api_key, base_url, is_default, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      model.provider,
      model.name,
      model.model,
      model.type,
      model.apiKey || null,
      model.baseUrl || null,
      model.isDefault ? 1 : 0,
      model.enabled ? 1 : 0,
      now,
      now
    );

    return this.getModel(id)!;
  }

  getModel(id: string): AIModel | undefined {
    const stmt = this.db.prepare('SELECT * FROM ai_models WHERE id = ?');
    const row = stmt.get(id) as AIModelRow | undefined;
    return row ? this.mapRowToModel(row) : undefined;
  }

  listModels(): AIModel[] {
    const stmt = this.db.prepare('SELECT * FROM ai_models ORDER BY created_at DESC');
    const rows = stmt.all() as AIModelRow[];
    return rows.map(row => this.mapRowToModel(row));
  }

  getEnabledModels(): AIModel[] {
    const stmt = this.db.prepare('SELECT * FROM ai_models WHERE enabled = 1 ORDER BY created_at DESC');
    const rows = stmt.all() as AIModelRow[];
    return rows.map(row => this.mapRowToModel(row));
  }

  getDefaultModel(): AIModel | undefined {
    const stmt = this.db.prepare('SELECT * FROM ai_models WHERE is_default = 1 AND enabled = 1');
    const row = stmt.get() as AIModelRow | undefined;
    return row ? this.mapRowToModel(row) : undefined;
  }

  getActiveModel(): AIModel | undefined {
    const defaultModel = this.getDefaultModel();
    if (defaultModel) return defaultModel;
    
    const enabledModels = this.getEnabledModels();
    return enabledModels[0];
  }

  setActiveModel(id: string): boolean {
    this.db.prepare('UPDATE ai_models SET is_default = 0').run();
    const stmt = this.db.prepare('UPDATE ai_models SET is_default = 1 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async fetchModelsFromProvider(provider: 'openai' | 'claude' | 'zhipu', apiKey?: string, baseUrl?: string): Promise<ProviderModel[]> {
    const key = apiKey || (provider === 'openai' ? process.env.OPENAI_API_KEY : provider === 'claude' ? process.env.ANTHROPIC_API_KEY : process.env.ZHIPU_API_KEY);
    if (!key) {
      throw new Error(`${provider} API key not configured`);
    }

    if (provider === 'openai') {
      const url = (baseUrl || 'https://api.openai.com/v1') + '/models';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch OpenAI models: ${error}`);
      }

      const data = await response.json() as {
        data: Array<{ id: string; created: number; description?: string }>;
      };

      return data.data
        .filter(m => m.id.startsWith('gpt-'))
        .map(m => ({
          id: m.id,
          name: m.id,
          created: m.created,
          description: m.description,
        }));
    }

    if (provider === 'claude') {
      const url = (baseUrl || 'https://api.anthropic.com/v1') + '/models';
      const response = await fetch(url, {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch Claude models: ${error}`);
      }

      const data = await response.json() as {
        data: Array<{ id: string; name: string; description?: string }>;
      };

      return data.data.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
      }));
    }

    if (provider === 'zhipu') {
      const url = (baseUrl || 'https://open.bigmodel.cn/api/paas/v4') + '/models';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch Zhipu AI models: ${error}`);
      }

      const data = await response.json() as {
        data: Array<{ id: string; created_at: number; description?: string }>;
      };

      return data.data.map(m => ({
        id: m.id,
        name: m.id,
        created: m.created_at,
        description: m.description,
      }));
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  async testProviderConnection(provider: 'openai' | 'claude' | 'zhipu', apiKey?: string, baseUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const models = await this.fetchModelsFromProvider(provider, apiKey, baseUrl);
      return {
        success: true,
        message: `Connected successfully. Found ${models.length} models.`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  updateModel(id: string, updates: Partial<Pick<AIModel, 'name' | 'model' | 'apiKey' | 'baseUrl' | 'isDefault' | 'enabled'>>): AIModel | undefined {
    const existing = this.getModel(id);
    if (!existing) return undefined;

    if (updates.isDefault) {
      this.db.prepare('UPDATE ai_models SET is_default = 0').run();
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.model !== undefined) { fields.push('model = ?'); values.push(updates.model); }
    if (updates.apiKey !== undefined) { fields.push('api_key = ?'); values.push(updates.apiKey); }
    if (updates.baseUrl !== undefined) { fields.push('base_url = ?'); values.push(updates.baseUrl); }
    if (updates.isDefault !== undefined) { fields.push('is_default = ?'); values.push(updates.isDefault ? 1 : 0); }
    if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled ? 1 : 0); }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`UPDATE ai_models SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getModel(id);
  }

  deleteModel(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM ai_models WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  recordTokenUsage(usage: Omit<TokenUsage, 'id' | 'createdAt'>): TokenUsage {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO token_usage (id, model_id, conversation_id, prompt_tokens, completion_tokens, total_tokens, cost, currency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      usage.modelId,
      usage.conversationId || null,
      usage.promptTokens,
      usage.completionTokens,
      usage.totalTokens,
      usage.cost,
      usage.currency,
      now
    );

    return { id, ...usage, createdAt: new Date(now) };
  }

  getTokenUsage(modelId?: string, startDate?: Date, endDate?: Date): TokenUsage[] {
    let sql = 'SELECT * FROM token_usage WHERE 1=1';
    const params: unknown[] = [];

    if (modelId) {
      sql += ' AND model_id = ?';
      params.push(modelId);
    }
    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate.toISOString());
    }
    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate.toISOString());
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as TokenUsageRow[];
    return rows.map(row => this.mapRowToTokenUsage(row));
  }

  getTokenStats(modelId?: string): { totalTokens: number; totalCost: number; count: number } {
    let sql = 'SELECT SUM(total_tokens) as total_tokens, SUM(cost) as total_cost, COUNT(*) as count FROM token_usage';
    const params: unknown[] = [];

    if (modelId) {
      sql += ' WHERE model_id = ?';
      params.push(modelId);
    }

    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params) as { total_tokens: number; total_cost: number; count: number } | undefined;

    return {
      totalTokens: row?.total_tokens || 0,
      totalCost: row?.total_cost || 0,
      count: row?.count || 0,
    };
  }

  createConversation(modelId: string, title?: string): Conversation {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO conversations (id, model_id, title, messages, created_at, updated_at)
      VALUES (?, ?, ?, '[]', ?, ?)
    `);

    stmt.run(id, modelId, title || null, now, now);

    return this.getConversation(id)!;
  }

  getConversation(id: string): Conversation | undefined {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
    const row = stmt.get(id) as ConversationRow | undefined;
    return row ? this.mapRowToConversation(row) : undefined;
  }

  updateConversation(id: string, messages: unknown[]): Conversation | undefined {
    const existing = this.getConversation(id);
    if (!existing) return undefined;

    const stmt = this.db.prepare(`
      UPDATE conversations SET messages = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(JSON.stringify(messages), new Date().toISOString(), id);

    return this.getConversation(id);
  }

  addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Prompt {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO prompts (id, name, content, model_id, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      prompt.name,
      prompt.content,
      prompt.modelId || null,
      prompt.isSystem ? 1 : 0,
      now,
      now
    );

    return this.getPrompt(id)!;
  }

  getPrompt(id: string): Prompt | undefined {
    const stmt = this.db.prepare('SELECT * FROM prompts WHERE id = ?');
    const row = stmt.get(id) as PromptRow | undefined;
    return row ? this.mapRowToPrompt(row) : undefined;
  }

  listPrompts(systemOnly = false): Prompt[] {
    let sql = 'SELECT * FROM prompts';
    if (systemOnly) {
      sql += ' WHERE is_system = 1';
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all() as PromptRow[];
    return rows.map(row => this.mapRowToPrompt(row));
  }

  private mapRowToModel(row: AIModelRow): AIModel {
    return {
      id: row.id,
      provider: row.provider as AIModel['provider'],
      name: row.name,
      model: row.model,
      type: row.type as AIModel['type'],
      apiKey: row.api_key || undefined,
      baseUrl: row.base_url || undefined,
      isDefault: row.is_default === 1,
      enabled: row.enabled === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToTokenUsage(row: TokenUsageRow): TokenUsage {
    return {
      id: row.id,
      modelId: row.model_id,
      conversationId: row.conversation_id || undefined,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      totalTokens: row.total_tokens,
      cost: row.cost,
      currency: row.currency,
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToConversation(row: ConversationRow): Conversation {
    return {
      id: row.id,
      modelId: row.model_id,
      title: row.title || undefined,
      messages: row.messages,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToPrompt(row: PromptRow): Prompt {
    return {
      id: row.id,
      name: row.name,
      content: row.content,
      modelId: row.model_id || undefined,
      isSystem: row.is_system === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

interface AIModelRow {
  id: string;
  provider: string;
  name: string;
  model: string;
  type: string;
  api_key: string | null;
  base_url: string | null;
  is_default: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

interface TokenUsageRow {
  id: string;
  model_id: string;
  conversation_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  currency: string;
  created_at: string;
}

interface ConversationRow {
  id: string;
  model_id: string;
  title: string | null;
  messages: string;
  created_at: string;
  updated_at: string;
}

interface PromptRow {
  id: string;
  name: string;
  content: string;
  model_id: string | null;
  is_system: number;
  created_at: string;
  updated_at: string;
}
