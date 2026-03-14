import { v4 as uuidv4 } from 'uuid';

export interface AIConfig {
  id: string;
  provider: 'openai' | 'claude' | 'gemini' | 'custom';
  api_key: string | null;
  base_url: string | null;
  model: string | null;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: string | null;
  created_at: string;
}

export class AIService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  getConfig(): AIConfig | null {
    return this.db.prepare('SELECT * FROM ai_config WHERE is_active = 1 LIMIT 1').get() as AIConfig | null;
  }

  saveConfig(data: { provider: string; api_key?: string; base_url?: string; model?: string; temperature?: number; max_tokens?: number }): AIConfig {
    const existing = this.getConfig();
    const now = new Date().toISOString();

    if (existing) {
      const fields: string[] = ['provider = ?', 'updated_at = ?'];
      const values: any[] = [data.provider, now];

      if (data.api_key !== undefined) { fields.push('api_key = ?'); values.push(data.api_key || null); }
      if (data.base_url !== undefined) { fields.push('base_url = ?'); values.push(data.base_url || null); }
      if (data.model !== undefined) { fields.push('model = ?'); values.push(data.model || null); }
      if (data.temperature !== undefined) { fields.push('temperature = ?'); values.push(data.temperature); }
      if (data.max_tokens !== undefined) { fields.push('max_tokens = ?'); values.push(data.max_tokens); }

      values.push(existing.id);
      this.db.prepare(`UPDATE ai_config SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    } else {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO ai_config (id, provider, api_key, base_url, model, temperature, max_tokens, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(id, data.provider, data.api_key || null, data.base_url || null, data.model || null, data.temperature || 0.7, data.max_tokens || 2048, now, now);
    }

    return this.getConfig()!;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config || !config.api_key) {
      return { success: false, message: 'No API key configured' };
    }

    return { success: true, message: 'Connection test not implemented - requires actual API call' };
  }

  addChatMessage(role: 'user' | 'assistant' | 'system', content: string, metadata?: any): ChatMessage {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO chat_history (id, role, content, metadata, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, role, content, metadata ? JSON.stringify(metadata) : null, now);

    return this.db.prepare('SELECT * FROM chat_history WHERE id = ?').get(id) as ChatMessage;
  }

  getChatHistory(limit = 50): ChatMessage[] {
    return this.db.prepare('SELECT * FROM chat_history ORDER BY created_at DESC LIMIT ?').all(limit) as ChatMessage[];
  }

  clearChatHistory(): void {
    this.db.prepare('DELETE FROM chat_history').run();
  }

  async sendMessage(content: string): Promise<string> {
    const config = this.getConfig();
    if (!config) {
      return 'AI not configured. Please set up your AI provider in Settings.';
    }

    this.addChatMessage('user', content);

    const response = 'AI response simulation - This is where the actual AI API call would happen.';

    this.addChatMessage('assistant', response);

    this.recordAIUsage(config.provider, config.model, 10, 20, 30, 0.001);

    return response;
  }

  recordAIUsage(provider: string, model: string | null, promptTokens: number, completionTokens: number, totalTokens: number, cost: number): void {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO ai_usage (id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, provider, model || null, promptTokens, completionTokens, totalTokens, cost, now);
  }

  getAIUsageStats(days = 7): { totalCalls: number; totalTokens: number; totalCost: number } {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_calls,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost), 0) as total_cost
      FROM ai_usage
      WHERE created_at >= ?
    `).get(sinceStr) as { total_calls: number; total_tokens: number; total_cost: number };

    return { totalCalls: stats.total_calls, totalTokens: stats.total_tokens, totalCost: stats.total_cost };
  }
}
