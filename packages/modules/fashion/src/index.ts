import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory' | 'other';
  color?: string;
  brand?: string;
  season?: string[];
  favorite: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  rating?: number;
  occasions?: string[];
  weather?: string[];
  notes?: string;
  createdAt: Date;
}

export interface CapsuleWardrobe {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StylePreference {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

export class FashionManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS wardrobe_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT,
        brand TEXT,
        season TEXT,
        favorite INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS outfits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        item_ids TEXT NOT NULL,
        rating INTEGER,
        occasions TEXT,
        weather TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS capsule_wardrobes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        item_ids TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS style_preferences (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  addItem(item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>): WardrobeItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO wardrobe_items (id, name, category, color, brand, season, favorite, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      item.name,
      item.category,
      item.color || null,
      item.brand || null,
      item.season ? JSON.stringify(item.season) : null,
      item.favorite ? 1 : 0,
      item.imageUrl || null,
      now,
      now
    );

    return this.getItem(id)!;
  }

  getItem(id: string): WardrobeItem | undefined {
    const stmt = this.db.prepare('SELECT * FROM wardrobe_items WHERE id = ?');
    const row = stmt.get(id) as WardrobeItemRow | undefined;
    return row ? this.mapRowToItem(row) : undefined;
  }

  listItems(filter?: { category?: string; favorite?: boolean; season?: string }): WardrobeItem[] {
    let sql = 'SELECT * FROM wardrobe_items WHERE 1=1';
    const params: unknown[] = [];

    if (filter?.category) {
      sql += ' AND category = ?';
      params.push(filter.category);
    }
    if (filter?.favorite !== undefined) {
      sql += ' AND favorite = ?';
      params.push(filter.favorite ? 1 : 0);
    }
    if (filter?.season) {
      sql += ' AND season LIKE ?';
      params.push(`%${filter.season}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as WardrobeItemRow[];
    return rows.map(row => this.mapRowToItem(row));
  }

  updateItem(id: string, updates: Partial<Pick<WardrobeItem, 'name' | 'category' | 'color' | 'brand' | 'season' | 'favorite' | 'imageUrl'>>): WardrobeItem | undefined {
    const existing = this.getItem(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
    if (updates.brand !== undefined) { fields.push('brand = ?'); values.push(updates.brand); }
    if (updates.season !== undefined) { fields.push('season = ?'); values.push(JSON.stringify(updates.season)); }
    if (updates.favorite !== undefined) { fields.push('favorite = ?'); values.push(updates.favorite ? 1 : 0); }
    if (updates.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(updates.imageUrl); }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`UPDATE wardrobe_items SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getItem(id);
  }

  deleteItem(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM wardrobe_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  logOutfit(outfit: Omit<Outfit, 'id' | 'createdAt'>): Outfit {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO outfits (id, name, item_ids, rating, occasions, weather, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      outfit.name,
      JSON.stringify(outfit.itemIds),
      outfit.rating || null,
      outfit.occasions ? JSON.stringify(outfit.occasions) : null,
      outfit.weather ? JSON.stringify(outfit.weather) : null,
      outfit.notes || null,
      now
    );

    return this.getOutfit(id)!;
  }

  getOutfit(id: string): Outfit | undefined {
    const stmt = this.db.prepare('SELECT * FROM outfits WHERE id = ?');
    const row = stmt.get(id) as OutfitRow | undefined;
    return row ? this.mapRowToOutfit(row) : undefined;
  }

  listOutfits(limit = 50): Outfit[] {
    const stmt = this.db.prepare('SELECT * FROM outfits ORDER BY created_at DESC LIMIT ?');
    const rows = stmt.all(limit) as OutfitRow[];
    return rows.map(row => this.mapRowToOutfit(row));
  }

  rateOutfit(id: string, rating: number): Outfit | undefined {
    const stmt = this.db.prepare('UPDATE outfits SET rating = ? WHERE id = ?');
    stmt.run(rating, id);
    return this.getOutfit(id);
  }

  createCapsule(capsule: Omit<CapsuleWardrobe, 'id' | 'createdAt' | 'updatedAt'>): CapsuleWardrobe {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO capsule_wardrobes (id, name, description, item_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      capsule.name,
      capsule.description || null,
      JSON.stringify(capsule.itemIds),
      now,
      now
    );

    return this.getCapsule(id)!;
  }

  getCapsule(id: string): CapsuleWardrobe | undefined {
    const stmt = this.db.prepare('SELECT * FROM capsule_wardrobes WHERE id = ?');
    const row = stmt.get(id) as CapsuleWardrobeRow | undefined;
    return row ? this.mapRowToCapsule(row) : undefined;
  }

  listCapsules(): CapsuleWardrobe[] {
    const stmt = this.db.prepare('SELECT * FROM capsule_wardrobes ORDER BY created_at DESC');
    const rows = stmt.all() as CapsuleWardrobeRow[];
    return rows.map(row => this.mapRowToCapsule(row));
  }

  generateCombinations(capsuleId: string, maxOutfits = 10): string[][] {
    const capsule = this.getCapsule(capsuleId);
    if (!capsule) return [];

    const items = capsule.itemIds.map(id => this.getItem(id)).filter(Boolean) as WardrobeItem[];
    const tops = items.filter(i => i.category === 'top');
    const bottoms = items.filter(i => i.category === 'bottom');
    const outerwear = items.filter(i => i.category === 'outerwear');
    const shoes = items.filter(i => i.category === 'shoes');

    const combinations: string[][] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        const combo = [top.id, bottom.id];

        if (outerwear.length > 0 && Math.random() > 0.5) {
          combo.push(outerwear[Math.floor(Math.random() * outerwear.length)].id);
        }

        if (shoes.length > 0) {
          combo.push(shoes[Math.floor(Math.random() * shoes.length)].id);
        }

        combinations.push(combo);

        if (combinations.length >= maxOutfits) break;
      }
      if (combinations.length >= maxOutfits) break;
    }

    return combinations;
  }

  setStylePreference(key: string, value: string): StylePreference {
    const now = new Date().toISOString();

    const existing = this.db.prepare('SELECT id FROM style_preferences WHERE key = ?').get(key);
    if (existing) {
      this.db.prepare('UPDATE style_preferences SET value = ?, updated_at = ? WHERE key = ?').run(value, now, key);
    } else {
      const id = uuidv4();
      this.db.prepare('INSERT INTO style_preferences (id, key, value, updated_at) VALUES (?, ?, ?, ?)').run(id, key, value, now);
    }

    return { id: uuidv4(), key, value, updatedAt: new Date(now) };
  }

  getStylePreference(key: string): StylePreference | undefined {
    const stmt = this.db.prepare('SELECT * FROM style_preferences WHERE key = ?');
    const row = stmt.get(key) as StylePreferenceRow | undefined;
    return row ? this.mapRowToStylePreference(row) : undefined;
  }

  getAllStylePreferences(): StylePreference[] {
    const stmt = this.db.prepare('SELECT * FROM style_preferences');
    const rows = stmt.all() as StylePreferenceRow[];
    return rows.map(row => this.mapRowToStylePreference(row));
  }

  private mapRowToItem(row: WardrobeItemRow): WardrobeItem {
    return {
      id: row.id,
      name: row.name,
      category: row.category as WardrobeItem['category'],
      color: row.color || undefined,
      brand: row.brand || undefined,
      season: row.season ? JSON.parse(row.season) : undefined,
      favorite: row.favorite === 1,
      imageUrl: row.image_url || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToOutfit(row: OutfitRow): Outfit {
    return {
      id: row.id,
      name: row.name,
      itemIds: JSON.parse(row.item_ids),
      rating: row.rating || undefined,
      occasions: row.occasions ? JSON.parse(row.occasions) : undefined,
      weather: row.weather ? JSON.parse(row.weather) : undefined,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToCapsule(row: CapsuleWardrobeRow): CapsuleWardrobe {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      itemIds: JSON.parse(row.item_ids),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToStylePreference(row: StylePreferenceRow): StylePreference {
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      updatedAt: new Date(row.updated_at),
    };
  }
}

interface WardrobeItemRow {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  favorite: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OutfitRow {
  id: string;
  name: string;
  item_ids: string;
  rating: number | null;
  occasions: string | null;
  weather: string | null;
  notes: string | null;
  created_at: string;
}

interface CapsuleWardrobeRow {
  id: string;
  name: string;
  description: string | null;
  item_ids: string;
  created_at: string;
  updated_at: string;
}

interface StylePreferenceRow {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
