import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string | null;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'fund' | 'insurance' | 'gold' | 'other';
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  name: string;
  category_id: string | null;
  amount: number;
  due_day: number;
  payment_method: string | null;
  next_due_date: string;
  last_paid_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class FinanceService {
  private db: any;

  constructor(db: any) {
    this.db = db;
    this.initDefaultCategories();
  }

  private initDefaultCategories(): void {
    const existing = this.db.prepare('SELECT COUNT(*) as count FROM finance_categories').get() as { count: number };
    if (existing.count > 0) return;

    const categories = [
      { name: 'Salary', type: 'income', color: '#54e88a', icon: '💵' },
      { name: 'Investment', type: 'income', color: '#54e8a8', icon: '📈' },
      { name: 'Other Income', type: 'income', color: '#54c8e8', icon: '💰' },
      { name: 'Food', type: 'expense', color: '#e85454', icon: '🍔' },
      { name: 'Transport', type: 'expense', color: '#e8a854', icon: '🚗' },
      { name: 'Shopping', type: 'expense', color: '#e854a8', icon: '🛍️' },
      { name: 'Entertainment', type: 'expense', color: '#a854e8', icon: '🎮' },
      { name: 'Utilities', type: 'expense', color: '#54a8e8', icon: '💡' },
      { name: 'Healthcare', type: 'expense', color: '#e85454', icon: '🏥' },
      { name: 'Other Expense', type: 'expense', color: '#888888', icon: '📝' },
    ];

    const stmt = this.db.prepare(
      'INSERT INTO finance_categories (id, name, type, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const cat of categories) {
      stmt.run(uuidv4(), cat.name, cat.type, cat.color, cat.icon, new Date().toISOString());
    }
  }

  createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO finance_transactions (id, category_id, amount, type, description, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.category_id, data.amount, data.type, data.description || null, data.date, now, now);

    return this.getTransaction(id)!;
  }

  getTransaction(id: string): Transaction | null {
    return this.db.prepare('SELECT * FROM finance_transactions WHERE id = ?').get(id) as Transaction | null;
  }

  getTransactions(options: { limit?: number; offset?: number; startDate?: string; endDate?: string; type?: string } = {}): Transaction[] {
    let sql = 'SELECT * FROM finance_transactions WHERE 1=1';
    const params: any[] = [];

    if (options.startDate) {
      sql += ' AND date >= ?';
      params.push(options.startDate);
    }
    if (options.endDate) {
      sql += ' AND date <= ?';
      params.push(options.endDate);
    }
    if (options.type) {
      sql += ' AND type = ?';
      params.push(options.type);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    return this.db.prepare(sql).all(...params) as Transaction[];
  }

  updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'created_at'>>): Transaction | null {
    const existing = this.getTransaction(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE finance_transactions
      SET category_id = ?, amount = ?, type = ?, description = ?, date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.category_id ?? existing.category_id,
      data.amount ?? existing.amount,
      data.type ?? existing.type,
      data.description ?? existing.description,
      data.date ?? existing.date,
      now,
      id
    );

    return this.getTransaction(id);
  }

  deleteTransaction(id: string): boolean {
    const result = this.db.prepare('DELETE FROM finance_transactions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getCategories(type?: 'income' | 'expense'): Category[] {
    if (type) {
      return this.db.prepare('SELECT * FROM finance_categories WHERE type = ? ORDER BY name').all(type) as Category[];
    }
    return this.db.prepare('SELECT * FROM finance_categories ORDER BY type, name').all() as Category[];
  }

  getSummary(startDate?: string, endDate?: string) {
    let whereClause = '1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND date <= ?';
      params.push(endDate);
    }

    const income = this.db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE ${whereClause} AND type = 'income'`
    ).get(...params) as { total: number };

    const expense = this.db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE ${whereClause} AND type = 'expense'`
    ).get(...params) as { total: number };

    const byCategory = this.db.prepare(`
      SELECT c.id, c.name, c.color, c.icon, c.type, COALESCE(SUM(t.amount), 0) as total
      FROM finance_categories c
      LEFT JOIN finance_transactions t ON c.id = t.category_id AND ${whereClause}
      GROUP BY c.id
      ORDER BY c.type, total DESC
    `).all(...params);

    return {
      income: income.total,
      expense: expense.total,
      balance: income.total - expense.total,
      byCategory,
    };
  }

  // ==================== BUDGET METHODS ====================
  createBudget(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Budget {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO finance_budgets (id, category_id, amount, period, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.category_id, data.amount, data.period, now, now);

    return this.getBudget(id)!;
  }

  getBudget(id: string): Budget | null {
    return this.db.prepare('SELECT * FROM finance_budgets WHERE id = ?').get(id) as Budget | null;
  }

  getBudgets(categoryId?: string): Budget[] {
    if (categoryId) {
      return this.db.prepare('SELECT * FROM finance_budgets WHERE category_id = ? ORDER BY period').all(categoryId) as Budget[];
    }
    return this.db.prepare('SELECT * FROM finance_budgets ORDER BY period, category_id').all() as Budget[];
  }

  updateBudget(id: string, data: Partial<Omit<Budget, 'id' | 'created_at'>>): Budget | null {
    const existing = this.getBudget(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE finance_budgets
      SET category_id = ?, amount = ?, period = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.category_id ?? existing.category_id,
      data.amount ?? existing.amount,
      data.period ?? existing.period,
      now,
      id
    );

    return this.getBudget(id);
  }

  deleteBudget(id: string): boolean {
    const result = this.db.prepare('DELETE FROM finance_budgets WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getBudgetProgress(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const now = new Date();
    let startDate: string, endDate: string;

    if (period === 'daily') {
      startDate = endDate = now.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      startDate = start.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      endDate = now.toISOString().split('T')[0];
    }

    const budgets = this.getBudgets();
    const expenses = this.db.prepare(`
      SELECT category_id, SUM(amount) as spent
      FROM finance_transactions
      WHERE type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category_id
    `).all(startDate, endDate) as Array<{ category_id: string; spent: number }>;

    const expenseMap = new Map(expenses.map(e => [e.category_id, e.spent]));

    return budgets.map(budget => {
      const spent = budget.category_id ? (expenseMap.get(budget.category_id) || 0) : 
        expenses.reduce((sum, e) => sum + e.spent, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.round(percentage * 10) / 10,
        isOverBudget: spent > budget.amount,
      };
    });
  }

  // ==================== INVESTMENT METHODS ====================
  createInvestment(data: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Investment {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO finance_investments (id, name, type, purchase_price, current_price, quantity, purchase_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.type, data.purchase_price, data.current_price, data.quantity, data.purchase_date, data.notes || null, now, now);

    return this.getInvestment(id)!;
  }

  getInvestment(id: string): Investment | null {
    return this.db.prepare('SELECT * FROM finance_investments WHERE id = ?').get(id) as Investment | null;
  }

  getInvestments(type?: Investment['type']): Investment[] {
    if (type) {
      return this.db.prepare('SELECT * FROM finance_investments WHERE type = ? ORDER BY name').all(type) as Investment[];
    }
    return this.db.prepare('SELECT * FROM finance_investments ORDER BY type, name').all() as Investment[];
  }

  updateInvestment(id: string, data: Partial<Omit<Investment, 'id' | 'created_at'>>): Investment | null {
    const existing = this.getInvestment(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE finance_investments
      SET name = ?, type = ?, purchase_price = ?, current_price = ?, quantity = ?, purchase_date = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.type ?? existing.type,
      data.purchase_price ?? existing.purchase_price,
      data.current_price ?? existing.current_price,
      data.quantity ?? existing.quantity,
      data.purchase_date ?? existing.purchase_date,
      data.notes ?? existing.notes,
      now,
      id
    );

    return this.getInvestment(id);
  }

  deleteInvestment(id: string): boolean {
    const result = this.db.prepare('DELETE FROM finance_investments WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getInvestmentSummary() {
    const investments = this.getInvestments();
    
    let totalValue = 0;
    let totalCost = 0;
    const byType: Record<string, { count: number; value: number; cost: number; pnl: number }> = {};

    for (const inv of investments) {
      const value = inv.current_price * inv.quantity;
      const cost = inv.purchase_price * inv.quantity;
      totalValue += value;
      totalCost += cost;

      if (!byType[inv.type]) {
        byType[inv.type] = { count: 0, value: 0, cost: 0, pnl: 0 };
      }
      byType[inv.type].count++;
      byType[inv.type].value += value;
      byType[inv.type].cost += cost;
    }

    const sortedByPnl = [...investments].map(inv => ({
      ...inv,
      pnl: (inv.current_price - inv.purchase_price) * inv.quantity,
      pnlPercent: ((inv.current_price - inv.purchase_price) / inv.purchase_price) * 100,
    })).sort((a, b) => b.pnl - a.pnl);

    return {
      totalValue,
      totalCost,
      totalPnl: totalValue - totalCost,
      totalPnlPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      byType,
      bestPerformer: sortedByPnl[0] || null,
      worstPerformer: sortedByPnl[sortedByPnl.length - 1] || null,
    };
  }

  // ==================== BILL METHODS ====================
  createBill(data: Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'next_due_date'>): Bill {
    const id = uuidv4();
    const now = new Date();
    const nextDueDate = this.calculateNextDueDate(data.due_day, now);

    this.db.prepare(`
      INSERT INTO finance_bills (id, name, category_id, amount, due_day, payment_method, next_due_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.category_id, data.amount, data.due_day, data.payment_method || null, nextDueDate, data.is_active !== false, now.toISOString(), now.toISOString());

    return this.getBill(id)!;
  }

  private calculateNextDueDate(dueDay: number, fromDate: Date = new Date()): string {
    const next = new Date(fromDate.getFullYear(), fromDate.getMonth(), dueDay);
    if (next <= fromDate) {
      next.setMonth(next.getMonth() + 1);
    }
    return next.toISOString().split('T')[0];
  }

  getBill(id: string): Bill | null {
    return this.db.prepare('SELECT * FROM finance_bills WHERE id = ?').get(id) as Bill | null;
  }

  getBills(includeInactive: boolean = false): Bill[] {
    if (includeInactive) {
      return this.db.prepare('SELECT * FROM finance_bills ORDER BY due_day').all() as Bill[];
    }
    return this.db.prepare('SELECT * FROM finance_bills WHERE is_active = 1 ORDER BY due_day').all() as Bill[];
  }

  updateBill(id: string, data: Partial<Omit<Bill, 'id' | 'created_at' | 'updated_at'>>): Bill | null {
    const existing = this.getBill(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    let nextDueDate = existing.next_due_date;
    
    if (data.due_day && data.due_day !== existing.due_day) {
      nextDueDate = this.calculateNextDueDate(data.due_day, new Date());
    }

    this.db.prepare(`
      UPDATE finance_bills
      SET name = ?, category_id = ?, amount = ?, due_day = ?, payment_method = ?, next_due_date = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.name ?? existing.name,
      data.category_id ?? existing.category_id,
      data.amount ?? existing.amount,
      data.due_day ?? existing.due_day,
      data.payment_method ?? existing.payment_method,
      nextDueDate,
      data.is_active ?? existing.is_active,
      now,
      id
    );

    return this.getBill(id);
  }

  deleteBill(id: string): boolean {
    const result = this.db.prepare('DELETE FROM finance_bills WHERE id = ?').run(id);
    return result.changes > 0;
  }

  markBillPaid(id: string): Bill | null {
    const bill = this.getBill(id);
    if (!bill) return null;

    const now = new Date();
    const nextDueDate = this.calculateNextDueDate(bill.due_day, now);

    this.db.prepare(`
      UPDATE finance_bills
      SET last_paid_date = ?, next_due_date = ?, updated_at = ?
      WHERE id = ?
    `).run(now.toISOString().split('T')[0], nextDueDate, now.toISOString(), id);

    return this.getBill(id);
  }

  getUpcomingBills(days: number = 30): Bill[] {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    return this.db.prepare(`
      SELECT * FROM finance_bills
      WHERE is_active = 1 AND next_due_date <= ?
      ORDER BY next_due_date
    `).all(endDate.toISOString().split('T')[0]) as Bill[];
  }

  // ==================== REPORT METHODS ====================
  getMonthlyReport(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const income = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
      WHERE type = 'income' AND date >= ? AND date <= ?
    `).get(startDate, endDate) as { total: number };

    const expense = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
      WHERE type = 'expense' AND date >= ? AND date <= ?
    `).get(startDate, endDate) as { total: number };

    const byCategory = this.db.prepare(`
      SELECT c.id, c.name, c.color, c.icon, c.type, COALESCE(SUM(t.amount), 0) as total
      FROM finance_categories c
      LEFT JOIN finance_transactions t ON c.id = t.category_id AND t.date >= ? AND t.date <= ?
      GROUP BY c.id
      ORDER BY c.type, total DESC
    `).all(startDate, endDate);

    // Previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevIncome = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
      WHERE type = 'income' AND date >= ? AND date <= ?
    `).get(`${prevYear}-${String(prevMonth).padStart(2, '0')}-01`, `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`) as { total: number };

    const prevExpense = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
      WHERE type = 'expense' AND date >= ? AND date <= ?
    `).get(`${prevYear}-${String(prevMonth).padStart(2, '0')}-01`, `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`) as { total: number };

    return {
      year,
      month,
      income: income.total,
      expense: expense.total,
      net: income.total - expense.total,
      incomeChange: prevIncome.total > 0 ? ((income.total - prevIncome.total) / prevIncome.total) * 100 : 0,
      expenseChange: prevExpense.total > 0 ? ((expense.total - prevExpense.total) / prevExpense.total) * 100 : 0,
      byCategory,
    };
  }

  exportTransactionsCSV(startDate?: string, endDate?: string): string {
    const transactions = this.getTransactions({ startDate, endDate, limit: 10000 });
    
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = transactions.map(t => {
      const category = this.db.prepare('SELECT name FROM finance_categories WHERE id = ?').get(t.category_id) as { name: string } | undefined;
      return [
        t.date,
        t.type,
        category?.name || '',
        t.amount.toString(),
        t.description || '',
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
