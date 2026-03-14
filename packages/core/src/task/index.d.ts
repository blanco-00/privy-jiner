import Database from 'better-sqlite3';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'archived' | 'expired';
export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    archivedAt?: Date;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface TaskFilter {
    status?: TaskStatus[];
    priority?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    limit?: number;
    offset?: number;
}
export declare class TaskManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    create(title: string, description?: string, priority?: Task['priority']): Task;
    getById(id: string): Task | undefined;
    update(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'expiresAt' | 'metadata'>>): Task | undefined;
    delete(id: string): boolean;
    list(filter?: TaskFilter): Task[];
    archive(id: string): Task | undefined;
    complete(id: string): Task | undefined;
    fail(id: string): Task | undefined;
    getPending(): Task[];
    getInProgress(): Task[];
    private mapRowToTask;
}
//# sourceMappingURL=index.d.ts.map