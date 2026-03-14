import Database from 'better-sqlite3';
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
export declare class FinanceManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    addRecord(record: Omit<FinanceRecord, 'id' | 'createdAt' | 'updatedAt'>): FinanceRecord;
    getRecord(id: string): FinanceRecord | undefined;
    listRecords(filter?: {
        type?: 'income' | 'expense';
        category?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): FinanceRecord[];
    getSummary(startDate: Date, endDate: Date): {
        income: number;
        expense: number;
        balance: number;
        byCategory: Record<string, number>;
    };
    addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget;
    getBudget(id: string): Budget | undefined;
    listBudgets(): Budget[];
    checkBudgetStatus(budgetId: string): {
        spent: number;
        remaining: number;
        percent: number;
    } | undefined;
    addInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Investment;
    getInvestment(id: string): Investment | undefined;
    listInvestments(): Investment[];
    updateInvestmentPrice(id: string, currentPrice: number): Investment | undefined;
    getPortfolioValue(): {
        totalValue: number;
        totalCost: number;
        profitLoss: number;
        profitLossPercent: number;
    };
    addRecurringBill(bill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>): RecurringBill;
    getRecurringBill(id: string): RecurringBill | undefined;
    listRecurringBills(enabledOnly?: boolean): RecurringBill[];
    getUpcomingBills(days?: number): Array<RecurringBill & {
        dueDate: Date;
        daysUntilDue: number;
    }>;
    private getPeriodStart;
    private mapRowToRecord;
    private mapRowToBudget;
    private mapRowToInvestment;
    private mapRowToRecurringBill;
}
//# sourceMappingURL=index.d.ts.map