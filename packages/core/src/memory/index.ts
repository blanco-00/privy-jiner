import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'short_term' | 'long_term' | 'working';
  importance: number;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchOptions {
  type?: MemoryEntry['type'][];
  minImportance?: number;
  limit?: number;
}

export class MemoryManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
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

  add(content: string, type: MemoryEntry['type'] = 'short_term', importance = 0, metadata?: Record<string, unknown>): MemoryEntry {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO memory (id, content, type, importance, created_at, accessed_at, access_count, metadata)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `);

    stmt.run(id, content, type, importance, now, now, metadata ? JSON.stringify(metadata) : null);

    return this.getById(id)!;
  }

  getById(id: string): MemoryEntry | undefined {
    const stmt = this.db.prepare('SELECT * FROM memory WHERE id = ?');
    const row = stmt.get(id) as MemoryRow | undefined;
    return row ? this.mapRowToMemory(row) : undefined;
  }

  update(id: string, updates: Partial<Pick<MemoryEntry, 'content' | 'type' | 'importance' | 'metadata'>>): MemoryEntry | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: unknown[] = [];

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

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM memory WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  search(query: string, options?: MemorySearchOptions): MemoryEntry[] {
    let sql = 'SELECT * FROM memory WHERE 1=1';
    const params: unknown[] = [];

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
    const rows = stmt.all(...params) as MemoryRow[];
    return rows.map(row => this.mapRowToMemory(row));
  }

  getRecent(type?: MemoryEntry['type'], limit = 10): MemoryEntry[] {
    let sql = 'SELECT * FROM memory';
    const params: unknown[] = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY accessed_at DESC LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as MemoryRow[];
    return rows.map(row => this.mapRowToMemory(row));
  }

  recordAccess(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE memory 
      SET accessed_at = ?, access_count = access_count + 1 
      WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), id);
  }

  consolidateToLongTerm(id: string): MemoryEntry | undefined {
    return this.update(id, { type: 'long_term' });
  }

  clearShortTerm(): number {
    const stmt = this.db.prepare("DELETE FROM memory WHERE type = 'short_term'");
    const result = stmt.run();
    return result.changes;
  }

  cleanupOldEntries(daysOld = 30): number {
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

  private mapRowToMemory(row: MemoryRow): MemoryEntry {
    return {
      id: row.id,
      content: row.content,
      type: row.type as MemoryEntry['type'],
      importance: row.importance,
      createdAt: new Date(row.created_at),
      accessedAt: new Date(row.accessed_at),
      accessCount: row.access_count,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}

interface MemoryRow {
  id: string;
  content: string;
  type: string;
  importance: number;
  created_at: string;
  accessed_at: string;
  access_count: number;
  metadata: string | null;
}
