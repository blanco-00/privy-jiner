"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthManager = void 0;
const uuid_1 = require("uuid");
class HealthManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
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
    logWater(amount, unit = 'ml') {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO water_logs (id, amount, unit, date, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(id, amount, unit, date, now.toISOString());
        return this.getWaterLog(id);
    }
    getWaterLog(id) {
        const stmt = this.db.prepare('SELECT * FROM water_logs WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToWaterLog(row) : undefined;
    }
    getTodayWaterTotal() {
        const today = new Date();
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM water_logs WHERE date = ?
    `);
        const row = stmt.get(date);
        return row.total;
    }
    getWaterLogsByDate(date) {
        const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
        const stmt = this.db.prepare('SELECT * FROM water_logs WHERE date = ? ORDER BY created_at DESC');
        const rows = stmt.all(dateStr);
        return rows.map(row => this.mapRowToWaterLog(row));
    }
    logExercise(type, duration, options) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO exercise_logs (id, type, duration, calories, notes, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, type, duration, options?.calories || null, options?.notes || null, date, now.toISOString());
        return this.getExerciseLog(id);
    }
    getExerciseLog(id) {
        const stmt = this.db.prepare('SELECT * FROM exercise_logs WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToExerciseLog(row) : undefined;
    }
    getExerciseLogsByDate(date) {
        const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
        const stmt = this.db.prepare('SELECT * FROM exercise_logs WHERE date = ? ORDER BY created_at DESC');
        const rows = stmt.all(dateStr);
        return rows.map(row => this.mapRowToExerciseLog(row));
    }
    getTodayExerciseTotal() {
        const today = new Date();
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(duration), 0) as total FROM exercise_logs WHERE date = ?
    `);
        const row = stmt.get(date);
        return row.total;
    }
    getWeeklyExerciseStats() {
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
        const rows = stmt.all(weekAgo.toISOString());
        return rows.map(row => ({ date: row.date, totalDuration: row.total_duration }));
    }
    setGoal(goal) {
        const existingStmt = this.db.prepare('SELECT id FROM health_goals WHERE type = ? AND period = ?');
        const existing = existingStmt.get(goal.type, goal.period);
        if (existing) {
            const updateStmt = this.db.prepare(`
        UPDATE health_goals SET target = ?, unit = ?, updated_at = ? WHERE type = ? AND period = ?
      `);
            updateStmt.run(goal.target, goal.unit, new Date().toISOString(), goal.type, goal.period);
            return this.getGoal(existing.id);
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const insertStmt = this.db.prepare(`
      INSERT INTO health_goals (id, type, target, unit, period, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        insertStmt.run(id, goal.type, goal.target, goal.unit, goal.period, now, now);
        return this.getGoal(id);
    }
    getGoal(id) {
        const stmt = this.db.prepare('SELECT * FROM health_goals WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToHealthGoal(row) : undefined;
    }
    getGoalByType(type, period = 'daily') {
        const stmt = this.db.prepare('SELECT * FROM health_goals WHERE type = ? AND period = ?');
        const row = stmt.get(type, period);
        return row ? this.mapRowToHealthGoal(row) : undefined;
    }
    checkGoalStatus(goalType, period = 'daily') {
        const goal = this.getGoalByType(goalType, period);
        if (!goal)
            return undefined;
        let current = 0;
        if (goalType === 'water') {
            current = this.getTodayWaterTotal();
        }
        else if (goalType === 'exercise') {
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
    addReminder(reminder) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO health_reminders (id, type, message, interval_minutes, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, reminder.type, reminder.message, reminder.intervalMinutes, reminder.enabled ? 1 : 0, now, now);
        return this.getReminder(id);
    }
    getReminder(id) {
        const stmt = this.db.prepare('SELECT * FROM health_reminders WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToHealthReminder(row) : undefined;
    }
    listReminders(enabledOnly = false) {
        let sql = 'SELECT * FROM health_reminders';
        if (enabledOnly) {
            sql += ' WHERE enabled = 1';
        }
        sql += ' ORDER BY type ASC';
        const stmt = this.db.prepare(sql);
        const rows = stmt.all();
        return rows.map(row => this.mapRowToHealthReminder(row));
    }
    toggleReminder(id, enabled) {
        const stmt = this.db.prepare('UPDATE health_reminders SET enabled = ?, updated_at = ? WHERE id = ?');
        stmt.run(enabled ? 1 : 0, new Date().toISOString(), id);
        return this.getReminder(id);
    }
    deleteReminder(id) {
        const stmt = this.db.prepare('DELETE FROM health_reminders WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    mapRowToWaterLog(row) {
        return {
            id: row.id,
            amount: row.amount,
            unit: row.unit,
            date: new Date(row.date),
            createdAt: new Date(row.created_at),
        };
    }
    mapRowToExerciseLog(row) {
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
    mapRowToHealthGoal(row) {
        return {
            id: row.id,
            type: row.type,
            target: row.target,
            unit: row.unit,
            period: row.period,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToHealthReminder(row) {
        return {
            id: row.id,
            type: row.type,
            message: row.message,
            intervalMinutes: row.interval_minutes,
            enabled: row.enabled === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.HealthManager = HealthManager;
//# sourceMappingURL=index.js.map