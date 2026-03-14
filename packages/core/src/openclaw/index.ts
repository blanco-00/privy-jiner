import { EventEmitter } from 'events';
import { ConfigManager, DeploymentMode, Config } from '../config/index.js';
import { Logger } from '../logger/index.js';
import { PluginInstance } from '../plugin/index.js';

export interface GatewayMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  action: string;
  payload?: unknown;
  correlationId?: string;
}

export interface GatewayTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (...args: unknown[]) => Promise<unknown>;
}

export interface GatewayRegistration {
  pluginId: string;
  name: string;
  version: string;
  capabilities: string[];
  tools: GatewayTool[];
}

export class OpenClawPlugin implements PluginInstance {
  private configManager: ConfigManager;
  private logger: Logger;
  private gatewayConnection?: GatewayConnection;
  private mode: DeploymentMode = 'plugin';
  private gatewayDatabase?: unknown;
  private pluginSecret?: string;

  constructor() {
    this.configManager = new ConfigManager();
    this.logger = new Logger(this.configManager.get().logging);
    this.pluginSecret = process.env.OPENCLOW_PLUGIN_SECRET;
  }

  async onLoad(): Promise<void> {
    this.logger.info('Privy-Jiner OpenClaw plugin loading...');
    this.logger.info('Plugin mode: using Gateway database, no local DB init');
    
    if (!this.pluginSecret) {
      this.logger.warn('OPENCLOW_PLUGIN_SECRET not set - auth disabled');
    }
  }

  async onUnload(): Promise<void> {
    this.logger.info('Privy-Jiner OpenClaw plugin unloading...');
    if (this.gatewayConnection) {
      await this.gatewayConnection.disconnect();
    }
    this.logger.info('Privy-Jiner OpenClaw plugin unloaded');
  }

  verifyPluginSecret(secret: string): boolean {
    if (!this.pluginSecret) return true;
    return secret === this.pluginSecret;
  }

  getUserFromToken(token: string): { userId: string; capabilities: string[] } | null {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return {
        userId: payload.sub,
        capabilities: payload.capabilities || [],
      };
    } catch {
      return null;
    }
  }

  setGatewayDatabase(db: unknown): void {
    this.gatewayDatabase = db;
  }

  getGatewayDatabase(): unknown {
    return this.gatewayDatabase;
  }

  async registerWithGateway(gateway: GatewayConnection): Promise<GatewayRegistration> {
    this.gatewayConnection = gateway;
    
    const registration: GatewayRegistration = {
      pluginId: 'privy-jiner',
      name: 'Privy-Jiner Personal Assistant',
      version: '1.0.0',
      capabilities: this.getCapabilities(),
      tools: this.getTools(),
    };
    
    await gateway.register(registration);
    this.logger.info('Registered with OpenClaw Gateway');
    return registration;
  }

  private getCapabilities(): string[] {
    return [
      'finance_record',
      'finance_query', 
      'finance_report',
      'health_log_water',
      'health_log_exercise',
      'health_query',
      'fashion_add_item',
      'fashion_log_outfit',
      'fashion_recommend',
    ];
  }

  getTools(): GatewayTool[] {
    return [
      {
        name: 'finance_record',
        description: 'Record income or expense',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['income', 'expense'] },
            amount: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string' },
          },
          required: ['type', 'amount', 'category'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'finance_record', args };
        },
      },
      {
        name: 'finance_query',
        description: 'Query finance records',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            limit: { type: 'number' },
          },
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'finance_query', args };
        },
      },
      {
        name: 'finance_report',
        description: 'Get finance summary report',
        parameters: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' },
          },
          required: ['startDate', 'endDate'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'finance_report', args };
        },
      },
      {
        name: 'health_log_water',
        description: 'Log water intake',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            date: { type: 'string' },
          },
          required: ['amount'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'health_log_water', args };
        },
      },
      {
        name: 'health_log_exercise',
        description: 'Log exercise activity',
        parameters: {
          type: 'object',
          properties: {
            activity: { type: 'string' },
            duration: { type: 'number' },
            date: { type: 'string' },
          },
          required: ['activity', 'duration'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'health_log_exercise', args };
        },
      },
      {
        name: 'health_query',
        description: 'Query health data',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['water', 'exercise'] },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
          },
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'health_query', args };
        },
      },
      {
        name: 'fashion_add_item',
        description: 'Add wardrobe item',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            color: { type: 'string' },
            season: { type: 'array', items: { type: 'string' } },
            favorite: { type: 'boolean' },
          },
          required: ['name', 'category'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'fashion_add_item', args };
        },
      },
      {
        name: 'fashion_log_outfit',
        description: 'Log an outfit',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            date: { type: 'string' },
          },
          required: ['name', 'items'],
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'fashion_log_outfit', args };
        },
      },
      {
        name: 'fashion_recommend',
        description: 'Get outfit recommendations',
        parameters: {
          type: 'object',
          properties: {
            occasion: { type: 'string' },
            season: { type: 'string' },
          },
        },
        handler: async (...args: unknown[]) => {
          return { success: true, action: 'fashion_recommend', args };
        },
      },
    ];
  }

  async handleGatewayMessage(message: GatewayMessage): Promise<unknown> {
    const { action, payload } = message;
    this.logger.debug(`Handling Gateway message: ${action}`);
    const tools = this.getTools();
    const tool = tools.find(t => t.name === action);
    if (!tool) {
      throw new Error(`Unknown action: ${action}`);
    }
    return tool.handler(payload || {});
  }

  loadConfigFromGateway(gatewayConfig: Partial<Config>): void {
    this.logger.info('Loading configuration from OpenClaw Gateway');
    if (gatewayConfig.deployment) {
      this.configManager.setDeploymentMode(gatewayConfig.deployment.mode);
    }
    if (gatewayConfig.database) {
      this.configManager.setDatabase(gatewayConfig.database);
    }
    if (gatewayConfig.ai) {
      this.configManager.setAIConfig(gatewayConfig.ai);
    }
    this.logger.info('Configuration loaded from Gateway');
  }

  getMode(): DeploymentMode {
    return this.mode;
  }

  setMode(mode: DeploymentMode): void {
    this.mode = mode;
  }
}

