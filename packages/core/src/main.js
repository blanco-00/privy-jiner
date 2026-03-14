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
export class PrivyJiner {
    configManager;
    databaseManager;
    logger;
    agentCoordinator;
    taskManager;
    memoryManager;
    eventBus;
    pluginManager;
    sessionManager;
    wsServer;
    apiServer;
    initialized = false;
    constructor(options = {}) {
        this.configManager = new ConfigManager(options.configPath);
        this.databaseManager = new DatabaseManager();
        this.logger = new Logger(this.configManager.get().logging);
        const config = this.configManager.get();
        const db = this.databaseManager.initialize({
            path: config.database.path,
            wal: true,
        });
        this.agentCoordinator = new AgentCoordinator();
        this.taskManager = new TaskManager(db);
        this.memoryManager = new MemoryManager(db);
        this.eventBus = new EventBus();
        this.pluginManager = new PluginManager(options.pluginDirectory);
        this.sessionManager = new SessionManager(db);
        this.wsServer = new WSServer();
        this.apiServer = new APIServer(this.configManager, this.logger);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.eventBus.subscribe('error', (payload) => {
            this.logger.error('Event bus error', payload.error);
        });
        this.pluginManager.on('loaded', (plugin) => {
            this.logger.info(`Plugin loaded: ${plugin.manifest.name}`);
        });
        this.pluginManager.on('unloaded', (plugin) => {
            this.logger.info(`Plugin unloaded: ${plugin.manifest.name}`);
        });
    }
    async initialize() {
        if (this.initialized)
            return;
        this.logger.info('Initializing Privy-Jiner...');
        const mainAgent = this.agentCoordinator.createMainAgent({
            id: 'main',
            name: 'Main Agent',
            capabilities: ['execute', 'coordinate', 'delegate'],
        });
        this.logger.info(`Main agent created: ${mainAgent.id}`);
        this.initialized = true;
    }
    async start() {
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
    stop() {
        const mode = this.configManager.getDeploymentMode();
        if (mode === 'standalone') {
            this.wsServer.stop();
            this.apiServer.stop();
        }
        this.pluginManager.unload;
        this.databaseManager.close();
        this.logger.info('Privy-Jiner stopped');
    }
    getConfigManager() {
        return this.configManager;
    }
    getAgentCoordinator() {
        return this.agentCoordinator;
    }
    getTaskManager() {
        return this.taskManager;
    }
    getMemoryManager() {
        return this.memoryManager;
    }
    getEventBus() {
        return this.eventBus;
    }
    getPluginManager() {
        return this.pluginManager;
    }
    getSessionManager() {
        return this.sessionManager;
    }
    getWSServer() {
        return this.wsServer;
    }
    getAPIServer() {
        return this.apiServer;
    }
    getLogger() {
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
//# sourceMappingURL=main.js.map