import Database from 'better-sqlite3';
export interface MemoryEntry {
    id: string;
    content: string;
    type: 'short_term' | 'long_term' | 'working';
    importance: number;
    createdAt: Date;
    accessedAt: Date;
    accessCount: number;
    metadata?: Record<string, unknown>;
}
export interface MemorySearchOptions {
    type?: MemoryEntry['type'][];
    minImportance?: number;
    limit?: number;
}
export declare class MemoryManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    add(content: string, type?: MemoryEntry['type'], importance?: number, metadata?: Record<string, unknown>): MemoryEntry;
    getById(id: string): MemoryEntry | undefined;
    update(id: string, updates: Partial<Pick<MemoryEntry, 'content' | 'type' | 'importance' | 'metadata'>>): MemoryEntry | undefined;
    delete(id: string): boolean;
    search(query: string, options?: MemorySearchOptions): MemoryEntry[];
    getRecent(type?: MemoryEntry['type'], limit?: number): MemoryEntry[];
    recordAccess(id: string): void;
    consolidateToLongTerm(id: string): MemoryEntry | undefined;
    clearShortTerm(): number;
    cleanupOldEntries(daysOld?: number): number;
    private mapRowToMemory;
}
//# sourceMappingURL=index.d.ts.map