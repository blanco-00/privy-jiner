import Database from 'better-sqlite3';
export interface NewsArticle {
    id: string;
    title: string;
    content: string;
    summary?: string;
    url: string;
    source: string;
    category: string;
    publishedAt: Date;
    fetchedAt: Date;
    read: boolean;
    archived: boolean;
}
export interface NewsSource {
    id: string;
    name: string;
    url: string;
    category: string;
    enabled: boolean;
    lastFetchedAt?: Date;
    createdAt: Date;
}
export interface UserPreference {
    key: string;
    value: string;
    updatedAt: Date;
}
export interface ReadingHistory {
    id: string;
    articleId: string;
    readAt: Date;
    duration?: number;
}
export declare class NewsManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    addArticle(article: Omit<NewsArticle, 'id' | 'fetchedAt' | 'read' | 'archived'>): NewsArticle;
    getArticle(id: string): NewsArticle | undefined;
    listArticles(filter?: {
        category?: string;
        source?: string;
        read?: boolean;
        archived?: boolean;
        limit?: number;
        offset?: number;
    }): NewsArticle[];
    markAsRead(id: string): NewsArticle | undefined;
    archiveArticle(id: string): NewsArticle | undefined;
    deleteArticle(id: string): boolean;
    cleanupOldArticles(daysToKeep?: number): number;
    addSource(source: Omit<NewsSource, 'id' | 'createdAt' | 'lastFetchedAt'>): NewsSource;
    getSource(id: string): NewsSource | undefined;
    listSources(enabledOnly?: boolean): NewsSource[];
    updateSource(id: string, updates: Partial<Pick<NewsSource, 'name' | 'url' | 'category' | 'enabled'>>): NewsSource | undefined;
    markSourceFetched(id: string): void;
    deleteSource(id: string): boolean;
    setPreference(key: string, value: string): UserPreference;
    getPreference(key: string): UserPreference | undefined;
    getAllPreferences(): UserPreference[];
    getReadingHistory(limit?: number): ReadingHistory[];
    private mapRowToArticle;
    private mapRowToSource;
    private mapRowToPreference;
}
//# sourceMappingURL=index.d.ts.map