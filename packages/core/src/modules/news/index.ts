import { v4 as uuidv4 } from 'uuid';

export interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  category: 'tech' | 'finance' | 'sports' | 'entertainment' | 'world' | 'other';
  source: string | null;
  url: string | null;
  published_date: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export class NewsService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  createArticle(data: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>): NewsArticle {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO news_articles (id, title, content, category, source, url, published_date, is_read, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.content || null, data.category, data.source || null, data.url || null, data.published_date || null, data.is_read ? 1 : 0, now, now);

    return this.getArticle(id)!;
  }

  getArticle(id: string): NewsArticle | null {
    const article = this.db.prepare('SELECT * FROM news_articles WHERE id = ?').get(id) as any;
    if (!article) return null;
    return { ...article, is_read: !!article.is_read };
  }

  getArticles(options: { category?: string; is_read?: boolean; limit?: number; offset?: number } = {}): NewsArticle[] {
    let sql = 'SELECT * FROM news_articles WHERE 1=1';
    const params: any[] = [];

    if (options.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }
    if (options.is_read !== undefined) {
      sql += ' AND is_read = ?';
      params.push(options.is_read ? 1 : 0);
    }

    sql += ' ORDER BY published_date DESC, created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const articles = this.db.prepare(sql).all(...params) as any[];
    return articles.map(a => ({ ...a, is_read: !!a.is_read }));
  }

  searchArticles(query: string): NewsArticle[] {
    const searchTerm = `%${query}%`;
    const articles = this.db.prepare(`
      SELECT * FROM news_articles
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY published_date DESC
    `).all(searchTerm, searchTerm) as any[];
    return articles.map(a => ({ ...a, is_read: !!a.is_read }));
  }

  markAsRead(id: string): NewsArticle | null {
    const article = this.getArticle(id);
    if (!article) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE news_articles SET is_read = 1, updated_at = ? WHERE id = ?
    `).run(now, id);

    return this.getArticle(id);
  }

  updateArticle(id: string, data: Partial<Omit<NewsArticle, 'id' | 'created_at'>>): NewsArticle | null {
    const existing = this.getArticle(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE news_articles
      SET title = ?, content = ?, category = ?, source = ?, url = ?, published_date = ?, is_read = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.title ?? existing.title,
      data.content ?? existing.content,
      data.category ?? existing.category,
      data.source ?? existing.source,
      data.url ?? existing.url,
      data.published_date ?? existing.published_date,
      data.is_read !== undefined ? (data.is_read ? 1 : 0) : (existing.is_read ? 1 : 0),
      now,
      id
    );

    return this.getArticle(id);
  }

  deleteArticle(id: string): boolean {
    const result = this.db.prepare('DELETE FROM news_articles WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getUnreadCount(category?: string): number {
    let sql = 'SELECT COUNT(*) as count FROM news_articles WHERE is_read = 0';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    const result = this.db.prepare(sql).get(...params) as { count: number };
    return result.count;
  }
}
