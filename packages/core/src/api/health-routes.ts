import { Router, Request, Response } from 'express';
import { HealthService } from '../modules/health/index.js';

export function createHealthRouter(healthService: HealthService): Router {
  const router = Router();

  router.post('/water', async (req: Request, res: Response) => {
    try {
      const { amount, date } = req.body;

      if (!amount) {
        res.status(400).json({ error: 'amount is required' });
        return;
      }

      const logDate = date || new Date().toISOString().split('T')[0];
      const waterLog = healthService.logWater(parseInt(amount), logDate);

      res.json(waterLog);
    } catch (error) {
      console.error('Log water error:', error);
      res.status(500).json({ error: 'Failed to log water' });
    }
  });

  router.get('/water', async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const logs = healthService.getWaterLogs(date as string);
      res.json(logs);
    } catch (error) {
      console.error('Get water logs error:', error);
      res.status(500).json({ error: 'Failed to get water logs' });
    }
  });

  router.get('/water/today', async (_req: Request, res: Response) => {
    try {
      const total = healthService.getTodayWaterTotal();
      res.json({ today: total, goal: 2000 });
    } catch (error) {
      console.error('Get water today error:', error);
      res.status(500).json({ error: 'Failed to get water today' });
    }
  });

  router.post('/exercise', async (req: Request, res: Response) => {
    try {
      const { type, duration, calories, steps, date } = req.body;

      if (!type || !duration) {
        res.status(400).json({ error: 'type and duration are required' });
        return;
      }

      const logDate = date || new Date().toISOString().split('T')[0];
      const exerciseLog = healthService.logExercise({
        type,
        duration: parseInt(duration),
        calories: calories ? parseInt(calories) : undefined,
        steps: steps ? parseInt(steps) : undefined,
        date: logDate,
      });

      res.json(exerciseLog);
    } catch (error) {
      console.error('Log exercise error:', error);
      res.status(500).json({ error: 'Failed to log exercise' });
    }
  });

  router.get('/exercise', async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const logs = healthService.getExerciseLogs(date as string);
      res.json(logs);
    } catch (error) {
      console.error('Get exercise logs error:', error);
      res.status(500).json({ error: 'Failed to get exercise logs' });
    }
  });

  router.get('/summary', async (_req: Request, res: Response) => {
    try {
      const summary = healthService.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get health summary error:', error);
      res.status(500).json({ error: 'Failed to get health summary' });
    }
  });

  router.get('/reminders', async (req: Request, res: Response) => {
    try {
      const { include_inactive } = req.query;
      const reminders = healthService.getReminders(include_inactive === 'true');
      res.json(reminders);
    } catch (error) {
      console.error('Get reminders error:', error);
      res.status(500).json({ error: 'Failed to get reminders' });
    }
  });

  router.post('/reminders', async (req: Request, res: Response) => {
    try {
      const { type, title, message, time, repeat, is_active } = req.body;
      if (!type || !title || !time) {
        res.status(400).json({ error: 'type, title, and time are required' });
        return;
      }
      const reminder = healthService.createReminder({
        type,
        title,
        message: message || null,
        time,
        repeat: repeat || null,
        is_active: is_active !== false,
      });
      res.json(reminder);
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  });

  router.put('/reminders/:id', async (req: Request, res: Response) => {
    try {
      const { type, title, message, time, repeat, is_active } = req.body;
      const reminder = healthService.updateReminder(req.params.id, {
        type,
        title,
        message,
        time,
        repeat,
        is_active,
      });
      if (!reminder) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }
      res.json(reminder);
    } catch (error) {
      console.error('Update reminder error:', error);
      res.status(500).json({ error: 'Failed to update reminder' });
    }
  });

  router.post('/reminders/:id/toggle', async (req: Request, res: Response) => {
    try {
      const reminder = healthService.toggleReminder(req.params.id);
      if (!reminder) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }
      res.json(reminder);
    } catch (error) {
      console.error('Toggle reminder error:', error);
      res.status(500).json({ error: 'Failed to toggle reminder' });
    }
  });

  router.delete('/reminders/:id', async (req: Request, res: Response) => {
    try {
      const success = healthService.deleteReminder(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete reminder error:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  return router;
}
