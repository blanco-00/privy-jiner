import Database from 'better-sqlite3';
export interface DatabaseOptions {
    path?: string;
    wal?: boolean;
}
export declare class DatabaseManager {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    initialize(options?: DatabaseOptions): Database.Database;
    getDatabase(): Database.Database;
    close(): void;
    private runMigrations;
    backup(backupPath: string): void;
    vacuum(): void;
}
export declare const databaseManager: DatabaseManager;
//# sourceMappingURL=index.d.ts.map