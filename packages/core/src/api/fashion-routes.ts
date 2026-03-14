import { Router, Request, Response } from 'express';
import { FashionService } from '../modules/fashion/index.js';

export function createFashionRouter(fashionService: FashionService): Router {
  const router = Router();

  router.get('/items', async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const items = fashionService.getItems(category as string);
      res.json(items);
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({ error: 'Failed to get items' });
    }
  });

  router.get('/items/summary', async (_req: Request, res: Response) => {
    try {
      const summary = fashionService.getWardrobeSummary();
      res.json(summary);
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: 'Failed to get summary' });
    }
  });

  router.post('/items', async (req: Request, res: Response) => {
    try {
      const { name, category, color, brand, purchase_date, purchase_price, notes } = req.body;
      if (!name || !category) {
        res.status(400).json({ error: 'name and category are required' });
        return;
      }
      const item = fashionService.createItem({
        name,
        category,
        color: color || null,
        brand: brand || null,
        purchase_date: purchase_date || null,
        purchase_price: purchase_price ? parseFloat(purchase_price) : null,
        notes: notes || null,
      });
      res.json(item);
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  router.put('/items/:id', async (req: Request, res: Response) => {
    try {
      const { name, category, color, brand, purchase_date, purchase_price, notes } = req.body;
      const item = fashionService.updateItem(req.params.id, {
        name,
        category,
        color,
        brand,
        purchase_date,
        purchase_price: purchase_price ? parseFloat(purchase_price) : undefined,
        notes,
      });
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
      const success = fashionService.deleteItem(req.params.id);
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

  router.get('/outfits', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const outfits = fashionService.getOutfits(startDate as string, endDate as string);
      res.json(outfits);
    } catch (error) {
      console.error('Get outfits error:', error);
      res.status(500).json({ error: 'Failed to get outfits' });
    }
  });

  router.get('/outfits/stats', async (_req: Request, res: Response) => {
    try {
      const stats = fashionService.getOutfitStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  router.get('/outfits/random', async (_req: Request, res: Response) => {
    try {
      const outfit = fashionService.getRandomOutfit();
      res.json(outfit);
    } catch (error) {
      console.error('Get random outfit error:', error);
      res.status(500).json({ error: 'Failed to get random outfit' });
    }
  });

  router.post('/outfits', async (req: Request, res: Response) => {
    try {
      const { date, occasion, weather, notes, itemIds } = req.body;
      if (!date || !itemIds || !Array.isArray(itemIds)) {
        res.status(400).json({ error: 'date and itemIds are required' });
        return;
      }
      const outfit = fashionService.logOutfit({
        date,
        occasion,
        weather,
        notes,
        itemIds,
      });
      res.json(outfit);
    } catch (error) {
      console.error('Log outfit error:', error);
      res.status(500).json({ error: 'Failed to log outfit' });
    }
  });

  router.delete('/outfits/:id', async (req: Request, res: Response) => {
    try {
      const success = fashionService.deleteOutfit(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Outfit not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete outfit error:', error);
      res.status(500).json({ error: 'Failed to delete outfit' });
    }
  });

  return router;
}
