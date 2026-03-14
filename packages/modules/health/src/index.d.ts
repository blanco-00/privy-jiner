import Database from 'better-sqlite3';
export interface WaterLog {
    id: string;
    amount: number;
    unit: string;
    date: Date;
    createdAt: Date;
}
export interface ExerciseLog {
    id: string;
    type: string;
    duration: number;
    calories?: number;
    notes?: string;
    date: Date;
    createdAt: Date;
}
export interface HealthGoal {
    id: string;
    type: 'water' | 'exercise';
    target: number;
    unit: string;
    period: 'daily' | 'weekly';
    createdAt: Date;
    updatedAt: Date;
}
export interface HealthReminder {
    id: string;
    type: 'water' | 'exercise';
    message: string;
    intervalMinutes: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class HealthManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    logWater(amount: number, unit?: string): WaterLog;
    getWaterLog(id: string): WaterLog | undefined;
    getTodayWaterTotal(): number;
    getWaterLogsByDate(date: Date): WaterLog[];
    logExercise(type: string, duration: number, options?: {
        calories?: number;
        notes?: string;
    }): ExerciseLog;
    getExerciseLog(id: string): ExerciseLog | undefined;
    getExerciseLogsByDate(date: Date): ExerciseLog[];
    getTodayExerciseTotal(): number;
    getWeeklyExerciseStats(): {
        date: string;
        totalDuration: number;
    }[];
    setGoal(goal: Omit<HealthGoal, 'id' | 'createdAt' | 'updatedAt'>): HealthGoal;
    getGoal(id: string): HealthGoal | undefined;
    getGoalByType(type: HealthGoal['type'], period?: HealthGoal['period']): HealthGoal | undefined;
    checkGoalStatus(goalType: HealthGoal['type'], period?: HealthGoal['period']): {
        current: number;
        target: number;
        percent: number;
        achieved: boolean;
    } | undefined;
    addReminder(reminder: Omit<HealthReminder, 'id' | 'createdAt' | 'updatedAt'>): HealthReminder;
    getReminder(id: string): HealthReminder | undefined;
    listReminders(enabledOnly?: boolean): HealthReminder[];
    toggleReminder(id: string, enabled: boolean): HealthReminder | undefined;
    deleteReminder(id: string): boolean;
    private mapRowToWaterLog;
    private mapRowToExerciseLog;
    private mapRowToHealthGoal;
    private mapRowToHealthReminder;
}
//# sourceMappingURL=index.d.ts.map