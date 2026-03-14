import Database from 'better-sqlite3';
export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface KnowledgeCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    isDefault: boolean;
    createdAt: Date;
}
export interface PushSchedule {
    id: string;
    name: string;
    categoryId?: string;
    time: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PushHistory {
    id: string;
    entryId: string;
    scheduledId?: string;
    pushedAt: Date;
    status: 'success' | 'failed' | 'skipped';
}
export declare class KnowledgeManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    private initDefaultCategories;
    addEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeEntry;
    getEntry(id: string): KnowledgeEntry | undefined;
    listEntries(filter?: {
        category?: string;
        tag?: string;
        limit?: number;
    }): KnowledgeEntry[];
    updateEntry(id: string, updates: Partial<Pick<KnowledgeEntry, 'title' | 'content' | 'category' | 'tags'>>): KnowledgeEntry | undefined;
    deleteEntry(id: string): boolean;
    addCategory(category: Omit<KnowledgeCategory, 'id' | 'createdAt' | 'isDefault'>): KnowledgeCategory;
    getCategory(id: string): KnowledgeCategory | undefined;
    listCategories(): KnowledgeCategory[];
    createSchedule(schedule: Omit<PushSchedule, 'id' | 'createdAt' | 'updatedAt'>): PushSchedule;
    getSchedule(id: string): PushSchedule | undefined;
    listSchedules(enabledOnly?: boolean): PushSchedule[];
    toggleSchedule(id: string, enabled: boolean): PushSchedule | undefined;
    recordPush(entryId: string, scheduleId: string | undefined, status: PushHistory['status']): PushHistory;
    getPushHistory(limit?: number): PushHistory[];
    getRandomEntry(category?: string): KnowledgeEntry | undefined;
    private mapRowToEntry;
    private mapRowToCategory;
    private mapRowToSchedule;
    private mapRowToPushHistory;
}
//# sourceMappingURL=index.d.ts.map