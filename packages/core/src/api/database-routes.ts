import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';

interface DatabaseConfig {
  type: 'sqlite' | 'mysql' | 'postgresql';
  path?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export function createDatabaseRouter(): Router {
  const router = Router();

  router.get('/status', async (_req: Request, res: Response) => {
    res.json({
      connected: true,
      type: 'sqlite',
      path: '.privy-jiner/data/core.db',
    });
  });

  router.post('/test', async (req: Request, res: Response) => {
    try {
      const config: DatabaseConfig = req.body;

      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host || 'localhost',
          port: config.port || 3306,
          user: config.username,
          password: config.password,
          database: config.database,
          connectTimeout: 5000,
        });
        await connection.end();
        res.json({ success: true });
      } else if (config.type === 'postgresql') {
        const pool = new Pool({
          host: config.host || 'localhost',
          port: config.port || 5432,
          user: config.username,
          password: config.password,
          database: config.database,
          connectionTimeoutMillis: 5000,
        });
        await pool.end();
        res.json({ success: true });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      res.json({ success: false, error: message });
    }
  });

  router.post('/initialize', async (req: Request, res: Response) => {
    try {
      const config: DatabaseConfig = req.body;

      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host || 'localhost',
          port: config.port || 3306,
          user: config.username,
          password: config.password,
          connectTimeout: 5000,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
        await connection.end();

        res.json({
          success: true,
          message: `Database ${config.database} created/verified`,
        });
      } else if (config.type === 'postgresql') {
        const pool = new Pool({
          host: config.host || 'localhost',
          port: config.port || 5432,
          user: config.username,
          password: config.password,
          database: 'postgres',
          connectionTimeoutMillis: 5000,
        });

        await pool.query(`CREATE DATABASE ${config.database}`);
        await pool.end();

        res.json({
          success: true,
          message: `Database ${config.database} created/verified`,
        });
      } else {
        res.json({ success: true, message: 'SQLite is ready' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Initialization failed';
      res.json({ success: false, error: message });
    }
  });

  return router;
}
