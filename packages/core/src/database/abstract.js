export class SQLiteDatabase {
    db;
    path;
    constructor(config) {
        this.path = config.path;
    }
    async connect() {
        const Database = (await import('better-sqlite3')).default;
        this.db = new Database(this.path);
        this.db.pragma('journal_mode = WAL');
    }
    async query(sql, params) {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...(params || []));
        return { rows, rowCount: rows.length };
    }
    async run(sql, params) {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...(params || []));
        return {
            rows: [],
            rowCount: result.changes,
            lastInsertRowid: result.lastInsertRowid,
        };
    }
    async close() {
        this.db.close();
    }
    getType() {
        return 'sqlite';
    }
}
export class MySQLDatabase {
    pool;
    config;
    constructor(config) {
        this.config = config;
    }
    async connect() {
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
    async query(sql, params) {
        const [rows] = await this.pool.query(sql, params);
        return { rows: rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
    }
    async run(sql, params) {
        const [result] = await this.pool.query(sql, params);
        const res = result;
        return {
            rows: [],
            rowCount: res.affectedRows,
            lastInsertRowid: res.insertId,
        };
    }
    async close() {
        await this.pool.end();
    }
    getType() {
        return 'mysql';
    }
}
export class PostgreSQLDatabase {
    client;
    config;
    constructor(config) {
        this.config = config;
    }
    async connect() {
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
    async query(sql, params) {
        const result = await this.client.query(sql, params);
        return { rows: result.rows, rowCount: result.rowCount };
    }
    async run(sql, params) {
        const result = await this.client.query(sql, params);
        return { rows: [], rowCount: result.rowCount };
    }
    async close() {
        await this.client.end();
    }
    getType() {
        return 'postgresql';
    }
}
export class DatabaseFactory {
    static create(config) {
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
//# sourceMappingURL=abstract.js.map