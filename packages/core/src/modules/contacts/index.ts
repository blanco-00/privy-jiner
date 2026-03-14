import { v4 as uuidv4 } from 'uuid';

export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  address: string | null;
  company: string | null;
  title: string | null;
  group_id: string | null;
  avatar: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export class ContactsService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  getContacts(search?: string, groupId?: string): Contact[] {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (groupId) {
      query += ' AND group_id = ?';
      params.push(groupId);
    }

    query += ' ORDER BY is_favorite DESC, name ASC';
    return this.db.prepare(query).all(...params) as Contact[];
  }

  getContact(id: string): Contact | null {
    return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact | null;
  }

  createContact(data: { name: string; phone?: string; email?: string; birthday?: string; address?: string; company?: string; title?: string; group_id?: string; avatar?: string; notes?: string }): Contact {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO contacts (id, name, phone, email, birthday, address, company, title, group_id, avatar, notes, is_favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, data.name, data.phone || null, data.email || null, data.birthday || null, data.address || null, data.company || null, data.title || null, data.group_id || null, data.avatar || null, data.notes || null, now, now);

    return this.getContact(id)!;
  }

  updateContact(id: string, data: Partial<{ name: string; phone: string; email: string; birthday: string; address: string; company: string; title: string; group_id: string; avatar: string; notes: string; is_favorite: boolean }>): Contact | null {
    const contact = this.getContact(id);
    if (!contact) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.birthday !== undefined) { fields.push('birthday = ?'); values.push(data.birthday); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
    if (data.company !== undefined) { fields.push('company = ?'); values.push(data.company); }
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.group_id !== undefined) { fields.push('group_id = ?'); values.push(data.group_id); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.is_favorite !== undefined) { fields.push('is_favorite = ?'); values.push(data.is_favorite ? 1 : 0); }

    if (fields.length === 0) return contact;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.prepare(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getContact(id);
  }

  deleteContact(id: string): boolean {
    const result = this.db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Groups
  getGroups(): ContactGroup[] {
    return this.db.prepare('SELECT * FROM contact_groups ORDER BY name ASC').all() as ContactGroup[];
  }

  getGroup(id: string): ContactGroup | null {
    return this.db.prepare('SELECT * FROM contact_groups WHERE id = ?').get(id) as ContactGroup | null;
  }

  createGroup(data: { name: string; color?: string }): ContactGroup {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO contact_groups (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, data.name, data.color || '#888888', now);

    return this.getGroup(id)!;
  }

  deleteGroup(id: string): boolean {
    this.db.prepare('UPDATE contacts SET group_id = NULL WHERE group_id = ?').run(id);
    const result = this.db.prepare('DELETE FROM contact_groups WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Upcoming birthdays
  getUpcomingBirthdays(days = 30): Contact[] {
    const today = new Date();
    const contacts = this.db.prepare('SELECT * FROM contacts WHERE birthday IS NOT NULL ORDER BY birthday ASC').all() as Contact[];
    
    return contacts.filter(c => {
      if (!c.birthday) return false;
      const bday = new Date(c.birthday);
      const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      
      if (thisYearBday < today) {
        thisYearBday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffDays = Math.ceil((thisYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    });
  }

  getFavorites(): Contact[] {
    return this.db.prepare('SELECT * FROM contacts WHERE is_favorite = 1 ORDER BY name ASC').all() as Contact[];
  }
}
