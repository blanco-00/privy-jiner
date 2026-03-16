/**
 * OpenClawPlugin Integration Tests
 * Tests all tool handlers with actual database operations
 */
import Database from 'better-sqlite3';
import { OpenClawPlugin, GatewayMessage } from '../index.js';
import { HealthService } from '../../modules/health/index.js';
import { FinanceService } from '../../modules/finance/index.js';
import { FashionService } from '../../modules/fashion/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../../tmp/test-openclaw.db');

describe('OpenClawPlugin Integration Tests', () => {
  let plugin: OpenClawPlugin;
  let db: Database.Database;

  beforeAll(() => {
    // Create test database
    db = new Database(TEST_DB_PATH);
    
    // Initialize schema for all modules
    db.exec(`
      -- Health tables
      CREATE TABLE IF NOT EXISTS health_water_logs (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS health_exercise_logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        calories INTEGER,
        steps INTEGER,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      -- Finance tables
      CREATE TABLE IF NOT EXISTS finance_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      -- Fashion tables
      CREATE TABLE IF NOT EXISTS fashion_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT,
        brand TEXT,
        purchase_date TEXT,
        purchase_price REAL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS fashion_outfits (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        occasion TEXT,
        weather TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS fashion_outfit_items (
        outfit_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        PRIMARY KEY (outfit_id, item_id)
      );
    `);
    
    // Insert default finance categories
    const categories = [
      { name: 'Salary', type: 'income', color: '#54e88a', icon: '💵' },
      { name: 'Food', type: 'expense', color: '#e85454', icon: '🍔' },
    ];
    const stmt = db.prepare('INSERT INTO finance_categories (id, name, type, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    for (const cat of categories) {
      stmt.run(cat.name + '-id', cat.name, cat.type, cat.color, cat.icon, new Date().toISOString());
    }
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    // Clear test data but keep schema
    db.prepare('DELETE FROM health_water_logs').run();
    db.prepare('DELETE FROM health_exercise_logs').run();
    db.prepare('DELETE FROM finance_transactions').run();
    db.prepare('DELETE FROM fashion_items').run();
    db.prepare('DELETE FROM fashion_outfit_items').run();
    db.prepare('DELETE FROM fashion_outfits').run();
    
    // Create plugin with managers
    plugin = new OpenClawPlugin();
    plugin.setManagers({
      db,
      healthService: new HealthService(db),
      financeService: new FinanceService(db),
      fashionService: new FashionService(db),
    });
  });

  describe('Health Tools', () => {
    describe('health_log_water', () => {
      it('should log water intake successfully', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'health_log_water',
          payload: { amount: 500 },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('data');
        expect((result as any).data.amount).toBe(500);
      });

      it('should log water with custom date', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'health_log_water',
          payload: { amount: 300, date: '2026-03-15' },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.date).toContain('2026-03-15');
      });

      it('should return error when amount is missing', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'health_log_water',
          payload: {},
        };

        // This should fail due to missing required param
        const tools = plugin.getTools();
        const tool = tools.find(t => t.name === 'health_log_water');
        
        await expect(tool?.handler({})).rejects.toThrow();
      });
    });

    describe('health_log_exercise', () => {
      it('should log exercise successfully', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'health_log_exercise',
          payload: { activity: 'running', duration: 30 },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.type).toBe('running');
        expect((result as any).data.duration).toBe(30);
      });
    });

    describe('health_query', () => {
      it('should query water logs', async () => {
        // First log some water
        const logMessage: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'health_log_water',
          payload: { amount: 500 },
        };
        await plugin.handleGatewayMessage(logMessage);

        // Then query
        const queryMessage: GatewayMessage = {
          id: '2',
          type: 'request',
          action: 'health_query',
          payload: { type: 'water' },
        };

        const result = await plugin.handleGatewayMessage(queryMessage);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.todayTotal).toBe(500);
      });
    });
  });

  describe('Finance Tools', () => {
    describe('finance_record', () => {
      it('should record expense successfully', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'finance_record',
          payload: { type: 'expense', amount: 100, category: 'food' },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.amount).toBe(100);
        expect((result as any).data.type).toBe('expense');
      });

      it('should record income successfully', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'finance_record',
          payload: { type: 'income', amount: 5000, category: 'salary' },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.amount).toBe(5000);
        expect((result as any).data.type).toBe('income');
      });
    });

    describe('finance_query', () => {
      it('should query all transactions', async () => {
        // First record some transactions
        const msg1: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'finance_record',
          payload: { type: 'expense', amount: 50 },
        };
        await plugin.handleGatewayMessage(msg1);

        const msg2: GatewayMessage = {
          id: '2',
          type: 'request',
          action: 'finance_record',
          payload: { type: 'income', amount: 3000 },
        };
        await plugin.handleGatewayMessage(msg2);

        // Then query
        const queryMsg: GatewayMessage = {
          id: '3',
          type: 'request',
          action: 'finance_query',
          payload: {},
        };

        const result = await plugin.handleGatewayMessage(queryMsg);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.length).toBe(2);
      });
    });

    describe('finance_report', () => {
      it('should get finance summary', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'finance_report',
          payload: { startDate: '2026-01-01', endDate: '2026-12-31' },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data).toHaveProperty('income');
        expect((result as any).data).toHaveProperty('expense');
      });
    });
  });

  describe('Fashion Tools', () => {
    describe('fashion_add_item', () => {
      it('should add wardrobe item successfully', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'fashion_add_item',
          payload: { name: 'Red T-Shirt', category: 'top', color: 'red' },
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.name).toBe('Red T-Shirt');
        expect((result as any).data.category).toBe('top');
      });
    });

    describe('fashion_log_outfit', () => {
      it('should log outfit with items', async () => {
        // First add an item
        const addMsg: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'fashion_add_item',
          payload: { name: 'Blue Jeans', category: 'bottom' },
        };
        const addResult = await plugin.handleGatewayMessage(addMsg);
        const itemId = (addResult as any).data.id;

        // Then log outfit
        const outfitMsg: GatewayMessage = {
          id: '2',
          type: 'request',
          action: 'fashion_log_outfit',
          payload: { name: 'Casual Outfit', items: [itemId], occasion: 'casual' },
        };

        const result = await plugin.handleGatewayMessage(outfitMsg);

        expect(result).toHaveProperty('success', true);
        expect((result as any).data.name).toBe('Casual Outfit');
      });
    });

    describe('fashion_recommend', () => {
      it('should get outfit recommendations', async () => {
        const message: GatewayMessage = {
          id: '1',
          type: 'request',
          action: 'fashion_recommend',
          payload: {},
        };

        const result = await plugin.handleGatewayMessage(message);

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('data');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when managers not initialized', async () => {
      const uninitializedPlugin = new OpenClawPlugin();
      
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'health_log_water',
        payload: { amount: 500 },
      };

      await expect(uninitializedPlugin.handleGatewayMessage(message)).rejects.toThrow('HealthService not initialized');
    });

    it('should throw error for unknown action', async () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'unknown_tool',
        payload: {},
      };

      await expect(plugin.handleGatewayMessage(message)).rejects.toThrow('Unknown action');
    });
  });

  describe('Natural Language Processing', () => {
    it('should process NL and execute tool', async () => {
      plugin.setNLUParser(async (input: string) => {
        if (input.includes('water') || input.includes('喝')) {
          return { tool: 'health_log_water', args: { amount: 500 } };
        }
        if (input.includes('spent') || input.includes('花了')) {
          return { tool: 'finance_record', args: { type: 'expense', amount: 100 } };
        }
        return { tool: '', args: {}, error: 'Could not understand' };
      });

      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: '我喝了500ml水',
      };

      const result = await plugin.handleGatewayMessage(message);

      expect(result).toHaveProperty('success', true);
      expect((result as any).parsed.tool).toBe('health_log_water');
    });

    it('should return error when NLU parser fails', async () => {
      plugin.setNLUParser(async () => {
        return { tool: '', args: {}, error: 'Could not understand the request' };
      });

      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: 'some random text',
      };

      const result = await plugin.handleGatewayMessage(message);

      expect(result).toHaveProperty('success', false);
      expect((result as any).error).toBeDefined();
    });
  });
});
