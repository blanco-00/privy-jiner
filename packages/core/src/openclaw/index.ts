import { EventEmitter } from 'events';
import Database from 'better-sqlite3';
import { ConfigManager, DeploymentMode, Config } from '../config/index.js';
import { Logger } from '../logger/index.js';
import { PluginInstance } from '../plugin/index.js';
import { HealthService } from '../modules/health/index.js';
import { FinanceService } from '../modules/finance/index.js';
import { FashionService } from '../modules/fashion/index.js';

export interface GatewayMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  action: string;
  payload?: unknown;
  correlationId?: string;
  naturalLanguage?: string;
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
  private nlEnabled = true;
  private nluParser?: (input: string) => Promise<{ tool: string; args: Record<string, unknown>; error?: string }>;

  // Managers for business logic
  private db?: Database.Database;
  private healthService?: HealthService;
  private financeService?: FinanceService;
  private fashionService?: FashionService;

  constructor() {
    this.configManager = new ConfigManager();
    this.logger = new Logger(this.configManager.get().logging);
    this.pluginSecret = process.env.OPENCLOW_PLUGIN_SECRET;
  }

  /**
   * Set managers for business logic execution
   * Call this after initializing the plugin with database
   */
  setManagers(managers: {
    db: Database.Database;
    healthService: HealthService;
    financeService: FinanceService;
    fashionService: FashionService;
  }): void {
    this.db = managers.db;
    this.healthService = managers.healthService;
    this.financeService = managers.financeService;
    this.fashionService = managers.fashionService;
    this.logger.info('Managers set for OpenClawPlugin');
  }

  /**
   * Initialize managers from a database path (standalone mode)
   */
  async initializeWithDatabase(dbPath: string): Promise<void> {
    this.db = new Database(dbPath);
    this.healthService = new HealthService(this.db);
    this.financeService = new FinanceService(this.db);
    this.fashionService = new FashionService(this.db);
    this.logger.info(`Initialized managers with database: ${dbPath}`);
  }

  setNLUParser(parser: (input: string) => Promise<{ tool: string; args: Record<string, unknown>; error?: string }>): void {
    this.nluParser = parser;
  }

  setNLEnabled(enabled: boolean): void {
    this.nlEnabled = enabled;
  }

  isNLEnabled(): boolean {
    return this.nlEnabled;
  }

  async onLoad(): Promise<void> {
    this.logger.info('Privy-Jiner OpenClaw plugin loading...');
    
    // Try to initialize with default database path
    const dbPath = process.cwd() + '/data/privy-jiner.db';
    try {
      this.db = new Database(dbPath);
      this.healthService = new HealthService(this.db);
      this.financeService = new FinanceService(this.db);
      this.fashionService = new FashionService(this.db);
      this.logger.info(`Initialized managers with database: ${dbPath}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Could not initialize database at ${dbPath}: ${errMsg}`);
      this.logger.warn('Plugin will work but tools require manual initialization via setManagers()');
    }

    if (!this.pluginSecret) {
      this.logger.warn('OPENCLOW_PLUGIN_SECRET not set - auth disabled');
    }

    await this.discoverCapabilities();
  }

  private async discoverCapabilities(): Promise<void> {
    this.logger.info('[Jiner Plugin] === Capability Discovery Start ===');
    try {
      const tools = this.getTools();
      this.logger.info(`[Jiner Plugin] Found ${tools.length} tools in plugin`);

      const capabilities = this.getCapabilitiesWithDetails();
      const discovered = capabilities.map(c => c.name).join(', ');
      this.logger.info(`[Jiner Plugin] Discovered capabilities: ${discovered}`);
      this.logger.info('[Jiner Plugin] === Capability Discovery Complete ===');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Jiner Plugin] ERROR: Failed to discover capabilities: ${errMsg}`);
      this.logger.info('[Jiner Plugin] === Capability Discovery Complete (with errors) ===');
    }
  }

  getCapabilitiesWithDetails(): Array<{ name: string; description: string; keywords: string[]; endpoint: string }> {
    return [
      {
        name: 'health_log_water',
        description: 'Log water intake in milliliters',
        keywords: ['water', 'drank', 'drink', 'ml', '喝水'],
        endpoint: 'http://localhost:3001/api/ai/nlu',
      },
      {
        name: 'health_log_exercise',
        description: 'Log exercise activity',
        keywords: ['exercise', 'run', 'walk', '运动', '跑步', '分钟'],
        endpoint: 'http://localhost:3001/api/ai/nlu',
      },
      {
        name: 'finance_record_expense',
        description: 'Record an expense',
        keywords: ['spent', 'bought', 'expense', '花了', '支出', '钱'],
        endpoint: 'http://localhost:3001/api/ai/nlu',
      },
    ];
  }

  async onUnload(): Promise<void> {
    this.logger.info('Privy-Jiner OpenClaw plugin unloading...');
    if (this.gatewayConnection) {
      await this.gatewayConnection.disconnect();
    }
    if (this.db) {
      this.db.close();
      this.logger.info('Database connection closed');
    }
    this.logger.info('Privy-Jiner plugin unloaded');
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
    const self = this;

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
        handler: async (args: unknown) => {
          const payload = args as { type: 'income' | 'expense'; amount: number; category?: string; description?: string; date?: string };
          if (!self.financeService) {
            throw new Error('FinanceService not initialized');
          }
          const record = self.financeService.createTransaction({
            category_id: null,
            amount: payload.amount,
            type: payload.type,
            description: payload.description || null,
            date: payload.date || new Date().toISOString().split('T')[0],
          });
          return { success: true, action: 'finance_record', data: record };
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
        handler: async (_args: unknown) => {
          if (!self.financeService) {
            throw new Error('FinanceService not initialized');
          }
          const transactions = self.financeService.getTransactions({});
          return { success: true, action: 'finance_query', data: transactions };
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
        handler: async (_args: unknown) => {
          if (!self.financeService) {
            throw new Error('FinanceService not initialized');
          }
          const summary = self.financeService.getSummary();
          return { success: true, action: 'finance_report', data: summary };
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
        handler: async (args: unknown) => {
          const payload = args as { amount: number; date?: string };
          if (!self.healthService) {
            throw new Error('HealthService not initialized');
          }
          const today = payload.date || new Date().toISOString().split('T')[0];
          const waterLog = self.healthService.logWater(payload.amount, today);
          return { success: true, action: 'health_log_water', data: waterLog };
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
        handler: async (args: unknown) => {
          const payload = args as { activity: string; duration: number; date?: string };
          if (!self.healthService) {
            throw new Error('HealthService not initialized');
          }
          const today = payload.date || new Date().toISOString().split('T')[0];
          const exerciseLog = self.healthService.logExercise({
            type: payload.activity,
            duration: payload.duration,
            date: today,
          });
          return { success: true, action: 'health_log_exercise', data: exerciseLog };
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
        handler: async (args: unknown) => {
          const payload = args as { type: 'water' | 'exercise'; startDate?: string; endDate?: string };
          if (!self.healthService) {
            throw new Error('HealthService not initialized');
          }

          let data;
          if (payload.type === 'water') {
            const today = new Date().toISOString().split('T')[0];
            const logs = self.healthService.getWaterLogs(today);
            const total = self.healthService.getTodayWaterTotal();
            data = { todayTotal: total, logs };
          } else {
            const today = new Date().toISOString().split('T')[0];
            const logs = self.healthService.getExerciseLogs(today);
            const summary = self.healthService.getTodayExerciseSummary();
            data = { summary, logs };
          }

          return { success: true, action: 'health_query', data };
        },
      },
      {
        name: 'fashion_add_item',
        description: 'Add wardrobe item',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string', enum: ['top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear', 'other'] },
            color: { type: 'string' },
            brand: { type: 'string' },
            favorite: { type: 'boolean' },
          },
          required: ['name', 'category'],
        },
        handler: async (args: unknown) => {
          const payload = args as { name: string; category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear' | 'other'; color?: string; brand?: string };
          if (!self.fashionService) {
            throw new Error('FashionService not initialized');
          }
          const item = self.fashionService.createItem({
            name: payload.name,
            category: payload.category,
            color: payload.color || null,
            brand: payload.brand || null,
            purchase_date: null,
            purchase_price: null,
            notes: null,
          });
          return { success: true, action: 'fashion_add_item', data: item };
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
            occasion: { type: 'string' },
            weather: { type: 'string' },
          },
          required: ['name', 'items'],
        },
        handler: async (args: unknown) => {
          const payload = args as { name: string; items: string[]; occasion?: string; weather?: string };
          if (!self.fashionService) {
            throw new Error('FashionService not initialized');
          }
          const today = new Date().toISOString().split('T')[0];
          const outfit = self.fashionService.logOutfit({
            date: today,
            occasion: payload.occasion as 'casual' | 'work' | 'formal' | 'sport' | 'special' | undefined,
            itemIds: payload.items,
          });
          return { success: true, action: 'fashion_log_outfit', data: outfit };
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
        handler: async (_args: unknown) => {
          if (!self.fashionService) {
            throw new Error('FashionService not initialized');
          }
          // Get recent outfits
          const outfits = self.fashionService.getOutfits();
          return { success: true, action: 'fashion_recommend', data: outfits };
        },
      },
    ];
  }

  private isNaturalLanguage(message: GatewayMessage): boolean {
    return !!message.naturalLanguage && message.naturalLanguage.length > 0;
  }

  async handleGatewayMessage(message: GatewayMessage): Promise<unknown> {
    const { action, payload, naturalLanguage } = message;
    this.logger.debug(`Handling Gateway message: ${action}`);

    if (this.isNaturalLanguage(message)) {
      return this.handleNaturalLanguage(naturalLanguage!);
    }

    const tools = this.getTools();
    const tool = tools.find(t => t.name === action);
    if (!tool) {
      throw new Error(`Unknown action: ${action}`);
    }
    return tool.handler(payload || {});
  }

  private async handleNaturalLanguage(input: string): Promise<unknown> {
    if (!this.nlEnabled) {
      return { success: false, error: 'Natural language processing is disabled' };
    }

    if (!this.nluParser) {
      return { success: false, error: 'NLU parser not configured' };
    }

    this.logger.info(`Processing NL request: ${input}`);

    try {
      const parsed = await this.nluParser(input);

      if (!parsed.tool) {
        return { success: false, error: parsed.error || 'Could not understand the request' };
      }

      const tools = this.getTools();
      const tool = tools.find(t => t.name === parsed.tool);
      if (!tool) {
        return { success: false, error: `Unknown tool: ${parsed.tool}` };
      }

      this.logger.info(`Executing tool: ${parsed.tool} with args:`, parsed.args);
      const result = await tool.handler(parsed.args);

      return { success: true, result, parsed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`NL processing error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
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

  // Expose managers for testing
  getHealthService(): HealthService | undefined {
    return this.healthService;
  }

  getFinanceService(): FinanceService | undefined {
    return this.financeService;
  }

  getFashionService(): FashionService | undefined {
    return this.fashionService;
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

const openclawPlugin = {
  id: 'privy-jiner',
  name: 'Privy-Jiner Personal Assistant',
  description: 'Personal AI assistant with finance, health, fashion modules',
  configSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      enabled: { type: 'boolean' },
      jinerApiUrl: { type: 'string' },
    },
  },
  async onLoad() {
    console.log('[Jiner Plugin] Loaded successfully');
  },
  async onUnload() {
    console.log('[Jiner Plugin] Unloaded');
  },
  getTools() {
    return [];
  },
};

