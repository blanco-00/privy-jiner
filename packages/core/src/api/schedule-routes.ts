import { Router, Request, Response } from 'express';
import { ScheduleService } from '../modules/schedule/index.js';

export function createScheduleRouter(scheduleService: ScheduleService): Router {
  const router = Router();

  router.get('/schedules', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const schedules = scheduleService.getSchedules(startDate as string, endDate as string);
      res.json(schedules);
    } catch (error) {
      console.error('Get schedules error:', error);
      res.status(500).json({ error: 'Failed to get schedules' });
    }
  });

  router.get('/schedules/month/:year/:month', async (req: Request, res: Response) => {
    try {
      const { year, month } = req.params;
      const schedules = scheduleService.getMonthSchedule(parseInt(year), parseInt(month));
      res.json(schedules);
    } catch (error) {
      console.error('Get month schedule error:', error);
      res.status(500).json({ error: 'Failed to get month schedule' });
    }
  });

  router.get('/schedules/week', async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const schedules = scheduleService.getWeekSchedule(date as string || new Date().toISOString().split('T')[0]);
      res.json(schedules);
    } catch (error) {
      console.error('Get week schedule error:', error);
      res.status(500).json({ error: 'Failed to get week schedule' });
    }
  });

  router.get('/schedules/day/:date', async (req: Request, res: Response) => {
    try {
      const schedules = scheduleService.getDaySchedule(req.params.date);
      res.json(schedules);
    } catch (error) {
      console.error('Get day schedule error:', error);
      res.status(500).json({ error: 'Failed to get day schedule' });
    }
  });

  router.get('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const schedule = scheduleService.getSchedule(req.params.id);
      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      res.json(schedule);
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ error: 'Failed to get schedule' });
    }
  });

  router.post('/schedules', async (req: Request, res: Response) => {
    try {
      const { title, description, location, start_time, end_time, all_day, recurrence, recurrence_end, color } = req.body;
      if (!title || !start_time) {
        res.status(400).json({ error: 'title and start_time are required' });
        return;
      }
      const schedule = scheduleService.createSchedule({ title, description, location, start_time, end_time, all_day, recurrence, recurrence_end, color });
      res.json(schedule);
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  });

  router.put('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const { title, description, location, start_time, end_time, all_day, recurrence, recurrence_end, color, is_completed } = req.body;
      const schedule = scheduleService.updateSchedule(req.params.id, { title, description, location, start_time, end_time, all_day, recurrence, recurrence_end, color, is_completed });
      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      res.json(schedule);
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });

  router.delete('/schedules/:id', async (req: Request, res: Response) => {
    try {
      const success = scheduleService.deleteSchedule(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });

  router.post('/schedules/:id/toggle', async (req: Request, res: Response) => {
    try {
      const schedule = scheduleService.toggleComplete(req.params.id);
      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      res.json(schedule);
    } catch (error) {
      console.error('Toggle schedule error:', error);
      res.status(500).json({ error: 'Failed to toggle schedule' });
    }
  });

  return router;
}
