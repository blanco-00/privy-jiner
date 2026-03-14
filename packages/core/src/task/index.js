import { v4 as uuidv4 } from 'uuid';
export class TaskManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        archived_at TEXT,
        expires_at TEXT,
        metadata TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_expires_at ON tasks(expires_at);
    `);
    }
    create(title, description, priority) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `);
        stmt.run(id, title, description || null, priority || null, now, now);
        return this.getById(id);
    }
    getById(id) {
        const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToTask(row) : undefined;
    }
    update(id, updates) {
        const existing = this.getById(id);
        if (!existing)
            return undefined;
        const fields = [];
        const values = [];
        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.status !== undefined) {
            fields.push('status = ?');
            values.push(updates.status);
            if (updates.status === 'completed') {
                fields.push('completed_at = ?');
                values.push(new Date().toISOString());
            }
            if (updates.status === 'archived') {
                fields.push('archived_at = ?');
                values.push(new Date().toISOString());
            }
        }
        if (updates.priority !== undefined) {
            fields.push('priority = ?');
            values.push(updates.priority);
        }
        if (updates.expiresAt !== undefined) {
            fields.push('expires_at = ?');
            values.push(updates.expiresAt.toISOString());
        }
        if (updates.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(JSON.stringify(updates.metadata));
        }
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = this.db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    list(filter) {
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];
        if (filter?.status?.length) {
            query += ` AND status IN (${filter.status.map(() => '?').join(', ')})`;
            params.push(...filter.status);
        }
        if (filter?.priority?.length) {
            query += ` AND priority IN (${filter.priority.map(() => '?').join(', ')})`;
            params.push(...filter.priority);
        }
        if (filter?.createdAfter) {
            query += ' AND created_at >= ?';
            params.push(filter.createdAfter.toISOString());
        }
        if (filter?.createdBefore) {
            query += ' AND created_at <= ?';
            params.push(filter.createdBefore.toISOString());
        }
        query += ' ORDER BY created_at DESC';
        if (filter?.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            if (filter?.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToTask(row));
    }
    archive(id) {
        return this.update(id, { status: 'archived' });
    }
    complete(id) {
        return this.update(id, { status: 'completed' });
    }
    fail(id) {
        return this.update(id, { status: 'failed' });
    }
    getPending() {
        return this.list({ status: ['pending'] });
    }
    getInProgress() {
        return this.list({ status: ['in_progress'] });
    }
    mapRowToTask(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description || undefined,
            status: row.status,
            priority: row.priority,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
            archivedAt: row.archived_at ? new Date(row.archived_at) : undefined,
            expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }
}
//# sourceMappingURL=index.js.map