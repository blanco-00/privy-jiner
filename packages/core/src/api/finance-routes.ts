import { Router, Request, Response } from 'express';
import { FinanceService } from '../modules/finance/index.js';

export function createFinanceRouter(financeService: FinanceService): Router {
  const router = Router();

  router.post('/transactions', async (req: Request, res: Response) => {
    try {
      const { category_id, amount, type, description, date } = req.body;

      if (!amount || !type || !date) {
        res.status(400).json({ error: 'amount, type, and date are required' });
        return;
      }

      if (!['income', 'expense'].includes(type)) {
        res.status(400).json({ error: 'type must be income or expense' });
        return;
      }

      const transaction = financeService.createTransaction({
        category_id: category_id || null,
        amount: parseFloat(amount),
        type,
        description: description || null,
        date,
      });

      res.json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  router.get('/transactions', async (req: Request, res: Response) => {
    try {
      const { limit, offset, startDate, endDate, type } = req.query;

      const transactions = financeService.getTransactions({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string,
      });

      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  });

  router.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const transaction = financeService.getTransaction(req.params.id);

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to get transaction' });
    }
  });

  router.put('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { category_id, amount, type, description, date } = req.body;

      const transaction = financeService.updateTransaction(req.params.id, {
        category_id,
        amount: amount ? parseFloat(amount) : undefined,
        type,
        description,
        date,
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  });

  router.delete('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const success = financeService.deleteTransaction(req.params.id);

      if (!success) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });

  router.get('/categories', async (_req: Request, res: Response) => {
    try {
      const { type } = _req.query;
      const categories = financeService.getCategories(type as any);
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  });

  router.get('/summary', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const summary = financeService.getSummary(startDate as string, endDate as string);
      res.json(summary);
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: 'Failed to get summary' });
    }
  });

  router.get('/budgets', async (req: Request, res: Response) => {
    try {
      const { category_id } = req.query;
      const budgets = financeService.getBudgets(category_id as string);
      res.json(budgets);
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({ error: 'Failed to get budgets' });
    }
  });

  router.get('/budgets/progress', async (req: Request, res: Response) => {
    try {
      const { period } = req.query;
      const progress = financeService.getBudgetProgress(period as any);
      res.json(progress);
    } catch (error) {
      console.error('Get budget progress error:', error);
      res.status(500).json({ error: 'Failed to get budget progress' });
    }
  });

  router.post('/budgets', async (req: Request, res: Response) => {
    try {
      const { category_id, amount, period } = req.body;
      if (!amount || !period) {
        res.status(400).json({ error: 'amount and period are required' });
        return;
      }
      const budget = financeService.createBudget({
        category_id: category_id || null,
        amount: parseFloat(amount),
        period,
      });
      res.json(budget);
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  });

  router.put('/budgets/:id', async (req: Request, res: Response) => {
    try {
      const { category_id, amount, period } = req.body;
      const budget = financeService.updateBudget(req.params.id, {
        category_id,
        amount: amount ? parseFloat(amount) : undefined,
        period,
      });
      if (!budget) {
        res.status(404).json({ error: 'Budget not found' });
        return;
      }
      res.json(budget);
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({ error: 'Failed to update budget' });
    }
  });

  router.delete('/budgets/:id', async (req: Request, res: Response) => {
    try {
      const success = financeService.deleteBudget(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Budget not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({ error: 'Failed to delete budget' });
    }
  });

  router.get('/investments', async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const investments = financeService.getInvestments(type as any);
      res.json(investments);
    } catch (error) {
      console.error('Get investments error:', error);
      res.status(500).json({ error: 'Failed to get investments' });
    }
  });

  router.get('/investments/summary', async (_req: Request, res: Response) => {
    try {
      const summary = financeService.getInvestmentSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get investment summary error:', error);
      res.status(500).json({ error: 'Failed to get investment summary' });
    }
  });

  router.post('/investments', async (req: Request, res: Response) => {
    try {
      const { name, type, purchase_price, current_price, quantity, purchase_date, notes } = req.body;
      if (!name || !type || !purchase_price || !current_price || !quantity || !purchase_date) {
        res.status(400).json({ error: 'name, type, purchase_price, current_price, quantity, purchase_date are required' });
        return;
      }
      const investment = financeService.createInvestment({
        name,
        type,
        purchase_price: parseFloat(purchase_price),
        current_price: parseFloat(current_price),
        quantity: parseFloat(quantity),
        purchase_date,
        notes: notes || null,
      });
      res.json(investment);
    } catch (error) {
      console.error('Create investment error:', error);
      res.status(500).json({ error: 'Failed to create investment' });
    }
  });

  router.put('/investments/:id', async (req: Request, res: Response) => {
    try {
      const { name, type, purchase_price, current_price, quantity, purchase_date, notes } = req.body;
      const investment = financeService.updateInvestment(req.params.id, {
        name,
        type,
        purchase_price: purchase_price ? parseFloat(purchase_price) : undefined,
        current_price: current_price ? parseFloat(current_price) : undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        purchase_date,
        notes,
      });
      if (!investment) {
        res.status(404).json({ error: 'Investment not found' });
        return;
      }
      res.json(investment);
    } catch (error) {
      console.error('Update investment error:', error);
      res.status(500).json({ error: 'Failed to update investment' });
    }
  });

  router.delete('/investments/:id', async (req: Request, res: Response) => {
    try {
      const success = financeService.deleteInvestment(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Investment not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete investment error:', error);
      res.status(500).json({ error: 'Failed to delete investment' });
    }
  });

  router.get('/bills', async (req: Request, res: Response) => {
    try {
      const { include_inactive } = req.query;
      const bills = financeService.getBills(include_inactive === 'true');
      res.json(bills);
    } catch (error) {
      console.error('Get bills error:', error);
      res.status(500).json({ error: 'Failed to get bills' });
    }
  });

  router.get('/bills/upcoming', async (req: Request, res: Response) => {
    try {
      const { days } = req.query;
      const bills = financeService.getUpcomingBills(days ? parseInt(days as string) : 30);
      res.json(bills);
    } catch (error) {
      console.error('Get upcoming bills error:', error);
      res.status(500).json({ error: 'Failed to get upcoming bills' });
    }
  });

  router.post('/bills', async (req: Request, res: Response) => {
    try {
      const { name, category_id, amount, due_day, payment_method, is_active } = req.body;
      if (!name || !amount || !due_day) {
        res.status(400).json({ error: 'name, amount, and due_day are required' });
        return;
      }
      const bill = financeService.createBill({
        name,
        category_id: category_id || null,
        amount: parseFloat(amount),
        due_day: parseInt(due_day),
        payment_method: payment_method || null,
        is_active: is_active !== false,
        last_paid_date: null,
      });
      res.json(bill);
    } catch (error) {
      console.error('Create bill error:', error);
      res.status(500).json({ error: 'Failed to create bill' });
    }
  });

  router.put('/bills/:id', async (req: Request, res: Response) => {
    try {
      const { name, category_id, amount, due_day, payment_method, is_active } = req.body;
      const bill = financeService.updateBill(req.params.id, {
        name,
        category_id,
        amount: amount ? parseFloat(amount) : undefined,
        due_day: due_day ? parseInt(due_day) : undefined,
        payment_method,
        is_active,
      });
      if (!bill) {
        res.status(404).json({ error: 'Bill not found' });
        return;
      }
      res.json(bill);
    } catch (error) {
      console.error('Update bill error:', error);
      res.status(500).json({ error: 'Failed to update bill' });
    }
  });

  router.post('/bills/:id/paid', async (req: Request, res: Response) => {
    try {
      const bill = financeService.markBillPaid(req.params.id);
      if (!bill) {
        res.status(404).json({ error: 'Bill not found' });
        return;
      }
      res.json(bill);
    } catch (error) {
      console.error('Mark bill paid error:', error);
      res.status(500).json({ error: 'Failed to mark bill as paid' });
    }
  });

  router.delete('/bills/:id', async (req: Request, res: Response) => {
    try {
      const success = financeService.deleteBill(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Bill not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete bill error:', error);
      res.status(500).json({ error: 'Failed to delete bill' });
    }
  });

  router.get('/reports/monthly', async (req: Request, res: Response) => {
    try {
      const { year, month } = req.query;
      const now = new Date();
      const y = year ? parseInt(year as string) : now.getFullYear();
      const m = month ? parseInt(month as string) : now.getMonth() + 1;
      const report = financeService.getMonthlyReport(y, m);
      res.json(report);
    } catch (error) {
      console.error('Get monthly report error:', error);
      res.status(500).json({ error: 'Failed to get monthly report' });
    }
  });

  router.get('/reports/export', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const csv = financeService.exportTransactionsCSV(startDate as string, endDate as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export transactions' });
    }
  });

  return router;
}
