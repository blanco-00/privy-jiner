import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'crypto' | 'fund' | 'other';
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  dueDay: number;
  autoPay: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FinanceManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
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

  addRecord(record: Omit<FinanceRecord, 'id' | 'createdAt' | 'updatedAt'>): FinanceRecord {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO finance_records (id, type, amount, currency, category, description, date, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      record.type,
      record.amount,
      record.currency,
      record.category,
      record.description || null,
      record.date.toISOString(),
      now,
      now,
      record.metadata ? JSON.stringify(record.metadata) : null
    );

    return this.getRecord(id)!;
  }

  getRecord(id: string): FinanceRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM finance_records WHERE id = ?');
    const row = stmt.get(id) as FinanceRecordRow | undefined;
    return row ? this.mapRowToRecord(row) : undefined;
  }

  listRecords(filter?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): FinanceRecord[] {
    let sql = 'SELECT * FROM finance_records WHERE 1=1';
    const params: unknown[] = [];

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
    const rows = stmt.all(...params) as FinanceRecordRow[];
    return rows.map(row => this.mapRowToRecord(row));
  }

  getSummary(startDate: Date, endDate: Date): { income: number; expense: number; balance: number; byCategory: Record<string, number> } {
    const records = this.listRecords({ startDate, endDate });

    let income = 0;
    let expense = 0;
    const byCategory: Record<string, number> = {};

    for (const record of records) {
      if (record.type === 'income') {
        income += record.amount;
      } else {
        expense += record.amount;
      }
      byCategory[record.category] = (byCategory[record.category] || 0) + (record.type === 'expense' ? record.amount : 0);
    }

    return { income, expense, balance: income - expense, byCategory };
  }

  addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO budgets (id, category, amount, currency, period, start_date, end_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      budget.category,
      budget.amount,
      budget.currency,
      budget.period,
      budget.startDate.toISOString(),
      budget.endDate?.toISOString() || null,
      now,
      now
    );

    return this.getBudget(id)!;
  }

  getBudget(id: string): Budget | undefined {
    const stmt = this.db.prepare('SELECT * FROM budgets WHERE id = ?');
    const row = stmt.get(id) as BudgetRow | undefined;
    return row ? this.mapRowToBudget(row) : undefined;
  }

  listBudgets(): Budget[] {
    const stmt = this.db.prepare('SELECT * FROM budgets ORDER BY created_at DESC');
    const rows = stmt.all() as BudgetRow[];
    return rows.map(row => this.mapRowToBudget(row));
  }

  checkBudgetStatus(budgetId: string): { spent: number; remaining: number; percent: number } | undefined {
    const budget = this.getBudget(budgetId);
    if (!budget) return undefined;

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

  addInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Investment {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO investments (id, name, type, symbol, quantity, purchase_price, current_price, currency, purchase_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      investment.name,
      investment.type,
      investment.symbol || null,
      investment.quantity,
      investment.purchasePrice,
      investment.currentPrice,
      investment.currency,
      investment.purchaseDate.toISOString(),
      now,
      now
    );

    return this.getInvestment(id)!;
  }

  getInvestment(id: string): Investment | undefined {
    const stmt = this.db.prepare('SELECT * FROM investments WHERE id = ?');
    const row = stmt.get(id) as InvestmentRow | undefined;
    return row ? this.mapRowToInvestment(row) : undefined;
  }

  listInvestments(): Investment[] {
    const stmt = this.db.prepare('SELECT * FROM investments ORDER BY created_at DESC');
    const rows = stmt.all() as InvestmentRow[];
    return rows.map(row => this.mapRowToInvestment(row));
  }

  updateInvestmentPrice(id: string, currentPrice: number): Investment | undefined {
    const existing = this.getInvestment(id);
    if (!existing) return undefined;

    const stmt = this.db.prepare('UPDATE investments SET current_price = ?, updated_at = ? WHERE id = ?');
    stmt.run(currentPrice, new Date().toISOString(), id);

    return this.getInvestment(id);
  }

  getPortfolioValue(): { totalValue: number; totalCost: number; profitLoss: number; profitLossPercent: number } {
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

  addRecurringBill(bill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>): RecurringBill {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO recurring_bills (id, name, amount, currency, category, due_day, auto_pay, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      bill.name,
      bill.amount,
      bill.currency,
      bill.category,
      bill.dueDay,
      bill.autoPay ? 1 : 0,
      bill.enabled ? 1 : 0,
      now,
      now
    );

    return this.getRecurringBill(id)!;
  }

  getRecurringBill(id: string): RecurringBill | undefined {
    const stmt = this.db.prepare('SELECT * FROM recurring_bills WHERE id = ?');
    const row = stmt.get(id) as RecurringBillRow | undefined;
    return row ? this.mapRowToRecurringBill(row) : undefined;
  }

  listRecurringBills(enabledOnly = false): RecurringBill[] {
    let sql = 'SELECT * FROM recurring_bills';
    if (enabledOnly) {
      sql += ' WHERE enabled = 1';
    }
    sql += ' ORDER BY due_day ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all() as RecurringBillRow[];
    return rows.map(row => this.mapRowToRecurringBill(row));
  }

  getUpcomingBills(days = 7): Array<RecurringBill & { dueDate: Date; daysUntilDue: number }> {
    const bills = this.listRecurringBills(true);
    const result: Array<RecurringBill & { dueDate: Date; daysUntilDue: number }> = [];
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

  private getPeriodStart(period: Budget['period'], startDate: Date): Date {
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

  private mapRowToRecord(row: FinanceRecordRow): FinanceRecord {
    return {
      id: row.id,
      type: row.type as FinanceRecord['type'],
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

  private mapRowToBudget(row: BudgetRow): Budget {
    return {
      id: row.id,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      period: row.period as Budget['period'],
      startDate: new Date(row.start_date),
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToInvestment(row: InvestmentRow): Investment {
    return {
      id: row.id,
      name: row.name,
      type: row.type as Investment['type'],
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

  private mapRowToRecurringBill(row: RecurringBillRow): RecurringBill {
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

interface FinanceRecordRow {
  id: string;
  type: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  metadata: string | null;
}

interface BudgetRow {
  id: string;
  category: string;
  amount: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface InvestmentRow {
  id: string;
  name: string;
  type: string;
  symbol: string | null;
  quantity: number;
  purchase_price: number;
  current_price: number;
  currency: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

interface RecurringBillRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  due_day: number;
  auto_pay: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}
