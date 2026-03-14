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
export declare class SQLiteDatabase implements DatabaseInterface {
    private db;
    private path;
    constructor(config: {
        path: string;
    });
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<QueryResult>;
    run(sql: string, params?: unknown[]): Promise<QueryResult>;
    close(): Promise<void>;
    getType(): string;
}
export declare class MySQLDatabase implements DatabaseInterface {
    private pool;
    private config;
    constructor(config: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    });
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<QueryResult>;
    run(sql: string, params?: unknown[]): Promise<QueryResult>;
    close(): Promise<void>;
    getType(): string;
}
export declare class PostgreSQLDatabase implements DatabaseInterface {
    private client;
    private config;
    constructor(config: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    });
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<QueryResult>;
    run(sql: string, params?: unknown[]): Promise<QueryResult>;
    close(): Promise<void>;
    getType(): string;
}
export declare class DatabaseFactory {
    static create(config: DatabaseConfig): DatabaseInterface;
}
//# sourceMappingURL=abstract.d.ts.map