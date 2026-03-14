import { v4 as uuidv4 } from 'uuid';

export interface WaterLog {
  id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  type: string;
  duration: number;
  calories: number | null;
  steps: number | null;
  date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  type: string;
  target: number;
  period: 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  type: 'water' | 'exercise' | 'medicine' | 'custom';
  title: string;
  message: string | null;
  time: string;
  repeat: 'once' | 'daily' | 'weekly' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class HealthService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  logWater(amount: number, date: string): WaterLog {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO health_water_logs (id, amount, date, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, amount, date, now);

    return this.getWaterLog(id)!;
  }

  getWaterLog(id: string): WaterLog | null {
    return this.db.prepare('SELECT * FROM health_water_logs WHERE id = ?').get(id) as WaterLog | null;
  }

  getWaterLogs(date?: string): WaterLog[] {
    if (date) {
      return this.db.prepare('SELECT * FROM health_water_logs WHERE date = ? ORDER BY created_at DESC').all(date) as WaterLog[];
    }
    return this.db.prepare('SELECT * FROM health_water_logs ORDER BY date DESC, created_at DESC').all() as WaterLog[];
  }

  getTodayWaterTotal(): number {
    const today = new Date().toISOString().split('T')[0];
    const result = this.db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM health_water_logs WHERE date = ?'
    ).get(today) as { total: number };
    return result.total;
  }

  logExercise(data: { type: string; duration: number; calories?: number; steps?: number; date: string }): ExerciseLog {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO health_exercise_logs (id, type, duration, calories, steps, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.type, data.duration, data.calories || null, data.steps || null, data.date, now);

    return this.getExerciseLog(id)!;
  }

  getExerciseLog(id: string): ExerciseLog | null {
    return this.db.prepare('SELECT * FROM health_exercise_logs WHERE id = ?').get(id) as ExerciseLog | null;
  }

  getExerciseLogs(date?: string): ExerciseLog[] {
    if (date) {
      return this.db.prepare('SELECT * FROM health_exercise_logs WHERE date = ? ORDER BY created_at DESC').all(date) as ExerciseLog[];
    }
    return this.db.prepare('SELECT * FROM health_exercise_logs ORDER BY date DESC, created_at DESC').all() as ExerciseLog[];
  }

  getTodayExerciseSummary() {
    const today = new Date().toISOString().split('T')[0];

    const totalDuration = this.db.prepare(
      'SELECT COALESCE(SUM(duration), 0) as total FROM health_exercise_logs WHERE date = ?'
    ).get(today) as { total: number };

    const totalCalories = this.db.prepare(
      'SELECT COALESCE(SUM(calories), 0) as total FROM health_exercise_logs WHERE date = ?'
    ).get(today) as { total: number };

    const totalSteps = this.db.prepare(
      'SELECT COALESCE(SUM(steps), 0) as total FROM health_exercise_logs WHERE date = ?'
    ).get(today) as { total: number };

    return {
      duration: totalDuration.total,
      calories: totalCalories.total,
      steps: totalSteps.total,
    };
  }

  getSummary() {
    return {
      water: {
        today: this.getTodayWaterTotal(),
        goal: 2000,
      },
      exercise: this.getTodayExerciseSummary(),
    };
  }

  // ==================== REMINDER METHODS ====================
  createReminder(data: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Reminder {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO health_reminders (id, type, title, message, time, repeat, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.type, data.title, data.message || null, data.time, data.repeat || null, data.is_active !== false, now, now);

    return this.getReminder(id)!;
  }

  getReminder(id: string): Reminder | null {
    return this.db.prepare('SELECT * FROM health_reminders WHERE id = ?').get(id) as Reminder | null;
  }

  getReminders(includeInactive: boolean = false): Reminder[] {
    if (includeInactive) {
      return this.db.prepare('SELECT * FROM health_reminders ORDER BY time').all() as Reminder[];
    }
    return this.db.prepare('SELECT * FROM health_reminders WHERE is_active = 1 ORDER BY time').all() as Reminder[];
  }

  updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'created_at'>>): Reminder | null {
    const existing = this.getReminder(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE health_reminders
      SET type = ?, title = ?, message = ?, time = ?, repeat = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.type ?? existing.type,
      data.title ?? existing.title,
      data.message ?? existing.message,
      data.time ?? existing.time,
      data.repeat ?? existing.repeat,
      data.is_active ?? existing.is_active,
      now,
      id
    );

    return this.getReminder(id);
  }

  deleteReminder(id: string): boolean {
    const result = this.db.prepare('DELETE FROM health_reminders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  toggleReminder(id: string): Reminder | null {
    const reminder = this.getReminder(id);
    if (!reminder) return null;
    return this.updateReminder(id, { is_active: !reminder.is_active });
  }
}