export class GatewayConnection extends EventEmitter {
  private registered = false;
  private registration?: GatewayRegistration;

  async connect(_connectionString: string): Promise<void> {
    this.emit('connected', { connectionString: _connectionString });
  }

  async disconnect(): Promise<void> {
    this.registered = false;
    this.registration = undefined;
    this.emit('disconnected');
  }

  async register(registration: GatewayRegistration): Promise<void> {
    this.registration = registration;
    this.registered = true;
    this.emit('registered', registration);
  }

  isRegistered(): boolean {
    return this.registered;
  }

  getRegistration(): GatewayRegistration | undefined {
    return this.registration;
  }

  async send(message: GatewayMessage): Promise<void> {
    if (!this.registered) {
      throw new Error('Not registered with Gateway');
    }
    this.emit('message', message);
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.registered) {
      throw new Error('Not registered with Gateway');
    }
    this.emit('tool_call', { tool: toolName, args });
    return { success: true };
  }
}

export class DualModeHandler extends EventEmitter {
  private plugin: OpenClawPlugin;
  private gatewayConnection?: GatewayConnection;
  private mode: DeploymentMode;

  constructor(plugin: OpenClawPlugin) {
    super();
    this.plugin = plugin;
    this.mode = 'standalone';
  }

  async initialize(mode: DeploymentMode, gatewayConfig?: { url: string }): Promise<void> {
    this.mode = mode;
    if (mode === 'plugin' && gatewayConfig) {
      this.gatewayConnection = new GatewayConnection();
      await this.gatewayConnection.connect(gatewayConfig.url);
      await this.plugin.registerWithGateway(this.gatewayConnection);
    }
  }

  async handleMessage(message: GatewayMessage | Record<string, unknown>): Promise<unknown> {
    if (this.mode === 'plugin' && this.gatewayConnection) {
      return this.plugin.handleGatewayMessage(message as GatewayMessage);
    } else {
      const action = (message as GatewayMessage).action || (message as Record<string, unknown>).action;
      const payload = (message as GatewayMessage).payload || message;
      return this.handleLocalMessage(action as string, payload as Record<string, unknown>);
    }
  }

  private async handleLocalMessage(action: string, payload: Record<string, unknown>): Promise<unknown> {
    const tools = this.plugin.getTools();
    const tool = tools.find(t => t.name === action);
    if (!tool) {
      throw new Error(`Unknown action: ${action}`);
    }
    return tool.handler(payload);
  }

  getMode(): DeploymentMode {
    return this.mode;
  }
}

export const tools = {
  finance_record: async (...args: unknown[]) => ({ success: true, action: 'finance_record', args }),
  finance_query: async (...args: unknown[]) => ({ success: true, action: 'finance_query', args }),
  finance_report: async (...args: unknown[]) => ({ success: true, action: 'finance_report', args }),
  health_log_water: async (...args: unknown[]) => ({ success: true, action: 'health_log_water', args }),
  health_log_exercise: async (...args: unknown[]) => ({ success: true, action: 'health_log_exercise', args }),
  health_query: async (...args: unknown[]) => ({ success: true, action: 'health_query', args }),
  fashion_add_item: async (...args: unknown[]) => ({ success: true, action: 'fashion_add_item', args }),
  fashion_log_outfit: async (...args: unknown[]) => ({ success: true, action: 'fashion_log_outfit', args }),
  fashion_recommend: async (...args: unknown[]) => ({ success: true, action: 'fashion_recommend', args }),
};

export default OpenClawPlugin;
