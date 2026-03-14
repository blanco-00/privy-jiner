import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
export class DatabaseManager {
    db = null;
    dbPath;
    constructor(dbPath) {
        this.dbPath = dbPath || path.join(os.homedir(), '.privy-jiner', 'data', 'core.db');
    }
    initialize(options = {}) {
        if (this.db) {
            return this.db;
        }
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        this.db = new Database(this.dbPath);
        if (options.wal !== false) {
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('busy_timeout = 5000');
        }
        this.runMigrations();
        return this.db;
    }
    getDatabase() {
        if (!this.db) {
            return this.initialize();
        }
        return this.db;
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    runMigrations() {
        if (!this.db)
            return;
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
      );
    `);
        const migrations = [
            {
                name: '001_initial_schema',
                sql: `
          CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'idle',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            data TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT
          );

          CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        `,
            },
        ];
        const appliedStmt = this.db.prepare('SELECT name FROM migrations');
        const appliedRows = appliedStmt.all();
        const applied = new Set(appliedRows.map((r) => r.name));
        const insertStmt = this.db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)');
        for (const migration of migrations) {
            if (!applied.has(migration.name)) {
                this.db.exec(migration.sql);
                insertStmt.run(migration.name, new Date().toISOString());
            }
        }
    }
    backup(backupPath) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        this.db.backup(backupPath);
    }
    vacuum() {
        if (this.db) {
            this.db.exec('VACUUM');
        }
    }
}
export const databaseManager = new DatabaseManager();
//# sourceMappingURL=index.js.map