import { Router, Request, Response } from 'express';
import { KnowledgeService } from '../modules/knowledge/index.js';

export function createKnowledgeRouter(knowledgeService: KnowledgeService): Router {
  const router = Router();

  router.get('/items', async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const items = knowledgeService.getItems(category as string);
      res.json(items);
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({ error: 'Failed to get items' });
    }
  });

  router.get('/items/random', async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const item = knowledgeService.getRandomItem(category as string);
      res.json(item);
    } catch (error) {
      console.error('Get random item error:', error);
      res.status(500).json({ error: 'Failed to get random item' });
    }
  });

  router.get('/items/search', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(400).json({ error: 'Query parameter q is required' });
        return;
      }
      const items = knowledgeService.searchItems(q as string);
      res.json(items);
    } catch (error) {
      console.error('Search items error:', error);
      res.status(500).json({ error: 'Failed to search items' });
    }
  });

  router.post('/items', async (req: Request, res: Response) => {
    try {
      const { title, content, category, source } = req.body;
      if (!title || !content || !category) {
        res.status(400).json({ error: 'title, content, and category are required' });
        return;
      }
      const item = knowledgeService.createItem({ title, content, category, source: source || null });
      res.json(item);
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  router.put('/items/:id', async (req: Request, res: Response) => {
    try {
      const { title, content, category, source } = req.body;
      const item = knowledgeService.updateItem(req.params.id, { title, content, category, source });
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  router.delete('/items/:id', async (req: Request, res: Response) => {
    try {
      const success = knowledgeService.deleteItem(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  });

  return router;
}
