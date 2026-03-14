import { Router, Request, Response } from 'express';
import { MonitoringService } from '../modules/monitoring/index.js';

export function createMonitoringRouter(monitoringService: MonitoringService): Router {
  const router = Router();

  router.get('/database', async (_req: Request, res: Response) => {
    try {
      const stats = monitoringService.getDatabaseStats();
      res.json(stats);
    } catch (error) {
      console.error('Get database stats error:', error);
      res.status(500).json({ error: 'Failed to get database stats' });
    }
  });

  router.get('/system', async (_req: Request, res: Response) => {
    try {
      const stats = monitoringService.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({ error: 'Failed to get system stats' });
    }
  });

  router.get('/api', async (req: Request, res: Response) => {
    try {
      const { days } = req.query;
      const stats = monitoringService.getAPIStats(days ? parseInt(days as string) : 7);
      res.json(stats);
    } catch (error) {
      console.error('Get API stats error:', error);
      res.status(500).json({ error: 'Failed to get API stats' });
    }
  });

  router.get('/all', async (_req: Request, res: Response) => {
    try {
      const stats = monitoringService.getAllStats();
      res.json(stats);
    } catch (error) {
      console.error('Get all stats error:', error);
      res.status(500).json({ error: 'Failed to get all stats' });
    }
  });

  return router;
}
