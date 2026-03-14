import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  completed_at: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export class TasksService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  getTasks(status?: string, priority?: string): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY CASE priority WHEN "urgent" THEN 0 WHEN "high" THEN 1 WHEN "medium" THEN 2 ELSE 3 END, due_date ASC, created_at DESC';
    return this.db.prepare(query).all(...params) as Task[];
  }

  getTask(id: string): Task | null {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | null;
  }

  createTask(data: { title: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; due_date?: string; tags?: string }): Task {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO tasks (id, title, description, priority, status, due_date, completed_at, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, NULL, ?, ?, ?)
    `).run(id, data.title, data.description || null, data.priority || 'medium', data.due_date || null, data.tags || null, now, now);

    return this.getTask(id)!;
  }

  updateTask(id: string, data: Partial<{ title: string; description: string; priority: string; status: string; due_date: string; tags: string }>): Task | null {
    const task = this.getTask(id);
    if (!task) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
    if (data.status !== undefined) { 
      fields.push('status = ?'); 
      values.push(data.status);
      if (data.status === 'completed') {
        fields.push('completed_at = ?');
        values.push(now);
      }
    }
    if (data.due_date !== undefined) { fields.push('due_date = ?'); values.push(data.due_date); }
    if (data.tags !== undefined) { fields.push('tags = ?'); values.push(data.tags); }

    if (fields.length === 0) return task;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getTask(id);
  }

  deleteTask(id: string): boolean {
    const result = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  completeTask(id: string): Task | null {
    return this.updateTask(id, { status: 'completed' });
  }

  reopenTask(id: string): Task | null {
    return this.updateTask(id, { status: 'pending' });
  }

  getOverdueTasks(): Task[] {
    const today = new Date().toISOString().split('T')[0];
    return this.db.prepare(`
      SELECT * FROM tasks 
      WHERE due_date < ? 
      AND status NOT IN ('completed', 'cancelled')
      ORDER BY due_date ASC
    `).all(today) as Task[];
  }

  getTasksDueToday(): Task[] {
    const today = new Date().toISOString().split('T')[0];
    return this.db.prepare(`
      SELECT * FROM tasks 
      WHERE due_date = ? 
      AND status NOT IN ('completed', 'cancelled')
      ORDER BY priority ASC
    `).all(today) as Task[];
  }

  getTaskStats(): { total: number; pending: number; in_progress: number; completed: number; overdue: number } {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any).count;
    const pending = (this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as any).count;
    const in_progress = (this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").get() as any).count;
    const completed = (this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as any).count;
    const overdue = this.getOverdueTasks().length;

    return { total, pending, in_progress, completed, overdue };
  }
}
