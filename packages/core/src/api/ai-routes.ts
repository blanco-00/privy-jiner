import { Router, Request, Response } from 'express';
import { AIService } from '../modules/ai/index.js';

export function createAIRouter(aiService: AIService): Router {
  const router = Router();

  router.get('/config', async (_req: Request, res: Response) => {
    try {
      const config = aiService.getConfig();
      if (config) {
        (config as any).api_key = config.api_key ? '********' : null;
      }
      res.json(config);
    } catch (error) {
      console.error('Get AI config error:', error);
      res.status(500).json({ error: 'Failed to get AI config' });
    }
  });

  router.post('/config', async (req: Request, res: Response) => {
    try {
      const { provider, api_key, base_url, model, temperature, max_tokens } = req.body;
      if (!provider) {
        res.status(400).json({ error: 'provider is required' });
        return;
      }
      const config = aiService.saveConfig({ provider, api_key, base_url, model, temperature, max_tokens });
      (config as any).api_key = config.api_key ? '********' : null;
      res.json(config);
    } catch (error) {
      console.error('Save AI config error:', error);
      res.status(500).json({ error: 'Failed to save AI config' });
    }
  });

  router.post('/config/test', async (_req: Request, res: Response) => {
    try {
      const result = await aiService.testConnection();
      res.json(result);
    } catch (error) {
      console.error('Test AI connection error:', error);
      res.status(500).json({ error: 'Failed to test AI connection' });
    }
  });

  router.get('/chat/history', async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const messages = aiService.getChatHistory(limit ? parseInt(limit as string) : 50);
      res.json(messages);
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  });

  router.post('/chat/clear', async (_req: Request, res: Response) => {
    try {
      aiService.clearChatHistory();
      res.json({ success: true });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({ error: 'Failed to clear chat history' });
    }
  });

  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'message is required' });
        return;
      }
      const response = await aiService.sendMessage(message);
      res.json({ response });
    } catch (error) {
      console.error('Send chat message error:', error);
      res.status(500).json({ error: 'Failed to send chat message' });
    }
  });

  router.get('/usage', async (req: Request, res: Response) => {
    try {
      const { days } = req.query;
      const stats = aiService.getAIUsageStats(days ? parseInt(days as string) : 7);
      res.json(stats);
    } catch (error) {
      console.error('Get AI usage error:', error);
      res.status(500).json({ error: 'Failed to get AI usage stats' });
    }
  });

  return router;
}
