import { v4 as uuidv4 } from 'uuid';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'science' | 'life' | 'health' | 'other';
  source: string | null;
  created_at: string;
  updated_at: string;
}

export class KnowledgeService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  createItem(data: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'>): KnowledgeItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO knowledge_items (id, title, content, category, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.content, data.category, data.source || null, now, now);

    return this.getItem(id)!;
  }

  getItem(id: string): KnowledgeItem | null {
    return this.db.prepare('SELECT * FROM knowledge_items WHERE id = ?').get(id) as KnowledgeItem | null;
  }

  getItems(category?: string): KnowledgeItem[] {
    if (category) {
      return this.db.prepare('SELECT * FROM knowledge_items WHERE category = ? ORDER BY created_at DESC').all(category) as KnowledgeItem[];
    }
    return this.db.prepare('SELECT * FROM knowledge_items ORDER BY created_at DESC').all() as KnowledgeItem[];
  }

  searchItems(query: string): KnowledgeItem[] {
    const searchTerm = `%${query}%`;
    return this.db.prepare(`
      SELECT * FROM knowledge_items
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm) as KnowledgeItem[];
  }

  getRandomItem(category?: string): KnowledgeItem | null {
    if (category) {
      return this.db.prepare(`
        SELECT * FROM knowledge_items WHERE category = ? ORDER BY RANDOM() LIMIT 1
      `).get(category) as KnowledgeItem | null;
    }
    return this.db.prepare(`
      SELECT * FROM knowledge_items ORDER BY RANDOM() LIMIT 1
    `).get() as KnowledgeItem | null;
  }

  updateItem(id: string, data: Partial<Omit<KnowledgeItem, 'id' | 'created_at'>>): KnowledgeItem | null {
    const existing = this.getItem(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE knowledge_items
      SET title = ?, content = ?, category = ?, source = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.title ?? existing.title,
      data.content ?? existing.content,
      data.category ?? existing.category,
      data.source ?? existing.source,
      now,
      id
    );

    return this.getItem(id);
  }

  deleteItem(id: string): boolean {
    const result = this.db.prepare('DELETE FROM knowledge_items WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
