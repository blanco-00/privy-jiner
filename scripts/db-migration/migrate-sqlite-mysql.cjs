#!/usr/bin/env node

import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';

interface MigrationConfig {
  sqlitePath: string;
  mysqlHost: string;
  mysqlPort: number;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
}

async function migrate(config: MigrationConfig): Promise<void> {
  console.log('Reading SQLite database...');
  const sqliteDb = new Database(config.sqlitePath, { readonly: true });

  console.log('Connecting to MySQL...');
  const mysqlConn = await mysql.createConnection({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
  });

  console.log('Creating tables...');

  await mysqlConn.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at VARCHAR(255) NOT NULL
    )
  `);

  await mysqlConn.execute(`
    CREATE TABLE IF NOT EXISTS agents (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL DEFAULT 'idle',
      created_at VARCHAR(255) NOT NULL,
      updated_at VARCHAR(255) NOT NULL
    )
  `);

  await mysqlConn.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      type VARCHAR(255) NOT NULL,
      text TEXT,
      created_at VARCHAR(255) NOT NULL,
      expires_at VARCHAR(255)
    )
  `);

  await mysqlConn.execute(`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
  `);

  console.log('Migrating agents...');
  const agents = sqliteDb.prepare('SELECT * FROM agents').all();
  for (const agent of agents) {
    await mysqlConn.execute(
      'INSERT IGNORE INTO agents (id, name, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [agent.id, agent.name, agent.type, agent.status, agent.created_at, agent.updated_at]
    );
  }
  console.log(`Migrated ${agents.length} agents`);

  console.log('Migrating sessions...');
  const sessions = sqliteDb.prepare('SELECT * FROM sessions').all();
  for (const session of sessions) {
    await mysqlConn.execute(
      'INSERT IGNORE INTO sessions (id, type, data, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
      [session.id, session.type, session.data, session.created_at, session.expires_at]
    );
  }
  console.log(`Migrated ${sessions.length} sessions`);

  console.log('Recording migration...');
  await mysqlConn.execute(
    'INSERT INTO migrations (name, applied_at) VALUES (?, ?)',
    ['001_initial_schema', new Date().toISOString()]
  );

  await mysqlConn.end();
  sqliteDb.close();

  console.log('Migration completed successfully!');
}

const args = process.argv.slice(2);
if (args.length < 6) {
  console.log('Usage: node migrate-sqlite-mysql.js <sqlite-path> <mysql-host> <mysql-port> <mysql-user> <mysql-password> <mysql-database>');
  console.log('Example: node migrate-sqlite-mysql.js ./data/core.db localhost 3306 root password privy_jiner');
  process.exit(1);
}

const [sqlitePath, mysqlHost, mysqlPort, mysqlUser, mysqlPassword, mysqlDatabase] = args;

migrate({
  sqlitePath,
  mysqlHost,
  mysqlPort: parseInt(mysqlPort, 10),
  mysqlUser,
  mysqlPassword,
  mysqlDatabase,
}).catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
