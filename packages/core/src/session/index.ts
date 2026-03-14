import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}

export class SessionManager {
  private db: Database.Database;
  private defaultTTL = 7 * 24 * 60 * 60 * 1000;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `);
  }

  create(type: string, data: Record<string, unknown> = {}, ttl?: number): Session {
    const id = uuidv4();
    const now = new Date();
    const expiresAt = ttl ? new Date(now.getTime() + ttl) : new Date(now.getTime() + this.defaultTTL);

    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, type, data, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, type, JSON.stringify(data), now.toISOString(), expiresAt.toISOString());

    return {
      id,
      type,
      data,
      createdAt: now,
      expiresAt,
    };
  }

  get(id: string): Session | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE id = ? 
      AND (expires_at IS NULL OR expires_at > ?)
    `);

    const row = stmt.get(id, new Date().toISOString()) as SessionRow | undefined;
    return row ? this.mapRowToSession(row) : undefined;
  }

  update(id: string, data: Record<string, unknown>): Session | undefined {
    const existing = this.get(id);
    if (!existing) return undefined;

    const stmt = this.db.prepare('UPDATE sessions SET data = ? WHERE id = ?');
    stmt.run(JSON.stringify(data), id);

    return this.get(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getByType(type: string): Session[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE type = ?
      AND (expires_at IS NULL OR expires_at > ?)
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(type, new Date().toISOString()) as SessionRow[];
    return rows.map(row => this.mapRowToSession(row));
  }

  cleanup(): number {
    const stmt = this.db.prepare(`
      DELETE FROM sessions 
      WHERE expires_at IS NOT NULL AND expires_at < ?
    `);

    const result = stmt.run(new Date().toISOString());
    return result.changes;
  }

  deleteExpired(): number {
    return this.cleanup();
  }

  private mapRowToSession(row: SessionRow): Session {
    return {
      id: row.id,
      type: row.type,
      data: row.data ? JSON.parse(row.data) : {},
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    };
  }
}

interface SessionRow {
  id: string;
  type: string;
  data: string | null;
  created_at: string;
  expires_at: string | null;
}
