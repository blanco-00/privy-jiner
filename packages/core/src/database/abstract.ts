export interface DatabaseConfig {
  type: 'sqlite' | 'mysql' | 'postgresql';
  path?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface QueryResult {
  rows: unknown[];
  rowCount: number;
  lastInsertRowid?: number | bigint;
}

export interface DatabaseInterface {
  query(sql: string, params?: unknown[]): Promise<QueryResult>;
  run(sql: string, params?: unknown[]): Promise<QueryResult>;
  close(): Promise<void>;
  getType(): string;
}

export class SQLiteDatabase implements DatabaseInterface {
  private db: unknown;
  private path: string;

  constructor(config: { path: string }) {
    this.path = config.path;
  }

  async connect(): Promise<void> {
    const Database = (await import('better-sqlite3')).default;
    this.db = new Database(this.path);
    (this.db as { pragma: (s: string) => void }).pragma('journal_mode = WAL');
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const stmt = (this.db as { prepare: (s: string) => { all: (...params: unknown[]) => unknown[] } }).prepare(sql);
    const rows = stmt.all(...(params || []));
    return { rows, rowCount: rows.length };
  }

  async run(sql: string, params?: unknown[]): Promise<QueryResult> {
    const stmt = (this.db as { prepare: (s: string) => { run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint } } }).prepare(sql);
    const result = stmt.run(...(params || []));
    return {
      rows: [],
      rowCount: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  async close(): Promise<void> {
    (this.db as { close: () => void }).close();
  }

  getType(): string {
    return 'sqlite';
  }
}

export class MySQLDatabase implements DatabaseInterface {
  private pool: unknown;
  private config: { host: string; port: number; user: string; password: string; database: string };

  constructor(config: { host: string; port: number; user: string; password: string; database: string }) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const mysql = await import('mysql2/promise');
    this.pool = mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const [rows] = await (this.pool as { query: (sql: string, params?: unknown[]) => Promise<[unknown[], unknown]> }).query(sql, params);
    return { rows: rows as unknown[], rowCount: Array.isArray(rows) ? rows.length : 0 };
  }

  async run(sql: string, params?: unknown[]): Promise<QueryResult> {
    const [result] = await (this.pool as { query: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]> }).query(sql, params);
    const res = result as { affectedRows: number; insertId: number | bigint };
    return {
      rows: [],
      rowCount: res.affectedRows,
      lastInsertRowid: res.insertId,
    };
  }

  async close(): Promise<void> {
    await (this.pool as { end: () => Promise<void> }).end();
  }

  getType(): string {
    return 'mysql';
  }
}

export class PostgreSQLDatabase implements DatabaseInterface {
  private client: unknown;
  private config: { host: string; port: number; user: string; password: string; database: string };

  constructor(config: { host: string; port: number; user: string; password: string; database: string }) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });
    this.client = pool;
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const result = await (this.client as { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }> }).query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  }

  async run(sql: string, params?: unknown[]): Promise<QueryResult> {
    const result = await (this.client as { query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number }> }).query(sql, params);
    return { rows: [], rowCount: result.rowCount };
  }

  async close(): Promise<void> {
    await (this.client as { end: () => Promise<void> }).end();
  }

  getType(): string {
    return 'postgresql';
  }
}

export class DatabaseFactory {
  static create(config: DatabaseConfig): DatabaseInterface {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteDatabase({ path: config.path || ':memory:' });
      case 'mysql':
        return new MySQLDatabase({
          host: config.host || 'localhost',
          port: config.port || 3306,
          user: config.username || 'root',
          password: config.password || '',
          database: config.database || 'privy_jiner',
        });
      case 'postgresql':
        return new PostgreSQLDatabase({
          host: config.host || 'localhost',
          port: config.port || 5432,
          user: config.username || 'postgres',
          password: config.password || '',
          database: config.database || 'privy_jiner',
        });
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

export class DatabaseConnectionMonitor {
  private connections: Map<string, { status: 'connected' | 'disconnected' | 'error'; lastCheck: Date; error?: string }> = new Map();

  setStatus(id: string, status: 'connected' | 'disconnected' | 'error', error?: string): void {
    this.connections.set(id, { status, lastCheck: new Date(), error });
  }

  getStatus(id: string): { status: 'connected' | 'disconnected' | 'error'; lastCheck: Date; error?: string } | undefined {
    return this.connections.get(id);
  }

  getAllStatuses(): Map<string, { status: 'connected' | 'disconnected' | 'error'; lastCheck: Date; error?: string }> {
    return this.connections;
  }

  isConnected(id: string): boolean {
    const conn = this.connections.get(id);
    return conn?.status === 'connected';
  }
}
