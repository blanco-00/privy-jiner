import express from 'express';
import { EventEmitter } from 'events';
export class APIServer extends EventEmitter {
    app;
    server = null;
    configManager;
    logger;
    constructor(configManager, logger) {
        super();
        this.app = express();
        this.configManager = configManager;
        this.logger = logger;
        this.setupMiddleware();
    }
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
            });
            next();
        });
        this.app.use((err, req, res, _next) => {
            this.logger.error('API Error', err, { path: req.path, method: req.method });
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }
    registerRoute(route) {
        const handler = async (req, res) => {
            try {
                await route.handler(req, res);
            }
            catch (error) {
                this.logger.error('Route handler error', error, { path: route.path });
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
    start() {
        if (this.server)
            return;
        const config = this.configManager.get();
        const port = config.deployment.port || 3000;
        const host = config.deployment.host || '0.0.0.0';
        this.server = this.app.listen(port, host, () => {
            this.logger.info(`API Server started on ${host}:${port}`);
            this.emit('listening', { port, host });
        });
        this.server.on('error', (error) => {
            this.logger.error('Server error', error);
            this.emit('error', { error });
        });
    }
    stop() {
        if (!this.server)
            return;
        this.server.close(() => {
            this.logger.info('API Server stopped');
            this.emit('stopped');
        });
        this.server = null;
    }
    getApp() {
        return this.app;
    }
    isRunning() {
        return this.server !== null;
    }
}
//# sourceMappingURL=index.js.map