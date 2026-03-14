import { Express, Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import { ConfigManager } from '../config/index.js';
import { Logger } from '../logger/index.js';
export interface APIRoute {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    path: string;
    handler: (req: Request, res: Response) => Promise<void> | void;
    middleware?: (req: Request, res: Response, next: NextFunction) => void;
}
export declare class APIServer extends EventEmitter {
    private app;
    private server;
    private configManager;
    private logger;
    constructor(configManager: ConfigManager, logger: Logger);
    private setupMiddleware;
    registerRoute(route: APIRoute): void;
    start(): void;
    stop(): void;
    getApp(): Express;
    isRunning(): boolean;
}
//# sourceMappingURL=index.d.ts.map