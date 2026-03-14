import { Router, Request, Response } from 'express';
import { NewsService } from '../modules/news/index.js';

export function createNewsRouter(newsService: NewsService): Router {
  const router = Router();

  router.get('/articles', async (req: Request, res: Response) => {
    try {
      const { category, is_read, limit, offset } = req.query;
      const articles = newsService.getArticles({
        category: category as string,
        is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(articles);
    } catch (error) {
      console.error('Get articles error:', error);
      res.status(500).json({ error: 'Failed to get articles' });
    }
  });

  router.get('/articles/unread-count', async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const count = newsService.getUnreadCount(category as string);
      res.json({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  });

  router.get('/articles/search', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(400).json({ error: 'Query parameter q is required' });
        return;
      }
      const articles = newsService.searchArticles(q as string);
      res.json(articles);
    } catch (error) {
      console.error('Search articles error:', error);
      res.status(500).json({ error: 'Failed to search articles' });
    }
  });

  router.post('/articles', async (req: Request, res: Response) => {
    try {
      const { title, content, category, source, url, published_date } = req.body;
      if (!title || !category) {
        res.status(400).json({ error: 'title and category are required' });
        return;
      }
      const article = newsService.createArticle({
        title,
        content: content || null,
        category,
        source: source || null,
        url: url || null,
        published_date: published_date || null,
        is_read: false,
      });
      res.json(article);
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  });

  router.put('/articles/:id', async (req: Request, res: Response) => {
    try {
      const { title, content, category, source, url, published_date, is_read } = req.body;
      const article = newsService.updateArticle(req.params.id, {
        title,
        content,
        category,
        source,
        url,
        published_date,
        is_read,
      });
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      res.json(article);
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  });

  router.post('/articles/:id/read', async (req: Request, res: Response) => {
    try {
      const article = newsService.markAsRead(req.params.id);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      res.json(article);
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  });

  router.delete('/articles/:id', async (req: Request, res: Response) => {
    try {
      const success = newsService.deleteArticle(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  return router;
}
