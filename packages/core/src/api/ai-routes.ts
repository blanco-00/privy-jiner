import { Router, Request, Response } from 'express';
import { AIService } from '../modules/ai/index.js';
import { HealthService } from '../modules/health/index.js';
import { FinanceService } from '../modules/finance/index.js';

export function createAIRouter(aiService: AIService, healthService?: HealthService, financeService?: FinanceService): Router {
  const router = Router();
  
  console.log('[AI Router] Initialized, healthService:', !!healthService, 'financeService:', !!financeService);

  if (healthService) {
    router.post('/nlu', async (req: Request, res: Response) => {
      try {
        const { message } = req.body;
        console.log('[AI /nlu] Received message:', message);
        
        if (!message) {
          res.status(400).json({ error: 'message is required' });
          return;
        }

        const config = aiService.getConfig();
        console.log('[AI /nlu] Config provider:', config?.provider, 'has api_key:', !!config?.api_key);
        
        if (!config || !config.api_key) {
          res.status(400).json({ error: 'AI not configured. Please set up your AI provider first.' });
          return;
        }

        const tools = [
          {
            name: 'health_log_water',
            description: 'Log water intake in milliliters. Use when user says they drank water.',
            keywords: ['water', 'drank', 'drink', 'cups', 'glasses', 'ml'],
          },
          {
            name: 'health_log_exercise',
            description: 'Log exercise activity. Use when user mentions exercise, running, walking, etc.',
            keywords: ['exercise', 'run', 'walk', 'workout', 'gym', 'yoga', 'swim', 'minutes'],
          },
          {
            name: 'finance_record_expense',
            description: 'Record an expense. Use when user mentions spending money or buying something.',
            keywords: ['spent', 'bought', 'paid', 'expense', 'cost', 'money'],
          },
        ];

        const prompt = `You are an intent parser for a personal assistant.

User message: "${message}"

Determine which action to take. Respond in JSON format:
{
  "tool": "tool_name" or null,
  "args": {"param1": "value1"},
  "confidence": 0.0-1.0,
  "reasoning": "explanation"
}

Available tools:
${tools.map(t => `- ${t.name}: ${t.description} (keywords: ${t.keywords.join(', ')})`).join('\n')}

For water: extract amount in ml (1 glass = 250ml, 1 cup = 250ml).
For exercise: extract activity type and duration in minutes.
For expense: extract amount and category if mentioned.`;

        let apiUrl: string;
        let headers: Record<string, string>;

        if (config.provider === 'openai') {
          apiUrl = `${config.base_url || 'https://api.openai.com/v1'}/chat/completions`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key}`,
          };
        } else if (config.provider === 'claude') {
          apiUrl = `${config.base_url || 'https://api.anthropic.com/v1'}/messages`;
          headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.api_key,
            'anthropic-version': '2023-06-01',
          };
        } else if (config.provider === 'zhipu') {
          apiUrl = `${config.base_url || 'https://open.bigmodel.cn/api/paas/v4'}/chat/completions`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key}`,
          };
        } else if (config.provider === 'minimax') {
          apiUrl = `${config.base_url || 'https://api.minimax.chat/v1'}/text/chatcompletion_v2`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key}`,
          };
        } else {
          res.status(400).json({ error: 'Unsupported provider: ' + config.provider });
          return;
        }

        const model = config.model || (config.provider === 'openai' ? 'gpt-3.5-turbo' : config.provider === 'claude' ? 'claude-3-haiku-20240307' : config.provider === 'zhipu' ? 'glm-4' : config.provider === 'minimax' ? 'MiniMax-M2.1' : 'gpt-3.5-turbo');

        let requestBody: Record<string, unknown>;
        
        if (config.provider === 'zhipu') {
          requestBody = {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          };
        } else if (config.provider === 'minimax') {
          requestBody = {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          };
        } else {
          requestBody = {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          };
        }

        if (config.provider === 'claude') {
          (requestBody as any).system = 'You are a helpful assistant that outputs valid JSON only.';
        }

        console.log('[AI /nlu] Calling AI API:', config.provider, 'url:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('[AI /nlu] AI API error:', response.status, error);
          res.status(500).json({ error: `AI API error: ${error}` });
          return;
        }

        const data = await response.json() as any;
        console.log('[AI /nlu] AI response received, parsing...');
        let content = '';

        if (config.provider === 'openai') {
          content = data.choices?.[0]?.message?.content || '';
        } else if (config.provider === 'claude') {
          content = data.content?.[0]?.text || '';
        } else if (config.provider === 'zhipu') {
          content = data.choices?.[0]?.message?.content || '';
        } else if (config.provider === 'minimax') {
          content = data.choices?.[0]?.message?.content || '';
        }

        let parsed;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch {
          parsed = null;
        }

        if (!parsed || !parsed.tool || parsed.confidence < 0.7) {
          res.json({
            success: false,
            message: 'Could not understand the request. Try being more specific.',
            originalMessage: message,
          });
          return;
        }

        let result;
        const toolName = parsed.tool;
        const args = parsed.args || {};

        if (toolName === 'health_log_water' && healthService) {
          const amount = parseInt(args.amount) || 250;
          const date = args.date || new Date().toISOString().split('T')[0];
          console.log('[AI /nlu] Logging water:', { amount, date });
          result = healthService.logWater(amount, date);
          res.json({
            success: true,
            message: `Logged ${amount}ml of water!`,
            tool: toolName,
            result,
          });
        } else if (toolName === 'health_log_exercise' && healthService) {
          const activity = args.activity || 'exercise';
          const duration = parseInt(args.duration) || 30;
          const date = args.date || new Date().toISOString().split('T')[0];
          console.log('[AI /nlu] Logging exercise:', { activity, duration, date });
          result = healthService.logExercise({
            type: activity,
            duration,
            date,
          });
          res.json({
            success: true,
            message: `Logged ${duration} minutes of ${activity}!`,
            tool: toolName,
            result,
          });
        } else if ((toolName === 'finance_record_expense' || toolName === 'finance_record') && financeService) {
          const amount = parseFloat(args.amount) || 0;
          result = financeService.createTransaction({
            amount,
            type: 'expense',
            category_id: null,
            description: args.category || args.description || null,
            date: args.date || new Date().toISOString().split('T')[0],
          });
          res.json({
            success: true,
            message: `Logged expense of ${amount}!`,
            tool: toolName,
            result,
          });
        } else {
          res.json({
            success: false,
            message: 'Tool not available',
            tool: toolName,
          });
        }
      } catch (error) {
        console.error('NLU processing error:', error);
        res.status(500).json({ error: 'Failed to process natural language request: ' + (error instanceof Error ? error.message : String(error)) });
      }
    });
  }

  router.get('/config', async (_req: Request, res: Response) => {
    try {
      const config = aiService.getConfigMasked();
      res.json(config);
    } catch (error) {
      console.error('Get AI config error:', error);
      res.status(500).json({ error: 'Failed to get AI config' });
    }
  });

  router.post('/config', async (req: Request, res: Response) => {
    try {
      // Accept both camelCase (apiKey, baseUrl) and snake_case (api_key, base_url)
      const { provider, api_key, base_url, model, temperature, max_tokens, isNew } = req.body;
      const apiKey = req.body.apiKey || api_key;
      const baseUrl = req.body.baseUrl || base_url;
      
      if (!provider) {
        res.status(400).json({ error: 'provider is required' });
        return;
      }
      
      const config = aiService.saveConfig({ 
        provider, 
        api_key: apiKey, 
        base_url: baseUrl, 
        model, 
        temperature, 
        max_tokens 
      }, isNew);
      
      res.json({ code: 0, data: { id: config.id } });
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

  // Alias for /test (used by frontend)
  router.post('/test', async (req: Request, res: Response) => {
    try {
      const { apiKey, provider } = req.body;
      const result = await aiService.testConnection(apiKey, provider);
      res.json(result);
    } catch (error) {
      console.error('Test AI connection error:', error);
      res.status(500).json({ error: 'Failed to test AI connection' });
    }
  });

  router.post('/models', async (req: Request, res: Response) => {
    try {
      const { apiKey, provider, baseUrl } = req.body;
      
      if (!apiKey) {
        res.status(400).json({ code: 400, error: 'API key is required' });
        return;
      }

      // Fallback model lists (used when network is unavailable)
      const fallbackModels: Record<string, Array<{ id: string; name: string }>> = {
        openai: [
          { id: 'gpt-4o', name: 'GPT-4o' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
          { id: 'gpt-4', name: 'GPT-4' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ],
        claude: [
          { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
          { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
        ],
        zhipu: [
          { id: 'glm-4', name: 'GLM-4' },
          { id: 'glm-4-flash', name: 'GLM-4 Flash' },
          { id: 'glm-4-plus', name: 'GLM-4 Plus' },
          { id: 'glm-3-turbo', name: 'GLM-3 Turbo' }
        ],
        minimax: [
          { id: 'MiniMax-M2.5', name: 'MiniMax M2.5' },
          { id: 'MiniMax-M2.1', name: 'MiniMax M2.1' },
          { id: 'MiniMax-Text-01', name: 'MiniMax Text 01' },
          { id: 'abab6.5s-chat', name: 'ABAB 6.5S Chat' },
          { id: 'abab6.5g-chat', name: 'ABAB 6.5G Chat' }
        ]
      };

      let models: Array<{ id: string; name: string }> = [];

      try {
        if (provider === 'openai') {
          const url = (baseUrl || 'https://api.openai.com/v1') + '/models';
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });
          if (!response.ok) {
            // Use fallback models on API error
            models = fallbackModels.openai;
          } else {
            const data = await response.json() as { data: Array<{ id: string }> };
            models = data.data.filter((m: any) => m.id.startsWith('gpt-')).map(m => ({ id: m.id, name: m.id }));
          }
        } else if (provider === 'claude') {
          const url = (baseUrl || 'https://api.anthropic.com/v1') + '/models';
          const response = await fetch(url, {
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          });
          if (!response.ok) {
            models = fallbackModels.claude;
          } else {
            const data = await response.json() as { data: Array<{ id: string; name: string }> };
            models = data.data.map(m => ({ id: m.id, name: m.name }));
          }
        } else if (provider === 'zhipu') {
          const url = (baseUrl || 'https://open.bigmodel.cn/api/paas/v4') + '/models';
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });
          if (!response.ok) {
            models = fallbackModels.zhipu;
          } else {
            const data = await response.json() as { data: Array<{ id: string }> };
            models = data.data.map(m => ({ id: m.id, name: m.id }));
          }
      } else if (provider === 'minimax') {
        // MiniMax doesn't have a public models list API, use fallback
        models = fallbackModels.minimax;
        } else {
          res.json({ code: 400, error: 'Provider does not support model listing' });
          return;
        }
      } catch (networkError) {
        // Network error - use fallback models
        console.warn('Network error fetching models, using fallback list:', networkError);
        models = fallbackModels[provider] || [];
      }

      res.json({ code: 0, models });
    } catch (error) {
      console.error('Fetch models error:', error);
      res.status(500).json({ code: 500, error: 'Failed to fetch models' });
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
      const { message, modelId } = req.body;
      console.log('[AI /chat] Received message:', message?.substring(0, 50), 'modelId:', modelId);
      
      if (!message) {
        res.status(400).json({ error: 'message is required' });
        return;
      }
      const result = await aiService.sendMessage(message, modelId);
      console.log('[AI /chat] Response sent successfully');
      const config = aiService.getConfig();
      res.json({ 
        response: result,
        modelName: config?.model || config?.provider 
      });
    } catch (error) {
      console.error('[AI /chat] Send chat message error:', error);
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

  router.get('/configs', async (_req: Request, res: Response) => {
    try {
      const configs = aiService.getAllConfigs();
      res.json({ code: 0, data: configs });
    } catch (error) {
      console.error('Get AI configs error:', error);
      res.status(500).json({ error: 'Failed to get AI configs' });
    }
  });

  router.delete('/configs/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = aiService.deleteConfig(id);
      if (success) {
        res.json({ code: 0, message: 'Config deleted successfully' });
      } else {
        res.status(404).json({ error: 'Config not found' });
      }
    } catch (error) {
      console.error('Delete AI config error:', error);
      res.status(500).json({ error: 'Failed to delete AI config' });
    }
  });

  router.get('/models', async (_req: Request, res: Response) => {
    try {
      console.log('[AI /models] Fetching enabled models');
      const models = aiService.getEnabledModels();
      console.log('[AI /models] Found models:', models.length);
      res.json({
        models: models.map((m: any) => ({
          id: m.id,
          provider: m.provider,
          name: m.model || m.provider,
          model: m.model,
          enabled: m.is_active,
        })),
      });
    } catch (error) {
      console.error('Get enabled models error:', error);
      res.status(500).json({ error: 'Failed to get models' });
    }
  });

  return router;
}
