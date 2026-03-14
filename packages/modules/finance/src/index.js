"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceManager = void 0;
const uuid_1 = require("uuid");
class FinanceManager {
    db;
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS finance_records (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'CNY',
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'CNY',
        period TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        symbol TEXT,
        quantity REAL NOT NULL,
        purchase_price REAL NOT NULL,
        current_price REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'CNY',
        purchase_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recurring_bills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'CNY',
        category TEXT NOT NULL,
        due_day INTEGER NOT NULL,
        auto_pay INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_finance_records_date ON finance_records(date);
      CREATE INDEX IF NOT EXISTS idx_finance_records_category ON finance_records(category);
      CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
    `);
    }
    addRecord(record) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO finance_records (id, type, amount, currency, category, description, date, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, record.type, record.amount, record.currency, record.category, record.description || null, record.date.toISOString(), now, now, record.metadata ? JSON.stringify(record.metadata) : null);
        return this.getRecord(id);
    }
    getRecord(id) {
        const stmt = this.db.prepare('SELECT * FROM finance_records WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToRecord(row) : undefined;
    }
    listRecords(filter) {
        let sql = 'SELECT * FROM finance_records WHERE 1=1';
        const params = [];
        if (filter?.type) {
            sql += ' AND type = ?';
            params.push(filter.type);
        }
        if (filter?.category) {
            sql += ' AND category = ?';
            params.push(filter.category);
        }
        if (filter?.startDate) {
            sql += ' AND date >= ?';
            params.push(filter.startDate.toISOString());
        }
        if (filter?.endDate) {
            sql += ' AND date <= ?';
            params.push(filter.endDate.toISOString());
        }
        sql += ' ORDER BY date DESC';
        if (filter?.limit) {
            sql += ' LIMIT ?';
            params.push(filter.limit);
            if (filter?.offset) {
                sql += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToRecord(row));
    }
    getSummary(startDate, endDate) {
        const records = this.listRecords({ startDate, endDate });
        let income = 0;
        let expense = 0;
        const byCategory = {};
        for (const record of records) {
            if (record.type === 'income') {
                income += record.amount;
            }
            else {
                expense += record.amount;
            }
            byCategory[record.category] = (byCategory[record.category] || 0) + (record.type === 'expense' ? record.amount : 0);
        }
        return { income, expense, balance: income - expense, byCategory };
    }
    addBudget(budget) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO budgets (id, category, amount, currency, period, start_date, end_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, budget.category, budget.amount, budget.currency, budget.period, budget.startDate.toISOString(), budget.endDate?.toISOString() || null, now, now);
        return this.getBudget(id);
    }
    getBudget(id) {
        const stmt = this.db.prepare('SELECT * FROM budgets WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToBudget(row) : undefined;
    }
    listBudgets() {
        const stmt = this.db.prepare('SELECT * FROM budgets ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToBudget(row));
    }
    checkBudgetStatus(budgetId) {
        const budget = this.getBudget(budgetId);
        if (!budget)
            return undefined;
        const periodStart = this.getPeriodStart(budget.period, budget.startDate);
        const records = this.listRecords({
            type: 'expense',
            category: budget.category,
            startDate: periodStart,
        });
        const spent = records.reduce((sum, r) => sum + r.amount, 0);
        const remaining = budget.amount - spent;
        const percent = (spent / budget.amount) * 100;
        return { spent, remaining: Math.max(0, remaining), percent: Math.min(100, percent) };
    }
    addInvestment(investment) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO investments (id, name, type, symbol, quantity, purchase_price, current_price, currency, purchase_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, investment.name, investment.type, investment.symbol || null, investment.quantity, investment.purchasePrice, investment.currentPrice, investment.currency, investment.purchaseDate.toISOString(), now, now);
        return this.getInvestment(id);
    }
    getInvestment(id) {
        const stmt = this.db.prepare('SELECT * FROM investments WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToInvestment(row) : undefined;
    }
    listInvestments() {
        const stmt = this.db.prepare('SELECT * FROM investments ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => this.mapRowToInvestment(row));
    }
    updateInvestmentPrice(id, currentPrice) {
        const existing = this.getInvestment(id);
        if (!existing)
            return undefined;
        const stmt = this.db.prepare('UPDATE investments SET current_price = ?, updated_at = ? WHERE id = ?');
        stmt.run(currentPrice, new Date().toISOString(), id);
        return this.getInvestment(id);
    }
    getPortfolioValue() {
        const investments = this.listInvestments();
        let totalValue = 0;
        let totalCost = 0;
        for (const inv of investments) {
            totalCost += inv.purchasePrice * inv.quantity;
            totalValue += inv.currentPrice * inv.quantity;
        }
        const profitLoss = totalValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
        return { totalValue, totalCost, profitLoss, profitLossPercent };
    }
    addRecurringBill(bill) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO recurring_bills (id, name, amount, currency, category, due_day, auto_pay, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, bill.name, bill.amount, bill.currency, bill.category, bill.dueDay, bill.autoPay ? 1 : 0, bill.enabled ? 1 : 0, now, now);
        return this.getRecurringBill(id);
    }
    getRecurringBill(id) {
        const stmt = this.db.prepare('SELECT * FROM recurring_bills WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.mapRowToRecurringBill(row) : undefined;
    }
    listRecurringBills(enabledOnly = false) {
        let sql = 'SELECT * FROM recurring_bills';
        if (enabledOnly) {
            sql += ' WHERE enabled = 1';
        }
        sql += ' ORDER BY due_day ASC';
        const stmt = this.db.prepare(sql);
        const rows = stmt.all();
        return rows.map(row => this.mapRowToRecurringBill(row));
    }
    getUpcomingBills(days = 7) {
        const bills = this.listRecurringBills(true);
        const result = [];
        const today = new Date();
        for (const bill of bills) {
            const dueDate = new Date(today);
            dueDate.setDate(bill.dueDay);
            if (dueDate < today) {
                dueDate.setMonth(dueDate.getMonth() + 1);
            }
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue <= days) {
                result.push({ ...bill, dueDate, daysUntilDue });
            }
        }
        return result.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    }
    getPeriodStart(period, startDate) {
        const now = new Date();
        const start = new Date(startDate);
        switch (period) {
            case 'daily':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'weekly':
                const dayOfWeek = now.getDay();
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'yearly':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return start;
        }
    }
    mapRowToRecord(row) {
        return {
            id: row.id,
            type: row.type,
            amount: row.amount,
            currency: row.currency,
            category: row.category,
            description: row.description || undefined,
            date: new Date(row.date),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }
    mapRowToBudget(row) {
        return {
            id: row.id,
            category: row.category,
            amount: row.amount,
            currency: row.currency,
            period: row.period,
            startDate: new Date(row.start_date),
            endDate: row.end_date ? new Date(row.end_date) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToInvestment(row) {
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            symbol: row.symbol || undefined,
            quantity: row.quantity,
            purchasePrice: row.purchase_price,
            currentPrice: row.current_price,
            currency: row.currency,
            purchaseDate: new Date(row.purchase_date),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    mapRowToRecurringBill(row) {
        return {
            id: row.id,
            name: row.name,
            amount: row.amount,
            currency: row.currency,
            category: row.category,
            dueDay: row.due_day,
            autoPay: row.auto_pay === 1,
            enabled: row.enabled === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.FinanceManager = FinanceManager;
//# sourceMappingURL=index.js.map