import { v4 as uuidv4 } from 'uuid';
export class MemoryManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'short_term',
        importance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        accessed_at TEXT NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        metadata TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_importance ON memory(importance);
      CREATE INDEX IF NOT EXISTS idx_memory_accessed_at ON memory(accessed_at);

      CREATE TABLE IF NOT EXISTS memory_context (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (memory_id) REFERENCES memory(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_memory_context_session ON memory_context(session_id);
    `);
    }
    add(content, type = 'short_term', importance = 0, metadata) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO memory (id, content, type, importance, created_at, accessed_at, access_count, metadata)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `);
        stmt.run(id, content, type, importance, now, now, metadata ? JSON.stringify(metadata) : null);
        return this.getById(id);
    }
    getById(id) {
        const stmt = this.db.prepare('SELECT * FROM memory WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToMemory(row) : undefined;
    }
    update(id, updates) {
        const existing = this.getById(id);
        if (!existing)
            return undefined;
        const fields = [];
        const values = [];
        if (updates.content !== undefined) {
            fields.push('content = ?');
            values.push(updates.content);
        }
        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.importance !== undefined) {
            fields.push('importance = ?');
            values.push(updates.importance);
        }
        if (updates.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(JSON.stringify(updates.metadata));
        }
        fields.push('accessed_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = this.db.prepare(`UPDATE memory SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM memory WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    search(query, options) {
        let sql = 'SELECT * FROM memory WHERE 1=1';
        const params = [];
        if (query) {
            sql += ' AND content LIKE ?';
            params.push(`%${query}%`);
        }
        if (options?.type?.length) {
            sql += ` AND type IN (${options.type.map(() => '?').join(', ')})`;
            params.push(...options.type);
        }
        if (options?.minImportance !== undefined) {
            sql += ' AND importance >= ?';
            params.push(options.minImportance);
        }
        sql += ' ORDER BY importance DESC, accessed_at DESC';
        if (options?.limit) {
            sql += ' LIMIT ?';
            params.push(options.limit);
        }
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToMemory(row));
    }
    getRecent(type, limit = 10) {
        let sql = 'SELECT * FROM memory';
        const params = [];
        if (type) {
            sql += ' WHERE type = ?';
            params.push(type);
        }
        sql += ' ORDER BY accessed_at DESC LIMIT ?';
        params.push(limit);
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToMemory(row));
    }
    recordAccess(id) {
        const stmt = this.db.prepare(`
      UPDATE memory 
      SET accessed_at = ?, access_count = access_count + 1 
      WHERE id = ?
    `);
        stmt.run(new Date().toISOString(), id);
    }
    consolidateToLongTerm(id) {
        return this.update(id, { type: 'long_term' });
    }
    clearShortTerm() {
        const stmt = this.db.prepare("DELETE FROM memory WHERE type = 'short_term'");
        const result = stmt.run();
        return result.changes;
    }
    cleanupOldEntries(daysOld = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        const stmt = this.db.prepare(`
      DELETE FROM memory 
      WHERE type = 'short_term' 
      AND created_at < ?
      AND access_count < 3
    `);
        const result = stmt.run(cutoff.toISOString());
        return result.changes;
    }
    mapRowToMemory(row) {
        return {
            id: row.id,
            content: row.content,
            type: row.type,
            importance: row.importance,
            createdAt: new Date(row.created_at),
            accessedAt: new Date(row.accessed_at),
            accessCount: row.access_count,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }
}
//# sourceMappingURL=index.js.map