import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface DatabaseOptions {
  path?: string;
  wal?: boolean;
}

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(os.homedir(), '.privy-jiner', 'data', 'core.db');
  }

  initialize(options: DatabaseOptions = {}): Database.Database {
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

  getDatabase(): Database.Database {
    if (!this.db) {
      return this.initialize();
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private runMigrations(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
      );
    `);

    const migrations: Array<{ name: string; sql: string }> = [
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
      {
        name: '002_finance_schema',
        sql: `
          CREATE TABLE IF NOT EXISTS finance_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
            color TEXT DEFAULT '#888888',
            icon TEXT DEFAULT '💰',
            created_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS finance_transactions (
            id TEXT PRIMARY KEY,
            category_id TEXT REFERENCES finance_categories(id),
            amount REAL NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
            description TEXT,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS finance_budgets (
            id TEXT PRIMARY KEY,
            category_id TEXT REFERENCES finance_categories(id),
            amount REAL NOT NULL,
            period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_transactions_date ON finance_transactions(date);
          CREATE INDEX IF NOT EXISTS idx_transactions_category ON finance_transactions(category_id);
        `,
      },
      {
        name: '003_health_schema',
        sql: `
          CREATE TABLE IF NOT EXISTS health_water_logs (
            id TEXT PRIMARY KEY,
            amount INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS health_exercise_logs (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            duration INTEGER NOT NULL,
            calories INTEGER,
            steps INTEGER,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS health_goals (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            target INTEGER NOT NULL,
            period TEXT NOT NULL CHECK (period IN ('daily', 'weekly')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_water_date ON health_water_logs(date);
          CREATE INDEX IF NOT EXISTS idx_exercise_date ON health_exercise_logs(date);
        `,
      },
      {
        name: '004_finance_extended',
        sql: `
          CREATE TABLE IF NOT EXISTS finance_investments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('stock', 'fund', 'insurance', 'gold', 'other')),
            purchase_price REAL NOT NULL,
            current_price REAL NOT NULL,
            quantity REAL NOT NULL,
            purchase_date TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS finance_bills (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category_id TEXT REFERENCES finance_categories(id),
            amount REAL NOT NULL,
            due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 28),
            payment_method TEXT,
            next_due_date TEXT NOT NULL,
            last_paid_date TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS health_reminders (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('water', 'exercise', 'medicine', 'custom')),
            title TEXT NOT NULL,
            message TEXT,
            time TEXT NOT NULL,
            repeat TEXT CHECK (repeat IN ('once', 'daily', 'weekly')),
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_bills_due_date ON finance_bills(next_due_date);
        `,
      },
      {
        name: '005_fashion_schema',
        sql: `
          CREATE TABLE IF NOT EXISTS fashion_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear', 'other')),
            color TEXT,
            brand TEXT,
            purchase_date TEXT,
            purchase_price REAL,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS fashion_outfits (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            occasion TEXT CHECK (occasion IN ('casual', 'work', 'formal', 'sport', 'special')),
            weather TEXT,
            notes TEXT,
            created_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS fashion_outfit_items (
            outfit_id TEXT REFERENCES fashion_outfits(id) ON DELETE CASCADE,
            item_id TEXT REFERENCES fashion_items(id) ON DELETE CASCADE,
            PRIMARY KEY (outfit_id, item_id)
          );

          CREATE INDEX IF NOT EXISTS idx_fashion_items_category ON fashion_items(category);
          CREATE INDEX IF NOT EXISTS idx_fashion_outfits_date ON fashion_outfits(date);
        `,
      },
      {
        name: '006_knowledge_news_schema',
        sql: `
          CREATE TABLE IF NOT EXISTS knowledge_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL CHECK (category IN ('history', 'science', 'life', 'health', 'other')),
            source TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS news_articles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT NOT NULL CHECK (category IN ('tech', 'finance', 'sports', 'entertainment', 'world', 'other')),
            source TEXT,
            url TEXT,
            published_date TEXT,
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_items(category);
          CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
          CREATE INDEX IF NOT EXISTS idx_news_read ON news_articles(is_read);
        `,
      },
      {
        name: '007_personal_schedule',
        sql: `
          -- User Profile
          CREATE TABLE IF NOT EXISTS user_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            birthday TEXT,
            height REAL,
            weight REAL,
            blood_type TEXT CHECK (blood_type IN ('A', 'B', 'AB', 'O', 'unknown')),
            avatar TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          -- Health Metrics
          CREATE TABLE IF NOT EXISTS health_metrics (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('weight', 'blood_pressure', 'heart_rate', 'blood_sugar', 'temperature', 'custom')),
            value TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL
          );

          -- Contacts
          CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            birthday TEXT,
            address TEXT,
            company TEXT,
            title TEXT,
            group_id TEXT,
            avatar TEXT,
            notes TEXT,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS contact_groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#888888',
            created_at TEXT NOT NULL
          );

          -- Schedules
          CREATE TABLE IF NOT EXISTS schedules (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            start_time TEXT NOT NULL,
            end_time TEXT,
            all_day INTEGER NOT NULL DEFAULT 0,
            recurrence TEXT CHECK (recurrence IN (NULL, 'daily', 'weekly', 'monthly', 'yearly')),
            recurrence_end TEXT,
            color TEXT DEFAULT '#e8a854',
            is_completed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          -- Tasks
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
            due_date TEXT,
            completed_at TEXT,
            tags TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          -- Schedule Reminders
          CREATE TABLE IF NOT EXISTS schedule_reminders (
            id TEXT PRIMARY KEY,
            schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
            remind_at TEXT NOT NULL,
            is_sent INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
          );

          -- AI Config
          CREATE TABLE IF NOT EXISTS ai_config (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL CHECK (provider IN ('openai', 'claude', 'gemini', 'custom')),
            api_key TEXT,
            base_url TEXT,
            model TEXT,
            temperature REAL DEFAULT 0.7,
            max_tokens INTEGER DEFAULT 2048,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          -- Chat History
          CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            metadata TEXT,
            created_at TEXT NOT NULL
          );

          -- API Usage Tracking
          CREATE TABLE IF NOT EXISTS api_usage (
            id TEXT PRIMARY KEY,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER,
            response_time INTEGER,
            created_at TEXT NOT NULL
          );

          -- AI Usage Stats
          CREATE TABLE IF NOT EXISTS ai_usage (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            model TEXT,
            prompt_tokens INTEGER,
            completion_tokens INTEGER,
            total_tokens INTEGER,
            cost REAL,
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_contacts_group ON contacts(group_id);
          CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON contacts(birthday);
          CREATE INDEX IF NOT EXISTS idx_schedules_start ON schedules(start_time);
          CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
          CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
          CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_history(created_at);
          CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at);
          CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at);
        `,
      },
      {
        name: '008_ai_providers_update',
        sql: `
          -- Recreate ai_config table with more providers
          ALTER TABLE ai_config RENAME TO ai_config_old;
          
          CREATE TABLE ai_config (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL CHECK (provider IN ('openai', 'claude', 'gemini', 'custom', 'zhipu', 'minimax')),
            api_key TEXT,
            base_url TEXT,
            model TEXT,
            temperature REAL DEFAULT 0.7,
            max_tokens INTEGER DEFAULT 2048,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          
          INSERT INTO ai_config (id, provider, api_key, base_url, model, temperature, max_tokens, is_active, created_at, updated_at)
          SELECT id, provider, api_key, base_url, model, temperature, max_tokens, is_active, created_at, updated_at FROM ai_config_old;
          
          DROP TABLE ai_config_old;
        `,
      },
    ];

    const appliedStmt = this.db.prepare('SELECT name FROM migrations');
    const appliedRows = appliedStmt.all() as Array<{ name: string }>;
    const applied = new Set(appliedRows.map((r) => r.name));

    const insertStmt = this.db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)');

    for (const migration of migrations) {
      if (!applied.has(migration.name)) {
        this.db.exec(migration.sql);
        insertStmt.run(migration.name, new Date().toISOString());
      }
    }
  }

  backup(backupPath: string): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    this.db.backup(backupPath);
  }

  vacuum(): void {
    if (this.db) {
      this.db.exec('VACUUM');
    }
  }
}

export const databaseManager = new DatabaseManager();
