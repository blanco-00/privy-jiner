import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

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

export class HealthManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS water_logs (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        unit TEXT NOT NULL DEFAULT 'ml',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exercise_logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        calories INTEGER,
        notes TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS health_goals (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        target REAL NOT NULL,
        unit TEXT NOT NULL,
        period TEXT NOT NULL DEFAULT 'daily',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS health_reminders (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        interval_minutes INTEGER NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(date);
      CREATE INDEX IF NOT EXISTS idx_exercise_logs_date ON exercise_logs(date);
    `);
  }

  logWater(amount: number, unit = 'ml'): WaterLog {
    const id = uuidv4();
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO water_logs (id, amount, unit, date, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, amount, unit, date, now.toISOString());

    return this.getWaterLog(id)!;
  }

  getWaterLog(id: string): WaterLog | undefined {
    const stmt = this.db.prepare('SELECT * FROM water_logs WHERE id = ?');
    const row = stmt.get(id) as WaterLogRow | undefined;
    return row ? this.mapRowToWaterLog(row) : undefined;
  }

  getTodayWaterTotal(): number {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM water_logs WHERE date = ?
    `);
    const row = stmt.get(date) as { total: number };
    return row.total;
  }

  getWaterLogsByDate(date: Date): WaterLog[] {
    const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

    const stmt = this.db.prepare('SELECT * FROM water_logs WHERE date = ? ORDER BY created_at DESC');
    const rows = stmt.all(dateStr) as WaterLogRow[];
    return rows.map(row => this.mapRowToWaterLog(row));
  }

  logExercise(type: string, duration: number, options?: { calories?: number; notes?: string }): ExerciseLog {
    const id = uuidv4();
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO exercise_logs (id, type, duration, calories, notes, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, type, duration, options?.calories || null, options?.notes || null, date, now.toISOString());

    return this.getExerciseLog(id)!;
  }

  getExerciseLog(id: string): ExerciseLog | undefined {
    const stmt = this.db.prepare('SELECT * FROM exercise_logs WHERE id = ?');
    const row = stmt.get(id) as ExerciseLogRow | undefined;
    return row ? this.mapRowToExerciseLog(row) : undefined;
  }

  getExerciseLogsByDate(date: Date): ExerciseLog[] {
    const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

    const stmt = this.db.prepare('SELECT * FROM exercise_logs WHERE date = ? ORDER BY created_at DESC');
    const rows = stmt.all(dateStr) as ExerciseLogRow[];
    return rows.map(row => this.mapRowToExerciseLog(row));
  }

  getTodayExerciseTotal(): number {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(duration), 0) as total FROM exercise_logs WHERE date = ?
    `);
    const row = stmt.get(date) as { total: number };
    return row.total;
  }

  getWeeklyExerciseStats(): { date: string; totalDuration: number }[] {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stmt = this.db.prepare(`
      SELECT date, SUM(duration) as total_duration 
      FROM exercise_logs 
      WHERE date >= ? 
      GROUP BY date 
      ORDER BY date ASC
    `);

    const rows = stmt.all(weekAgo.toISOString()) as { date: string; total_duration: number }[];
    return rows.map(row => ({ date: row.date, totalDuration: row.total_duration }));
  }

  setGoal(goal: Omit<HealthGoal, 'id' | 'createdAt' | 'updatedAt'>): HealthGoal {
    const existingStmt = this.db.prepare('SELECT id FROM health_goals WHERE type = ? AND period = ?');
    const existing = existingStmt.get(goal.type, goal.period);

    if (existing) {
      const updateStmt = this.db.prepare(`
        UPDATE health_goals SET target = ?, unit = ?, updated_at = ? WHERE type = ? AND period = ?
      `);
      updateStmt.run(goal.target, goal.unit, new Date().toISOString(), goal.type, goal.period);
      return this.getGoal((existing as { id: string }).id)!;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const insertStmt = this.db.prepare(`
      INSERT INTO health_goals (id, type, target, unit, period, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, goal.type, goal.target, goal.unit, goal.period, now, now);

    return this.getGoal(id)!;
  }

  getGoal(id: string): HealthGoal | undefined {
    const stmt = this.db.prepare('SELECT * FROM health_goals WHERE id = ?');
    const row = stmt.get(id) as HealthGoalRow | undefined;
    return row ? this.mapRowToHealthGoal(row) : undefined;
  }

  getGoalByType(type: HealthGoal['type'], period: HealthGoal['period'] = 'daily'): HealthGoal | undefined {
    const stmt = this.db.prepare('SELECT * FROM health_goals WHERE type = ? AND period = ?');
    const row = stmt.get(type, period) as HealthGoalRow | undefined;
    return row ? this.mapRowToHealthGoal(row) : undefined;
  }

  checkGoalStatus(goalType: HealthGoal['type'], period: HealthGoal['period'] = 'daily'): { current: number; target: number; percent: number; achieved: boolean } | undefined {
    const goal = this.getGoalByType(goalType, period);
    if (!goal) return undefined;

    let current = 0;
    if (goalType === 'water') {
      current = this.getTodayWaterTotal();
    } else if (goalType === 'exercise') {
      current = this.getTodayExerciseTotal();
    }

    const percent = (current / goal.target) * 100;
    return {
      current,
      target: goal.target,
      percent: Math.min(100, percent),
      achieved: current >= goal.target,
    };
  }

  addReminder(reminder: Omit<HealthReminder, 'id' | 'createdAt' | 'updatedAt'>): HealthReminder {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO health_reminders (id, type, message, interval_minutes, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, reminder.type, reminder.message, reminder.intervalMinutes, reminder.enabled ? 1 : 0, now, now);

    return this.getReminder(id)!;
  }

  getReminder(id: string): HealthReminder | undefined {
    const stmt = this.db.prepare('SELECT * FROM health_reminders WHERE id = ?');
    const row = stmt.get(id) as HealthReminderRow | undefined;
    return row ? this.mapRowToHealthReminder(row) : undefined;
  }

  listReminders(enabledOnly = false): HealthReminder[] {
    let sql = 'SELECT * FROM health_reminders';
    if (enabledOnly) {
      sql += ' WHERE enabled = 1';
    }
    sql += ' ORDER BY type ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all() as HealthReminderRow[];
    return rows.map(row => this.mapRowToHealthReminder(row));
  }

  toggleReminder(id: string, enabled: boolean): HealthReminder | undefined {
    const stmt = this.db.prepare('UPDATE health_reminders SET enabled = ?, updated_at = ? WHERE id = ?');
    stmt.run(enabled ? 1 : 0, new Date().toISOString(), id);
    return this.getReminder(id);
  }

  deleteReminder(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM health_reminders WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToWaterLog(row: WaterLogRow): WaterLog {
    return {
      id: row.id,
      amount: row.amount,
      unit: row.unit,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToExerciseLog(row: ExerciseLogRow): ExerciseLog {
    return {
      id: row.id,
      type: row.type,
      duration: row.duration,
      calories: row.calories || undefined,
      notes: row.notes || undefined,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToHealthGoal(row: HealthGoalRow): HealthGoal {
    return {
      id: row.id,
      type: row.type as HealthGoal['type'],
      target: row.target,
      unit: row.unit,
      period: row.period as HealthGoal['period'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToHealthReminder(row: HealthReminderRow): HealthReminder {
    return {
      id: row.id,
      type: row.type as HealthReminder['type'],
      message: row.message,
      intervalMinutes: row.interval_minutes,
      enabled: row.enabled === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

interface WaterLogRow {
  id: string;
  amount: number;
  unit: string;
  date: string;
  created_at: string;
}

interface ExerciseLogRow {
  id: string;
  type: string;
  duration: number;
  calories: number | null;
  notes: string | null;
  date: string;
  created_at: string;
}

interface HealthGoalRow {
  id: string;
  type: string;
  target: number;
  unit: string;
  period: string;
  created_at: string;
  updated_at: string;
}

interface HealthReminderRow {
  id: string;
  type: string;
  message: string;
  interval_minutes: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}
