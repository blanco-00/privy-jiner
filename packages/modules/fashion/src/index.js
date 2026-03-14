"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FashionManager = void 0;
const uuid_1 = require("uuid");
class FashionManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
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
    addItem(item) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO wardrobe_items (id, name, category, color, brand, season, favorite, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, item.name, item.category, item.color || null, item.brand || null, item.season ? JSON.stringify(item.season) : null, item.favorite ? 1 : 0, item.imageUrl || null, now, now);
        return this.getItem(id);
    }
    getItem(id) {
        const stmt = this.db.prepare('SELECT * FROM wardrobe_items WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToItem(row) : undefined;
    }
    listItems(filter) {
        let sql = 'SELECT * FROM wardrobe_items WHERE 1=1';
        const params = [];
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
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToItem(row));
    }
    updateItem(id, updates) {
        const existing = this.getItem(id);
        if (!existing)
            return undefined;
        const fields = [];
        const values = [];
        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.color !== undefined) {
            fields.push('color = ?');
            values.push(updates.color);
        }
        if (updates.brand !== undefined) {
            fields.push('brand = ?');
            values.push(updates.brand);
        }
        if (updates.season !== undefined) {
            fields.push('season = ?');
            values.push(JSON.stringify(updates.season));
        }
        if (updates.favorite !== undefined) {
            fields.push('favorite = ?');
            values.push(updates.favorite ? 1 : 0);
        }
        if (updates.imageUrl !== undefined) {
            fields.push('image_url = ?');
            values.push(updates.imageUrl);
        }
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = this.db.prepare(`UPDATE wardrobe_items SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getItem(id);
    }
    deleteItem(id) {
        const stmt = this.db.prepare('DELETE FROM wardrobe_items WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    logOutfit(outfit) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO outfits (id, name, item_ids, rating, occasions, weather, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, outfit.name, JSON.stringify(outfit.itemIds), outfit.rating || null, outfit.occasions ? JSON.stringify(outfit.occasions) : null, outfit.weather ? JSON.stringify(outfit.weather) : null, outfit.notes || null, now);
        return this.getOutfit(id);
    }
    getOutfit(id) {
        const stmt = this.db.prepare('SELECT * FROM outfits WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToOutfit(row) : undefined;
    }
    listOutfits(limit = 50) {
        const stmt = this.db.prepare('SELECT * FROM outfits ORDER BY created_at DESC LIMIT ?');
        const rows = stmt.all(limit);
        return rows.map(row => this.mapRowToOutfit(row));
    }
    rateOutfit(id, rating) {
        const stmt = this.db.prepare('UPDATE outfits SET rating = ? WHERE id = ?');
        stmt.run(rating, id);
        return this.getOutfit(id);
    }
    createCapsule(capsule) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO capsule_wardrobes (id, name, description, item_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, capsule.name, capsule.description || null, JSON.stringify(capsule.itemIds), now, now);
        return this.getCapsule(id);
    }
    getCapsule(id) {
        const stmt = this.db.prepare('SELECT * FROM capsule_wardrobes WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToCapsule(row) : undefined;
    }
    listCapsules() {
        const stmt = this.db.prepare('SELECT * FROM capsule_wardrobes ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToCapsule(row));
    }
    generateCombinations(capsuleId, maxOutfits = 10) {
        const capsule = this.getCapsule(capsuleId);
        if (!capsule)
            return [];
        const items = capsule.itemIds.map(id => this.getItem(id)).filter(Boolean);
        const tops = items.filter(i => i.category === 'top');
        const bottoms = items.filter(i => i.category === 'bottom');
        const outerwear = items.filter(i => i.category === 'outerwear');
        const shoes = items.filter(i => i.category === 'shoes');
        const combinations = [];
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
                if (combinations.length >= maxOutfits)
                    break;
            }
            if (combinations.length >= maxOutfits)
                break;
        }
        return combinations;
    }
    setStylePreference(key, value) {
        const now = new Date().toISOString();
        const existing = this.db.prepare('SELECT id FROM style_preferences WHERE key = ?').get(key);
        if (existing) {
            this.db.prepare('UPDATE style_preferences SET value = ?, updated_at = ? WHERE key = ?').run(value, now, key);
        }
        else {
            const id = (0, uuid_1.v4)();
            this.db.prepare('INSERT INTO style_preferences (id, key, value, updated_at) VALUES (?, ?, ?, ?)').run(id, key, value, now);
        }
        return { id: (0, uuid_1.v4)(), key, value, updatedAt: new Date(now) };
    }
    getStylePreference(key) {
        const stmt = this.db.prepare('SELECT * FROM style_preferences WHERE key = ?');
        const row = stmt.get(key);
        return row ? this.mapRowToStylePreference(row) : undefined;
    }
    getAllStylePreferences() {
        const stmt = this.db.prepare('SELECT * FROM style_preferences');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToStylePreference(row));
    }
    mapRowToItem(row) {
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            color: row.color || undefined,
            brand: row.brand || undefined,
            season: row.season ? JSON.parse(row.season) : undefined,
            favorite: row.favorite === 1,
            imageUrl: row.image_url || undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToOutfit(row) {
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
    mapRowToCapsule(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description || undefined,
            itemIds: JSON.parse(row.item_ids),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToStylePreference(row) {
        return {
            id: row.id,
            key: row.key,
            value: row.value,
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.FashionManager = FashionManager;
//# sourceMappingURL=index.js.map