import { Router, Request, Response } from 'express';
import { TasksService } from '../modules/tasks/index.js';

export function createTasksRouter(tasksService: TasksService): Router {
  const router = Router();

  router.get('/tasks', async (req: Request, res: Response) => {
    try {
      const { status, priority } = req.query;
      const tasks = tasksService.getTasks(status as string, priority as string);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  router.get('/tasks/stats', async (_req: Request, res: Response) => {
    try {
      const stats = tasksService.getTaskStats();
      res.json(stats);
    } catch (error) {
      console.error('Get task stats error:', error);
      res.status(500).json({ error: 'Failed to get task stats' });
    }
  });

  router.get('/tasks/overdue', async (_req: Request, res: Response) => {
    try {
      const tasks = tasksService.getOverdueTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Get overdue tasks error:', error);
      res.status(500).json({ error: 'Failed to get overdue tasks' });
    }
  });

  router.get('/tasks/today', async (_req: Request, res: Response) => {
    try {
      const tasks = tasksService.getTasksDueToday();
      res.json(tasks);
    } catch (error) {
      console.error('Get today tasks error:', error);
      res.status(500).json({ error: 'Failed to get today tasks' });
    }
  });

  router.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const task = tasksService.getTask(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to get task' });
    }
  });

  router.post('/tasks', async (req: Request, res: Response) => {
    try {
      const { title, description, priority, due_date, tags } = req.body;
      if (!title) {
        res.status(400).json({ error: 'title is required' });
        return;
      }
      const task = tasksService.createTask({ title, description, priority, due_date, tags });
      res.json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  router.put('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const { title, description, priority, status, due_date, tags } = req.body;
      const task = tasksService.updateTask(req.params.id, { title, description, priority, status, due_date, tags });
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  router.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const success = tasksService.deleteTask(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  router.post('/tasks/:id/complete', async (req: Request, res: Response) => {
    try {
      const task = tasksService.completeTask(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  router.post('/tasks/:id/reopen', async (req: Request, res: Response) => {
    try {
      const task = tasksService.reopenTask(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      console.error('Reopen task error:', error);
      res.status(500).json({ error: 'Failed to reopen task' });
    }
  });

  return router;
}
