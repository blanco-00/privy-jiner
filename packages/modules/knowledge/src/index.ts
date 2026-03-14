import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface PushSchedule {
  id: string;
  name: string;
  categoryId?: string;
  time: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushHistory {
  id: string;
  entryId: string;
  scheduledId?: string;
  pushedAt: Date;
  status: 'success' | 'failed' | 'skipped';
}

export class KnowledgeManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
    this.initDefaultCategories();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS push_schedules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT,
        time TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS push_history (
        id TEXT PRIMARY KEY,
        entry_id TEXT NOT NULL,
        scheduled_id TEXT,
        pushed_at TEXT NOT NULL,
        status TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_entries(category);
    `);
  }

  private initDefaultCategories(): void {
    const defaults = [
      { name: 'Psychology', color: '#FF6B6B' },
      { name: 'History', color: '#4ECDC4' },
      { name: 'Science', color: '#45B7D1' },
      { name: 'Technology', color: '#96CEB4' },
      { name: 'Culture', color: '#FFEAA7' },
      { name: 'Health', color: '#DDA0DD' },
      { name: 'Finance', color: '#98D8C8' },
      { name: 'Relationships', color: '#F7DC6F' },
    ];

    const existing = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_categories WHERE is_default = 1').get() as { count: number };
    if (existing.count > 0) return;

    const now = new Date().toISOString();
    for (const cat of defaults) {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO knowledge_categories (id, name, color, is_default, created_at)
        VALUES (?, ?, ?, 1, ?)
      `).run(id, cat.name, cat.color, now);
    }
  }

  addEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeEntry {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO knowledge_entries (id, title, content, category, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      entry.title,
      entry.content,
      entry.category,
      entry.tags ? JSON.stringify(entry.tags) : null,
      now,
      now
    );

    return this.getEntry(id)!;
  }

  getEntry(id: string): KnowledgeEntry | undefined {
    const stmt = this.db.prepare('SELECT * FROM knowledge_entries WHERE id = ?');
    const row = stmt.get(id) as KnowledgeEntryRow | undefined;
    return row ? this.mapRowToEntry(row) : undefined;
  }

  listEntries(filter?: { category?: string; tag?: string; limit?: number }): KnowledgeEntry[] {
    let sql = 'SELECT * FROM knowledge_entries WHERE 1=1';
    const params: unknown[] = [];

    if (filter?.category) {
      sql += ' AND category = ?';
      params.push(filter.category);
    }
    if (filter?.tag) {
      sql += ' AND tags LIKE ?';
      params.push(`%${filter.tag}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filter?.limit) {
      sql += ' LIMIT ?';
      params.push(filter.limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as KnowledgeEntryRow[];
    return rows.map(row => this.mapRowToEntry(row));
  }

  updateEntry(id: string, updates: Partial<Pick<KnowledgeEntry, 'title' | 'content' | 'category' | 'tags'>>): KnowledgeEntry | undefined {
    const existing = this.getEntry(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`UPDATE knowledge_entries SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getEntry(id);
  }

  deleteEntry(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM knowledge_entries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  addCategory(category: Omit<KnowledgeCategory, 'id' | 'createdAt' | 'isDefault'>): KnowledgeCategory {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO knowledge_categories (id, name, description, color, is_default, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    stmt.run(id, category.name, category.description || null, category.color || null, now);

    return this.getCategory(id)!;
  }

  getCategory(id: string): KnowledgeCategory | undefined {
    const stmt = this.db.prepare('SELECT * FROM knowledge_categories WHERE id = ?');
    const row = stmt.get(id) as KnowledgeCategoryRow | undefined;
    return row ? this.mapRowToCategory(row) : undefined;
  }

  listCategories(): KnowledgeCategory[] {
    const stmt = this.db.prepare('SELECT * FROM knowledge_categories ORDER BY is_default DESC, name ASC');
    const rows = stmt.all() as KnowledgeCategoryRow[];
    return rows.map(row => this.mapRowToCategory(row));
  }

  createSchedule(schedule: Omit<PushSchedule, 'id' | 'createdAt' | 'updatedAt'>): PushSchedule {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO push_schedules (id, name, category_id, time, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      schedule.name,
      schedule.categoryId || null,
      schedule.time,
      schedule.enabled ? 1 : 0,
      now,
      now
    );

    return this.getSchedule(id)!;
  }

  getSchedule(id: string): PushSchedule | undefined {
    const stmt = this.db.prepare('SELECT * FROM push_schedules WHERE id = ?');
    const row = stmt.get(id) as PushScheduleRow | undefined;
    return row ? this.mapRowToSchedule(row) : undefined;
  }

  listSchedules(enabledOnly = false): PushSchedule[] {
    let sql = 'SELECT * FROM push_schedules';
    if (enabledOnly) {
      sql += ' WHERE enabled = 1';
    }
    sql += ' ORDER BY time ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all() as PushScheduleRow[];
    return rows.map(row => this.mapRowToSchedule(row));
  }

  toggleSchedule(id: string, enabled: boolean): PushSchedule | undefined {
    const stmt = this.db.prepare('UPDATE push_schedules SET enabled = ?, updated_at = ? WHERE id = ?');
    stmt.run(enabled ? 1 : 0, new Date().toISOString(), id);
    return this.getSchedule(id);
  }

  recordPush(entryId: string, scheduleId: string | undefined, status: PushHistory['status']): PushHistory {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO push_history (id, entry_id, scheduled_id, pushed_at, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, entryId, scheduleId || null, now, status);

    return { id, entryId, scheduledId: scheduleId, pushedAt: new Date(now), status };
  }

  getPushHistory(limit = 50): PushHistory[] {
    const stmt = this.db.prepare('SELECT * FROM push_history ORDER BY pushed_at DESC LIMIT ?');
    const rows = stmt.all(limit) as PushHistoryRow[];
    return rows.map(row => this.mapRowToPushHistory(row));
  }

  getRandomEntry(category?: string): KnowledgeEntry | undefined {
    let sql = 'SELECT * FROM knowledge_entries';
    const params: unknown[] = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' ORDER BY RANDOM() LIMIT 1';

    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params) as KnowledgeEntryRow | undefined;
    return row ? this.mapRowToEntry(row) : undefined;
  }

  private mapRowToEntry(row: KnowledgeEntryRow): KnowledgeEntry {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToCategory(row: KnowledgeCategoryRow): KnowledgeCategory {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      color: row.color || undefined,
      isDefault: row.is_default === 1,
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToSchedule(row: PushScheduleRow): PushSchedule {
    return {
      id: row.id,
      name: row.name,
      categoryId: row.category_id || undefined,
      time: row.time,
      enabled: row.enabled === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToPushHistory(row: PushHistoryRow): PushHistory {
    return {
      id: row.id,
      entryId: row.entry_id,
      scheduledId: row.scheduled_id || undefined,
      pushedAt: new Date(row.pushed_at),
      status: row.status as PushHistory['status'],
    };
  }
}

interface KnowledgeEntryRow {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

interface KnowledgeCategoryRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_default: number;
  created_at: string;
}

interface PushScheduleRow {
  id: string;
  name: string;
  category_id: string | null;
  time: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

interface PushHistoryRow {
  id: string;
  entry_id: string;
  scheduled_id: string | null;
  pushed_at: string;
  status: string;
}
