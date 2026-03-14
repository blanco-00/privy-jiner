import { v4 as uuidv4 } from 'uuid';

export interface FashionItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear' | 'other';
  color: string | null;
  brand: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  date: string;
  occasion: 'casual' | 'work' | 'formal' | 'sport' | 'special' | null;
  weather: string | null;
  notes: string | null;
  created_at: string;
  items?: FashionItem[];
}

export interface OutfitItem {
  outfit_id: string;
  item_id: string;
}

export class FashionService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  createItem(data: Omit<FashionItem, 'id' | 'created_at' | 'updated_at'>): FashionItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO fashion_items (id, name, category, color, brand, purchase_date, purchase_price, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.category, data.color || null, data.brand || null, data.purchase_date || null, data.purchase_price || null, data.notes || null, now, now);

    return this.getItem(id)!;
  }

  getItem(id: string): FashionItem | null {
    return this.db.prepare('SELECT * FROM fashion_items WHERE id = ?').get(id) as FashionItem | null;
  }

  getItems(category?: string): FashionItem[] {
    if (category) {
      return this.db.prepare('SELECT * FROM fashion_items WHERE category = ? ORDER BY name').all(category) as FashionItem[];
    }
    return this.db.prepare('SELECT * FROM fashion_items ORDER BY category, name').all() as FashionItem[];
  }

  updateItem(id: string, data: Partial<Omit<FashionItem, 'id' | 'created_at'>>): FashionItem | null {
    const existing = this.getItem(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE fashion_items
      SET name = ?, category = ?, color = ?, brand = ?, purchase_date = ?, purchase_price = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.category ?? existing.category,
      data.color ?? existing.color,
      data.brand ?? existing.brand,
      data.purchase_date ?? existing.purchase_date,
      data.purchase_price ?? existing.purchase_price,
      data.notes ?? existing.notes,
      now,
      id
    );

    return this.getItem(id);
  }

  deleteItem(id: string): boolean {
    const result = this.db.prepare('DELETE FROM fashion_items WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getWardrobeSummary() {
    const items = this.getItems();
    const byCategory: Record<string, number> = {};
    
    for (const item of items) {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }

    return { total: items.length, byCategory };
  }

  logOutfit(data: { date: string; occasion?: string; weather?: string; notes?: string; itemIds: string[] }): Outfit {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO fashion_outfits (id, date, occasion, weather, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.date, data.occasion || null, data.weather || null, data.notes || null, now);

    for (const itemId of data.itemIds) {
      this.db.prepare(`
        INSERT INTO fashion_outfit_items (outfit_id, item_id) VALUES (?, ?)
      `).run(id, itemId);
    }

    return this.getOutfit(id)!;
  }

  getOutfit(id: string): Outfit | null {
    const outfit = this.db.prepare('SELECT * FROM fashion_outfits WHERE id = ?').get(id) as Outfit | null;
    if (!outfit) return null;

    const items = this.db.prepare(`
      SELECT f.* FROM fashion_items f
      JOIN fashion_outfit_items oi ON f.id = oi.item_id
      WHERE oi.outfit_id = ?
    `).all(id) as FashionItem[];

    return { ...outfit, items };
  }

  getOutfits(startDate?: string, endDate?: string): Outfit[] {
    let sql = 'SELECT * FROM fashion_outfits';
    const params: any[] = [];

    if (startDate || endDate) {
      sql += ' WHERE';
      if (startDate) {
        sql += ' date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        if (startDate) sql += ' AND';
        sql += ' date <= ?';
        params.push(endDate);
      }
    }

    sql += ' ORDER BY date DESC';
    return this.db.prepare(sql).all(...params) as Outfit[];
  }

  deleteOutfit(id: string): boolean {
    const result = this.db.prepare('DELETE FROM fashion_outfits WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getOutfitStats() {
    const outfits = this.getOutfits();
    const itemWearCount = this.db.prepare(`
      SELECT item_id, COUNT(*) as wear_count
      FROM fashion_outfit_items
      GROUP BY item_id
      ORDER BY wear_count DESC
      LIMIT 10
    `).all() as Array<{ item_id: string; wear_count: number }>;

    const byOccasion: Record<string, number> = {};
    for (const outfit of outfits) {
      const occ = outfit.occasion || 'unknown';
      byOccasion[occ] = (byOccasion[occ] || 0) + 1;
    }

    const items = this.getItems();
    const itemMap = new Map(items.map(i => [i.id, i]));
    const topWorn = itemWearCount.map(w => ({
      item: itemMap.get(w.item_id),
      count: w.wear_count,
    })).filter(w => w.item);

    return {
      totalOutfits: outfits.length,
      byOccasion,
      topWorn,
    };
  }

  getRandomOutfit(): { top: FashionItem | null; bottom: FashionItem | null; shoes: FashionItem | null } | null {
    const tops = this.getItems('top');
    const bottoms = this.getItems('bottom');
    const shoes = this.getItems('shoes');

    if (tops.length === 0 && bottoms.length === 0) return null;

    const randomItem = (arr: FashionItem[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    return {
      top: randomItem(tops),
      bottom: randomItem(bottoms),
      shoes: randomItem(shoes),
    };
  }
}
