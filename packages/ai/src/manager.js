import { v4 as uuidv4 } from 'uuid';
export class AIManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
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
    addModel(model) {
        const id = uuidv4();
        const now = new Date().toISOString();
        if (model.isDefault) {
            this.db.prepare('UPDATE ai_models SET is_default = 0').run();
        }
        const stmt = this.db.prepare(`
      INSERT INTO ai_models (id, provider, name, model, type, api_key, base_url, is_default, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, model.provider, model.name, model.model, model.type, model.apiKey || null, model.baseUrl || null, model.isDefault ? 1 : 0, model.enabled ? 1 : 0, now, now);
        return this.getModel(id);
    }
    getModel(id) {
        const stmt = this.db.prepare('SELECT * FROM ai_models WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToModel(row) : undefined;
    }
    listModels() {
        const stmt = this.db.prepare('SELECT * FROM ai_models ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToModel(row));
    }
    getEnabledModels() {
        const stmt = this.db.prepare('SELECT * FROM ai_models WHERE enabled = 1 ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToModel(row));
    }
    getDefaultModel() {
        const stmt = this.db.prepare('SELECT * FROM ai_models WHERE is_default = 1 AND enabled = 1');
        const row = stmt.get();
        return row ? this.mapRowToModel(row) : undefined;
    }
    updateModel(id, updates) {
        const existing = this.getModel(id);
        if (!existing)
            return undefined;
        if (updates.isDefault) {
            this.db.prepare('UPDATE ai_models SET is_default = 0').run();
        }
        const fields = [];
        const values = [];
        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.model !== undefined) {
            fields.push('model = ?');
            values.push(updates.model);
        }
        if (updates.apiKey !== undefined) {
            fields.push('api_key = ?');
            values.push(updates.apiKey);
        }
        if (updates.baseUrl !== undefined) {
            fields.push('base_url = ?');
            values.push(updates.baseUrl);
        }
        if (updates.isDefault !== undefined) {
            fields.push('is_default = ?');
            values.push(updates.isDefault ? 1 : 0);
        }
        if (updates.enabled !== undefined) {
            fields.push('enabled = ?');
            values.push(updates.enabled ? 1 : 0);
        }
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = this.db.prepare(`UPDATE ai_models SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getModel(id);
    }
    deleteModel(id) {
        const stmt = this.db.prepare('DELETE FROM ai_models WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    recordTokenUsage(usage) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO token_usage (id, model_id, conversation_id, prompt_tokens, completion_tokens, total_tokens, cost, currency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, usage.modelId, usage.conversationId || null, usage.promptTokens, usage.completionTokens, usage.totalTokens, usage.cost, usage.currency, now);
        return { id, ...usage, createdAt: new Date(now) };
    }
    getTokenUsage(modelId, startDate, endDate) {
        let sql = 'SELECT * FROM token_usage WHERE 1=1';
        const params = [];
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
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToTokenUsage(row));
    }
    getTokenStats(modelId) {
        let sql = 'SELECT SUM(total_tokens) as total_tokens, SUM(cost) as total_cost, COUNT(*) as count FROM token_usage';
        const params = [];
        if (modelId) {
            sql += ' WHERE model_id = ?';
            params.push(modelId);
        }
        const stmt = this.db.prepare(sql);
        const row = stmt.get(...params);
        return {
            totalTokens: row?.total_tokens || 0,
            totalCost: row?.total_cost || 0,
            count: row?.count || 0,
        };
    }
    createConversation(modelId, title) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO conversations (id, model_id, title, messages, created_at, updated_at)
      VALUES (?, ?, ?, '[]', ?, ?)
    `);
        stmt.run(id, modelId, title || null, now, now);
        return this.getConversation(id);
    }
    getConversation(id) {
        const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToConversation(row) : undefined;
    }
    updateConversation(id, messages) {
        const existing = this.getConversation(id);
        if (!existing)
            return undefined;
        const stmt = this.db.prepare(`
      UPDATE conversations SET messages = ?, updated_at = ? WHERE id = ?
    `);
        stmt.run(JSON.stringify(messages), new Date().toISOString(), id);
        return this.getConversation(id);
    }
    addPrompt(prompt) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO prompts (id, name, content, model_id, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, prompt.name, prompt.content, prompt.modelId || null, prompt.isSystem ? 1 : 0, now, now);
        return this.getPrompt(id);
    }
    getPrompt(id) {
        const stmt = this.db.prepare('SELECT * FROM prompts WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToPrompt(row) : undefined;
    }
    listPrompts(systemOnly = false) {
        let sql = 'SELECT * FROM prompts';
        if (systemOnly) {
            sql += ' WHERE is_system = 1';
        }
        sql += ' ORDER BY created_at DESC';
        const stmt = this.db.prepare(sql);
        const rows = stmt.all();
        return rows.map(row => this.mapRowToPrompt(row));
    }
    mapRowToModel(row) {
        return {
            id: row.id,
            provider: row.provider,
            name: row.name,
            model: row.model,
            type: row.type,
            apiKey: row.api_key || undefined,
            baseUrl: row.base_url || undefined,
            isDefault: row.is_default === 1,
            enabled: row.enabled === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToTokenUsage(row) {
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
    mapRowToConversation(row) {
        return {
            id: row.id,
            modelId: row.model_id,
            title: row.title || undefined,
            messages: row.messages,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToPrompt(row) {
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
//# sourceMappingURL=manager.js.map