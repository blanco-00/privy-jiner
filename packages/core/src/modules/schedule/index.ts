import { v4 as uuidv4 } from 'uuid';

export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  recurrence: string | null;
  recurrence_end: string | null;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleReminder {
  id: string;
  schedule_id: string;
  remind_at: string;
  is_sent: boolean;
  created_at: string;
}

export class ScheduleService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  getSchedules(startDate?: string, endDate?: string): Schedule[] {
    let query = 'SELECT * FROM schedules WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND start_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND start_time <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY start_time ASC';
    return this.db.prepare(query).all(...params) as Schedule[];
  }

  getSchedule(id: string): Schedule | null {
    return this.db.prepare('SELECT * FROM schedules WHERE id = ?').get(id) as Schedule | null;
  }

  createSchedule(data: { title: string; description?: string; location?: string; start_time: string; end_time?: string; all_day?: boolean; recurrence?: string; recurrence_end?: string; color?: string }): Schedule {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO schedules (id, title, description, location, start_time, end_time, all_day, recurrence, recurrence_end, color, is_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, data.title, data.description || null, data.location || null, data.start_time, data.end_time || null, data.all_day ? 1 : 0, data.recurrence || null, data.recurrence_end || null, data.color || '#e8a854', now, now);

    return this.getSchedule(id)!;
  }

  updateSchedule(id: string, data: Partial<{ title: string; description: string; location: string; start_time: string; end_time: string; all_day: boolean; recurrence: string; recurrence_end: string; color: string; is_completed: boolean }>): Schedule | null {
    const schedule = this.getSchedule(id);
    if (!schedule) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
    if (data.start_time !== undefined) { fields.push('start_time = ?'); values.push(data.start_time); }
    if (data.end_time !== undefined) { fields.push('end_time = ?'); values.push(data.end_time); }
    if (data.all_day !== undefined) { fields.push('all_day = ?'); values.push(data.all_day ? 1 : 0); }
    if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }
    if (data.recurrence_end !== undefined) { fields.push('recurrence_end = ?'); values.push(data.recurrence_end); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.is_completed !== undefined) { fields.push('is_completed = ?'); values.push(data.is_completed ? 1 : 0); }

    if (fields.length === 0) return schedule;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.prepare(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getSchedule(id);
  }

  deleteSchedule(id: string): boolean {
    const result = this.db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
    return result.changes > 0;
  }

  toggleComplete(id: string): Schedule | null {
    const schedule = this.getSchedule(id);
    if (!schedule) return null;
    return this.updateSchedule(id, { is_completed: !schedule.is_completed });
  }

  // Calendar queries
  getMonthSchedule(year: number, month: number): Schedule[] {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    return this.getSchedules(startDate, endDate);
  }

  getWeekSchedule(date: string): Schedule[] {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    
    return this.getSchedules(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }

  getDaySchedule(date: string): Schedule[] {
    return this.getSchedules(date, date);
  }

  // Reminders
  addReminder(scheduleId: string, remindAt: string): ScheduleReminder {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO schedule_reminders (id, schedule_id, remind_at, is_sent, created_at)
      VALUES (?, ?, ?, 0, ?)
    `).run(id, scheduleId, remindAt, now);

    return this.db.prepare('SELECT * FROM schedule_reminders WHERE id = ?').get(id) as ScheduleReminder;
  }

  getReminders(scheduleId?: string): ScheduleReminder[] {
    if (scheduleId) {
      return this.db.prepare('SELECT * FROM schedule_reminders WHERE schedule_id = ? ORDER BY remind_at ASC').all(scheduleId) as ScheduleReminder[];
    }
    return this.db.prepare('SELECT * FROM schedule_reminders ORDER BY remind_at ASC').all() as ScheduleReminder[];
  }

  deleteReminder(id: string): boolean {
    const result = this.db.prepare('DELETE FROM schedule_reminders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getUpcomingReminders(hours = 24): Schedule[] {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return this.db.prepare(`
      SELECT s.* FROM schedules s
      INNER JOIN schedule_reminders r ON s.id = r.schedule_id
      WHERE r.remind_at BETWEEN ? AND ?
      AND r.is_sent = 0
      ORDER BY r.remind_at ASC
    `).all(now.toISOString(), future.toISOString()) as Schedule[];
  }
}
