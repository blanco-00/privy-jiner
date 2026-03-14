import Database from 'better-sqlite3';
export interface Session {
    id: string;
    type: string;
    data: Record<string, unknown>;
    createdAt: Date;
    expiresAt?: Date;
}
export declare class SessionManager {
    private db;
    private defaultTTL;
    constructor(db: Database.Database);
    private initSchema;
    create(type: string, data?: Record<string, unknown>, ttl?: number): Session;
    get(id: string): Session | undefined;
    update(id: string, data: Record<string, unknown>): Session | undefined;
    delete(id: string): boolean;
    getByType(type: string): Session[];
    cleanup(): number;
    deleteExpired(): number;
    private mapRowToSession;
}
//# sourceMappingURL=index.d.ts.map