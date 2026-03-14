import { ConfigManager } from './config/index.js';
import { Logger } from './logger/index.js';
import { AgentCoordinator } from './agent/index.js';
import { TaskManager } from './task/index.js';
import { MemoryManager } from './memory/index.js';
import { EventBus } from './event-bus/index.js';
import { PluginManager } from './plugin/index.js';
import { SessionManager } from './session/index.js';
import { WSServer } from './websocket/index.js';
import { APIServer } from './api/index.js';
export interface PrivyJinerOptions {
    configPath?: string;
    pluginDirectory?: string;
    autoStart?: boolean;
}
export declare class PrivyJiner {
    private configManager;
    private databaseManager;
    private logger;
    private agentCoordinator;
    private taskManager;
    private memoryManager;
    private eventBus;
    private pluginManager;
    private sessionManager;
    private wsServer;
    private apiServer;
    private initialized;
    constructor(options?: PrivyJinerOptions);
    private setupEventHandlers;
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): void;
    getConfigManager(): ConfigManager;
    getAgentCoordinator(): AgentCoordinator;
    getTaskManager(): TaskManager;
    getMemoryManager(): MemoryManager;
    getEventBus(): EventBus;
    getPluginManager(): PluginManager;
    getSessionManager(): SessionManager;
    getWSServer(): WSServer;
    getAPIServer(): APIServer;
    getLogger(): Logger;
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
//# sourceMappingURL=main.d.ts.map