import { OpenClawPlugin, GatewayMessage } from '../index.js';

describe('OpenClawPlugin NL Bridge', () => {
  let plugin: OpenClawPlugin;

  beforeEach(() => {
    plugin = new OpenClawPlugin();
  });

  describe('isNaturalLanguage', () => {
    it('should return true for message with naturalLanguage field', () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: 'I drank 3 glasses of water',
      };

      const result = (plugin as any).isNaturalLanguage(message);
      expect(result).toBe(true);
    });

    it('should return false for message without naturalLanguage field', () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'health_log_water',
        payload: { amount: 3 },
      };

      const result = (plugin as any).isNaturalLanguage(message);
      expect(result).toBe(false);
    });

    it('should return false for empty naturalLanguage field', () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: '',
      };

      const result = (plugin as any).isNaturalLanguage(message);
      expect(result).toBe(false);
    });
  });

  describe('setNLEnabled', () => {
    it('should enable NL processing by default', () => {
      expect(plugin.isNLEnabled()).toBe(true);
    });

    it('should disable NL processing when set to false', () => {
      plugin.setNLEnabled(false);
      expect(plugin.isNLEnabled()).toBe(false);
    });

    it('should re-enable NL processing', () => {
      plugin.setNLEnabled(false);
      plugin.setNLEnabled(true);
      expect(plugin.isNLEnabled()).toBe(true);
    });
  });

  describe('handleGatewayMessage', () => {
    it('should process structured tool call (backward compatibility)', async () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'health_log_water',
        payload: { amount: 3 },
      };

      const result = await plugin.handleGatewayMessage(message);
      expect(result).toHaveProperty('success');
    });

    it('should handle NL message when enabled', async () => {
      plugin.setNLUParser(async (input: string) => {
        if (input.includes('water')) {
          return { tool: 'health_log_water', args: { amount: 3 } };
        }
        throw new Error('Unknown intent');
      });

      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: 'I drank 3 glasses of water',
      };

      const result = await plugin.handleGatewayMessage(message);
      expect(result).toHaveProperty('success');
    });

    it('should return error when NL disabled', async () => {
      plugin.setNLEnabled(false);

      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: 'I drank water',
      };

      const result = await plugin.handleGatewayMessage(message);
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
    });

    it('should return error when NLU parser not configured', async () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'chat',
        naturalLanguage: 'I drank water',
      };

      const result = await plugin.handleGatewayMessage(message);
      expect(result).toHaveProperty('success', false);
      expect((result as any).error).toContain('not configured');
    });

    it('should throw error for unknown action', async () => {
      const message: GatewayMessage = {
        id: '1',
        type: 'request',
        action: 'unknown_tool',
        payload: {},
      };

      await expect(plugin.handleGatewayMessage(message)).rejects.toThrow('Unknown action');
    });
  });
});
