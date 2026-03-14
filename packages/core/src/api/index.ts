import express, { Express, Request, Response, NextFunction } from 'express';
import * as http from 'http';
import { EventEmitter } from 'events';
import { ConfigManager } from '../config/index.js';
import { Logger } from '../logger/index.js';

export interface APIRoute {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  handler: (req: Request, res: Response) => Promise<void> | void;
  middleware?: (req: Request, res: Response, next: NextFunction) => void;
}

export class APIServer extends EventEmitter {
  private app: Express;
  private server: http.Server | null = null;
  private configManager: ConfigManager;
  private logger: Logger;

  constructor(configManager: ConfigManager, logger: Logger) {
    super();
    this.app = express();
    this.configManager = configManager;
    this.logger = logger;
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      });
      next();
    });

    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      this.logger.error('API Error', err, { path: req.path, method: req.method });
      res.status(500).json({ error: 'Internal Server Error' });
    });
  }

  registerRoute(route: APIRoute): void {
    const handler = async (req: Request, res: Response) => {
      try {
        await route.handler(req, res);
      } catch (error) {
        this.logger.error('Route handler error', error as Error, { path: route.path });
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };

    switch (route.method) {
      case 'get':
        this.app.get(route.path, route.middleware || [], handler);
        break;
      case 'post':
        this.app.post(route.path, route.middleware || [], handler);
        break;
      case 'put':
        this.app.put(route.path, route.middleware || [], handler);
        break;
      case 'delete':
        this.app.delete(route.path, route.middleware || [], handler);
        break;
      case 'patch':
        this.app.patch(route.path, route.middleware || [], handler);
        break;
    }
  }

  start(): void {
    if (this.server) return;

    const config = this.configManager.get();
    const port = config.deployment.port || 3001;
    const host = config.deployment.host || '0.0.0.0';

    this.server = this.app.listen(port, host, () => {
      this.logger.info(`API Server started on ${host}:${port}`);
      this.emit('listening', { port, host });
    });

    this.server.on('error', (error: Error) => {
      this.logger.error('Server error', error);
      this.emit('error', { error });
    });
  }

  stop(): void {
    if (!this.server) return;

    this.server.close(() => {
      this.logger.info('API Server stopped');
      this.emit('stopped');
    });

    this.server = null;
  }

  getApp(): Express {
    return this.app;
  }

  isRunning(): boolean {
    return this.server !== null;
  }
}
