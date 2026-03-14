import { Router, Request, Response } from 'express';
import { ProfileService } from '../modules/profile/index.js';

export function createProfileRouter(profileService: ProfileService): Router {
  const router = Router();

  router.get('/profile', async (_req: Request, res: Response) => {
    try {
      const profile = profileService.getProfile();
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  router.post('/profile', async (req: Request, res: Response) => {
    try {
      const { name, birthday, height, weight, blood_type, avatar, notes } = req.body;
      if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const profile = profileService.createProfile({ name, birthday, height, weight, blood_type, avatar, notes });
      res.json(profile);
    } catch (error) {
      console.error('Create profile error:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  });

  router.put('/profile', async (req: Request, res: Response) => {
    try {
      const { name, birthday, height, weight, blood_type, avatar, notes } = req.body;
      const profile = profileService.updateProfile({ name, birthday, height, weight, blood_type, avatar, notes });
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  router.get('/health-metrics', async (req: Request, res: Response) => {
    try {
      const { type, limit } = req.query;
      const metrics = profileService.getHealthMetrics(type as string, limit ? parseInt(limit as string) : undefined);
      res.json(metrics);
    } catch (error) {
      console.error('Get health metrics error:', error);
      res.status(500).json({ error: 'Failed to get health metrics' });
    }
  });

  router.post('/health-metrics', async (req: Request, res: Response) => {
    try {
      const { type, value, recorded_at, notes } = req.body;
      if (!type || !value) {
        res.status(400).json({ error: 'type and value are required' });
        return;
      }
      const metric = profileService.addHealthMetric({ type, value, recorded_at, notes });
      res.json(metric);
    } catch (error) {
      console.error('Add health metric error:', error);
      res.status(500).json({ error: 'Failed to add health metric' });
    }
  });

  router.delete('/health-metrics/:id', async (req: Request, res: Response) => {
    try {
      const success = profileService.deleteHealthMetric(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error('Delete health metric error:', error);
      res.status(500).json({ error: 'Failed to delete health metric' });
    }
  });

  return router;
}