export default function openclawPluginEntrypoint(api: {
  registerTool: (tool: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    execute: (id: string, params: unknown) => Promise<unknown>;
  }, options?: { optional?: boolean }) => void;
  registerHttpRoute?: (route: {
    path: string;
    auth: 'none' | 'plugin' | 'gateway';
    match: 'exact' | 'prefix';
    handler: (req: unknown, res: unknown) => Promise<boolean>;
  }) => void;
}) {
  const JINER_API_URL = process.env.JINER_API_URL || 'http://localhost:3001';

  async function callJinerAPI(message: string) {
    try {
      const response = await fetch(`${JINER_API_URL}/api/ai/nlu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  api.registerTool({
    name: 'jiner_nlu',
    description: 'Process natural language for health, finance, and fashion data. Use when user mentions: water, drink, exercise, spent, bought, paid, expense, outfit, clothes, etc.',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The natural language message from user' },
      },
      required: ['message'],
    },
    execute: async (_id, params) => {
      const { message } = params as { message: string };
      return await callJinerAPI(message);
    },
  });

  api.registerTool({
    name: 'health_log_water',
    description: 'Log water intake in milliliters. Use when user says they drank water, e.g., "我喝了30ml水"',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount in milliliters' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['amount'],
    },
    execute: async (_id, params) => {
      const { amount, date } = params as { amount: number; date?: string };
      const message = date 
        ? `我喝了${amount}ml水，日期是${date}` 
        : `我喝了${amount}ml水`;
      return await callJinerAPI(message);
    },
  });

  api.registerTool({
    name: 'health_log_exercise',
    description: 'Log exercise activity. Use when user mentions exercise, running, walking, etc.',
    parameters: {
      type: 'object',
      properties: {
        activity: { type: 'string', description: 'Type of exercise (running, walking, etc.)' },
        duration: { type: 'number', description: 'Duration in minutes' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['activity', 'duration'],
    },
    execute: async (_id, params) => {
      const { activity, duration, date } = params as { activity: string; duration: number; date?: string };
      const message = date 
        ? `我做了${duration}分钟${activity}运动，日期是${date}` 
        : `我做了${duration}分钟${activity}运动`;
      return await callJinerAPI(message);
    },
  });

  api.registerTool({
    name: 'health_query',
    description: 'Query health data including water intake and exercise logs',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['water', 'exercise'], description: 'Type of health data to query' },
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD' },
        endDate: { type: 'string', description: 'End date in YYYY-MM-DD' },
      },
    },
    execute: async (_id, params) => {
      const { type, startDate, endDate } = params as { type?: string; startDate?: string; endDate?: string };
      if (type === 'water') {
        const response = await fetch(`${JINER_API_URL}/api/health/water`);
        const data = await response.json();
        const total = data.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
        return { success: true, data: { todayTotal: total, logs: data } };
      }
      return { success: true, data: { note: 'Query other health data via jiner API' } };
    },
  });

  api.registerTool({
    name: 'finance_record',
    description: 'Record income or expense. Use when user mentions spending money, earning money, etc.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['income', 'expense'], description: 'Type of transaction' },
        amount: { type: 'number', description: 'Amount' },
        category: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Description' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['type', 'amount'],
    },
    execute: async (_id, params) => {
      const { type, amount, category, description, date } = params as { type: string; amount: number; category?: string; description?: string; date?: string };
      const message = type === 'expense'
        ? `我花了${amount}元${category ? '用于' + category : ''}${description ? '，' + description : ''}`
        : `我收入了${amount}元${category ? '来自' + category : ''}`;
      return await callJinerAPI(message);
    },
  });

  api.registerTool({
    name: 'finance_query',
    description: 'Query finance records',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['income', 'expense'], description: 'Filter by type' },
        category: { type: 'string', description: 'Filter by category' },
        startDate: { type: 'string', description: 'Start date' },
        endDate: { type: 'string', description: 'End date' },
        limit: { type: 'number', description: 'Limit results' },
      },
    },
    execute: async (_id, params) => {
      return await callJinerAPI('查询我的财务记录');
    },
  });

  api.registerTool({
    name: 'finance_report',
    description: 'Get finance summary report',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD' },
        endDate: { type: 'string', description: 'End date in YYYY-MM-DD' },
      },
    },
    execute: async (_id, params) => {
      return await callJinerAPI('查看财务报告');
    },
  });

  api.registerTool({
    name: 'fashion_add_item',
    description: 'Add wardrobe item',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Item name' },
        category: { type: 'string', enum: ['top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear', 'other'], description: 'Clothing category' },
        color: { type: 'string', description: 'Color' },
        brand: { type: 'string', description: 'Brand' },
        favorite: { type: 'boolean', description: 'Mark as favorite' },
      },
      required: ['name', 'category'],
    },
    execute: async (_id, params) => {
      return await callJinerAPI(`添加衣服：${JSON.stringify(params)}`);
    },
  });

  api.registerTool({
    name: 'fashion_log_outfit',
    description: 'Log an outfit',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Outfit name' },
        items: { type: 'array', items: { type: 'string' }, description: 'Item IDs' },
        occasion: { type: 'string', description: 'Occasion (casual, work, formal, sport, special)' },
        weather: { type: 'string', description: 'Weather condition' },
      },
      required: ['name', 'items'],
    },
    execute: async (_id, params) => {
      return await callJinerAPI(`记录穿搭：${JSON.stringify(params)}`);
    },
  });

  api.registerTool({
    name: 'fashion_recommend',
    description: 'Get outfit recommendations',
    parameters: {
      type: 'object',
      properties: {
        occasion: { type: 'string', description: 'Occasion' },
        season: { type: 'string', description: 'Season' },
      },
    },
    execute: async (_id, params) => {
      return await callJinerAPI('给我穿搭推荐');
    },
  });
}

export { openclawPlugin };
