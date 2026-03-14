"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsManager = void 0;
const uuid_1 = require("uuid");
class NewsManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        url TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        category TEXT NOT NULL,
        published_at TEXT NOT NULL,
        fetched_at TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        archived INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS news_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        last_fetched_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reading_history (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        read_at TEXT NOT NULL,
        duration INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
      CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at);
    `);
    }
    addArticle(article) {
        const existing = this.db.prepare('SELECT id FROM news_articles WHERE url = ?').get(article.url);
        if (existing) {
            return this.getArticle(existing.id);
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO news_articles (id, title, content, summary, url, source, category, published_at, fetched_at, read, archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
        stmt.run(id, article.title, article.content, article.summary || null, article.url, article.source, article.category, article.publishedAt.toISOString(), now);
        return this.getArticle(id);
    }
    getArticle(id) {
        const stmt = this.db.prepare('SELECT * FROM news_articles WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToArticle(row) : undefined;
    }
    listArticles(filter) {
        let sql = 'SELECT * FROM news_articles WHERE 1=1';
        const params = [];
        if (filter?.category) {
            sql += ' AND category = ?';
            params.push(filter.category);
        }
        if (filter?.source) {
            sql += ' AND source = ?';
            params.push(filter.source);
        }
        if (filter?.read !== undefined) {
            sql += ' AND read = ?';
            params.push(filter.read ? 1 : 0);
        }
        if (filter?.archived !== undefined) {
            sql += ' AND archived = ?';
            params.push(filter.archived ? 1 : 0);
        }
        sql += ' ORDER BY published_at DESC';
        if (filter?.limit) {
            sql += ' LIMIT ?';
            params.push(filter.limit);
            if (filter?.offset) {
                sql += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToArticle(row));
    }
    markAsRead(id) {
        const stmt = this.db.prepare('UPDATE news_articles SET read = 1 WHERE id = ?');
        stmt.run(id);
        const historyStmt = this.db.prepare(`
      INSERT INTO reading_history (id, article_id, read_at)
      VALUES (?, ?, ?)
    `);
        historyStmt.run((0, uuid_1.v4)(), id, new Date().toISOString());
        return this.getArticle(id);
    }
    archiveArticle(id) {
        const stmt = this.db.prepare('UPDATE news_articles SET archived = 1 WHERE id = ?');
        stmt.run(id);
        return this.getArticle(id);
    }
    deleteArticle(id) {
        const stmt = this.db.prepare('DELETE FROM news_articles WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    cleanupOldArticles(daysToKeep = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);
        const stmt = this.db.prepare(`
      DELETE FROM news_articles 
      WHERE archived = 1 AND fetched_at < ?
    `);
        const result = stmt.run(cutoff.toISOString());
        return result.changes;
    }
    addSource(source) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO news_sources (id, name, url, category, enabled, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, source.name, source.url, source.category, source.enabled ? 1 : 0, now);
        return this.getSource(id);
    }
    getSource(id) {
        const stmt = this.db.prepare('SELECT * FROM news_sources WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToSource(row) : undefined;
    }
    listSources(enabledOnly = false) {
        let sql = 'SELECT * FROM news_sources';
        if (enabledOnly) {
            sql += ' WHERE enabled = 1';
        }
        sql += ' ORDER BY name ASC';
        const stmt = this.db.prepare(sql);
        const rows = stmt.all();
        return rows.map(row => this.mapRowToSource(row));
    }
    updateSource(id, updates) {
        const existing = this.getSource(id);
        if (!existing)
            return undefined;
        const fields = [];
        const values = [];
        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.url !== undefined) {
            fields.push('url = ?');
            values.push(updates.url);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.enabled !== undefined) {
            fields.push('enabled = ?');
            values.push(updates.enabled ? 1 : 0);
        }
        values.push(id);
        const stmt = this.db.prepare(`UPDATE news_sources SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getSource(id);
    }
    markSourceFetched(id) {
        const stmt = this.db.prepare('UPDATE news_sources SET last_fetched_at = ? WHERE id = ?');
        stmt.run(new Date().toISOString(), id);
    }
    deleteSource(id) {
        const stmt = this.db.prepare('DELETE FROM news_sources WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    setPreference(key, value) {
        const now = new Date().toISOString();
        const existing = this.db.prepare('SELECT key FROM user_preferences WHERE key = ?').get(key);
        if (existing) {
            this.db.prepare('UPDATE user_preferences SET value = ?, updated_at = ? WHERE key = ?').run(value, now, key);
        }
        else {
            this.db.prepare('INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?)').run(key, value, now);
        }
        return { key, value, updatedAt: new Date(now) };
    }
    getPreference(key) {
        const stmt = this.db.prepare('SELECT * FROM user_preferences WHERE key = ?');
        const row = stmt.get(key);
        return row ? this.mapRowToPreference(row) : undefined;
    }
    getAllPreferences() {
        const stmt = this.db.prepare('SELECT * FROM user_preferences');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToPreference(row));
    }
    getReadingHistory(limit = 50) {
        const stmt = this.db.prepare('SELECT * FROM reading_history ORDER BY read_at DESC LIMIT ?');
        const rows = stmt.all(limit);
        return rows.map(row => ({
            id: row.id,
            articleId: row.article_id,
            readAt: new Date(row.read_at),
            duration: row.duration || undefined,
        }));
    }
    mapRowToArticle(row) {
        return {
            id: row.id,
            title: row.title,
            content: row.content,
            summary: row.summary || undefined,
            url: row.url,
            source: row.source,
            category: row.category,
            publishedAt: new Date(row.published_at),
            fetchedAt: new Date(row.fetched_at),
            read: row.read === 1,
            archived: row.archived === 1,
        };
    }
    mapRowToSource(row) {
        return {
            id: row.id,
            name: row.name,
            url: row.url,
            category: row.category,
            enabled: row.enabled === 1,
            lastFetchedAt: row.last_fetched_at ? new Date(row.last_fetched_at) : undefined,
            createdAt: new Date(row.created_at),
        };
    }
    mapRowToPreference(row) {
        return {
            key: row.key,
            value: row.value,
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.NewsManager = NewsManager;
//# sourceMappingURL=index.js.map