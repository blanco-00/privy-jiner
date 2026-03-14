import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  name: string;
  birthday: string | null;
  height: number | null;
  weight: number | null;
  blood_type: string | null;
  avatar: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthMetric {
  id: string;
  type: string;
  value: string;
  recorded_at: string;
  notes: string | null;
  created_at: string;
}

export class ProfileService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // Profile methods
  getProfile(): UserProfile | null {
    return this.db.prepare('SELECT * FROM user_profiles LIMIT 1').get() as UserProfile | null;
  }

  createProfile(data: { name: string; birthday?: string; height?: number; weight?: number; blood_type?: string; avatar?: string; notes?: string }): UserProfile {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO user_profiles (id, name, birthday, height, weight, blood_type, avatar, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.birthday || null, data.height || null, data.weight || null, data.blood_type || null, data.avatar || null, data.notes || null, now, now);

    return this.getProfile()!;
  }

  updateProfile(data: Partial<{ name: string; birthday: string; height: number; weight: number; blood_type: string; avatar: string; notes: string }>): UserProfile | null {
    const profile = this.getProfile();
    if (!profile) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.birthday !== undefined) { fields.push('birthday = ?'); values.push(data.birthday); }
    if (data.height !== undefined) { fields.push('height = ?'); values.push(data.height); }
    if (data.weight !== undefined) { fields.push('weight = ?'); values.push(data.weight); }
    if (data.blood_type !== undefined) { fields.push('blood_type = ?'); values.push(data.blood_type); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) return profile;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(profile.id);

    this.db.prepare(`UPDATE user_profiles SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getProfile();
  }

  // Health metrics methods
  addHealthMetric(data: { type: string; value: string; recorded_at?: string; notes?: string }): HealthMetric {
    const id = uuidv4();
    const now = new Date().toISOString();
    const recordedAt = data.recorded_at || now.split('T')[0];

    this.db.prepare(`
      INSERT INTO health_metrics (id, type, value, recorded_at, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.type, data.value, recordedAt, data.notes || null, now);

    return this.getHealthMetric(id)!;
  }

  getHealthMetric(id: string): HealthMetric | null {
    return this.db.prepare('SELECT * FROM health_metrics WHERE id = ?').get(id) as HealthMetric | null;
  }

  getHealthMetrics(type?: string, limit = 30): HealthMetric[] {
    if (type) {
      return this.db.prepare('SELECT * FROM health_metrics WHERE type = ? ORDER BY recorded_at DESC LIMIT ?').all(type, limit) as HealthMetric[];
    }
    return this.db.prepare('SELECT * FROM health_metrics ORDER BY recorded_at DESC LIMIT ?').all(limit) as HealthMetric[];
  }

  deleteHealthMetric(id: string): boolean {
    const result = this.db.prepare('DELETE FROM health_metrics WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Get latest metrics by type
  getLatestMetrics(): Record<string, HealthMetric> {
    const metrics = this.db.prepare(`
      SELECT * FROM health_metrics 
      WHERE id IN (SELECT id FROM health_metrics m1 WHERE recorded_at = (SELECT MAX(recorded_at) FROM health_metrics m2 WHERE m2.type = m1.type))
    `).all() as HealthMetric[];
    
    return metrics.reduce((acc, m) => { acc[m.type] = m; return acc; }, {} as Record<string, HealthMetric>);
  }
}
