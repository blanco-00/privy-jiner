import { ConfigManager } from './config/index.js';
import { DatabaseManager } from './database/index.js';
import { Logger } from './logger/index.js';
import { AgentCoordinator } from './agent/index.js';
import { TaskManager } from './task/index.js';
import { MemoryManager } from './memory/index.js';
import { EventBus } from './event-bus/index.js';
import { PluginManager } from './plugin/index.js';
import { SessionManager } from './session/index.js';
import { WSServer } from './websocket/index.js';
import { APIServer } from './api/index.js';
import { AuthManager } from './auth/index.js';
import { createAuthRouter } from './api/auth-routes.js';
import { createDatabaseRouter } from './api/database-routes.js';
import { createFinanceRouter } from './api/finance-routes.js';
import { createHealthRouter } from './api/health-routes.js';
import { createFashionRouter } from './api/fashion-routes.js';
import { createKnowledgeRouter } from './api/knowledge-routes.js';
import { createNewsRouter } from './api/news-routes.js';
import { createProfileRouter } from './api/profile-routes.js';
import { createContactsRouter } from './api/contacts-routes.js';
import { createScheduleRouter } from './api/schedule-routes.js';
import { createTasksRouter } from './api/tasks-routes.js';
import { createAIRouter } from './api/ai-routes.js';
import { createMonitoringRouter } from './api/monitoring-routes.js';
import { FinanceService } from './modules/finance/index.js';
import { HealthService } from './modules/health/index.js';
import { FashionService } from './modules/fashion/index.js';
import { KnowledgeService } from './modules/knowledge/index.js';
import { NewsService } from './modules/news/index.js';
import { ProfileService } from './modules/profile/index.js';
import { ContactsService } from './modules/contacts/index.js';
import { ScheduleService } from './modules/schedule/index.js';
import { TasksService } from './modules/tasks/index.js';
import { AIService } from './modules/ai/index.js';
import { MonitoringService } from './modules/monitoring/index.js';

export interface PrivyJinerOptions {
  configPath?: string;
  pluginDirectory?: string;
  autoStart?: boolean;
}

export class PrivyJiner {
  private configManager: ConfigManager;
  private databaseManager: DatabaseManager;
  private logger: Logger;
  private agentCoordinator: AgentCoordinator;
  private taskManager: TaskManager;
  private memoryManager: MemoryManager;
  private eventBus: EventBus;
  private pluginManager: PluginManager;
  private sessionManager: SessionManager;
  private wsServer: WSServer;
  private apiServer: APIServer;
  private authManager: AuthManager;
  private financeService: FinanceService;
  private healthService: HealthService;
  private fashionService: FashionService;
  private knowledgeService: KnowledgeService;
  private newsService: NewsService;
  private profileService: ProfileService;
  private contactsService: ContactsService;
  private scheduleService: ScheduleService;
  private tasksService: TasksService;
  private aiService: AIService;
  private monitoringService: MonitoringService;
  private initialized = false;

  constructor(options: PrivyJinerOptions = {}) {
    this.configManager = new ConfigManager(options.configPath);
    this.databaseManager = new DatabaseManager();
    this.logger = new Logger(this.configManager.get().logging);
    this.authManager = new AuthManager(this.configManager.get().auth);

    const config = this.configManager.get();
    const db = this.databaseManager.initialize({
      path: config.database.path,
      wal: true,
    });

    this.financeService = new FinanceService(db);
    this.healthService = new HealthService(db);
    this.fashionService = new FashionService(db);
    this.knowledgeService = new KnowledgeService(db);
    this.newsService = new NewsService(db);
    this.profileService = new ProfileService(db);
    this.contactsService = new ContactsService(db);
    this.scheduleService = new ScheduleService(db);
    this.tasksService = new TasksService(db);
    this.aiService = new AIService(db);
    this.monitoringService = new MonitoringService(db);

    this.agentCoordinator = new AgentCoordinator();
    this.taskManager = new TaskManager(db);
    this.memoryManager = new MemoryManager(db);
    this.eventBus = new EventBus();
    this.pluginManager = new PluginManager(options.pluginDirectory);
    this.sessionManager = new SessionManager(db);
    this.wsServer = new WSServer();
    this.apiServer = new APIServer(this.configManager, this.logger);

    this.apiServer.registerRoute({ method: 'get', path: '/api/auth/*', handler: () => {} });
    this.apiServer.getApp().use('/api/auth', createAuthRouter(this.authManager));
    this.apiServer.getApp().use('/api/database', createDatabaseRouter());
    this.apiServer.getApp().use('/api/finance', createFinanceRouter(this.financeService));
    this.apiServer.getApp().use('/api/health', createHealthRouter(this.healthService));
    this.apiServer.getApp().use('/api/fashion', createFashionRouter(this.fashionService));
    this.apiServer.getApp().use('/api/knowledge', createKnowledgeRouter(this.knowledgeService));
    this.apiServer.getApp().use('/api/news', createNewsRouter(this.newsService));
    this.apiServer.getApp().use('/api/profile', createProfileRouter(this.profileService));
    this.apiServer.getApp().use('/api/contacts', createContactsRouter(this.contactsService));
    this.apiServer.getApp().use('/api/schedules', createScheduleRouter(this.scheduleService));
    this.apiServer.getApp().use('/api/tasks', createTasksRouter(this.tasksService));
    this.apiServer.getApp().use('/api/ai', createAIRouter(this.aiService));
    this.apiServer.getApp().use('/api/monitoring', createMonitoringRouter(this.monitoringService));

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('error', (payload) => {
      this.logger.error('Event bus error', payload.error as Error);
    });

    this.pluginManager.on('loaded', (plugin) => {
      this.logger.info(`Plugin loaded: ${plugin.manifest.name}`);
    });

    this.pluginManager.on('unloaded', (plugin) => {
      this.logger.info(`Plugin unloaded: ${plugin.manifest.name}`);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing Privy-Jiner...');

    const mainAgent = this.agentCoordinator.createMainAgent({
      id: 'main',
      name: 'Main Agent',
      capabilities: ['execute', 'coordinate', 'delegate'],
    });

    this.logger.info(`Main agent created: ${mainAgent.id}`);
    this.initialized = true;
  }

  async start(): Promise<void> {
    await this.initialize();

    const mode = this.configManager.getDeploymentMode();

    if (mode === 'standalone') {
      this.apiServer.start();
      this.wsServer.start();
      this.logger.info('Standalone mode started');
    }

    const plugins = await this.pluginManager.discover();
    for (const manifest of plugins) {
      await this.pluginManager.load(manifest);
    }
  }

  stop(): void {
    const mode = this.configManager.getDeploymentMode();

    if (mode === 'standalone') {
      this.wsServer.stop();
      this.apiServer.stop();
    }

    this.pluginManager.unload
    this.databaseManager.close();
    this.logger.info('Privy-Jiner stopped');
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  getAgentCoordinator(): AgentCoordinator {
    return this.agentCoordinator;
  }

  getTaskManager(): TaskManager {
    return this.taskManager;
  }

  getMemoryManager(): MemoryManager {
    return this.memoryManager;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  getWSServer(): WSServer {
    return this.wsServer;
  }

  getAPIServer(): APIServer {
    return this.apiServer;
  }

  getLogger(): Logger {
    return this.logger;
  }
}

export * from './config/index.js';
export * from './database/index.js';
export * from './logger/index.js';
export * from './agent/index.js';
export * from './task/index.js';
export * from './memory/index.js';
export * from './event-bus/index.js';
export * from './plugin/index.js';
export * from './session/index.js';
export * from './websocket/index.js';
export * from './api/index.js';
