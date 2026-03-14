#!/usr/bin/env node

const Database = require('better-sqlite3');
const { Pool } = require('pg');

function migrate(config) {
  console.log('Reading SQLite database...');
  const sqliteDb = new Database(config.sqlitePath, { readonly: true });

  console.log('Connecting to PostgreSQL...');
  const pgPool = new Pool({
    host: config.pgHost,
    port: config.pgPort,
    user: config.pgUser,
    password: config.pgPassword,
    database: config.pgDatabase,
  });

  async function run() {
    console.log('Creating tables...');

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at VARCHAR(255) NOT NULL
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL DEFAULT 'idle',
        created_at VARCHAR(255) NOT NULL,
        updated_at VARCHAR(255) NOT NULL
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        data TEXT,
        created_at VARCHAR(255) NOT NULL,
        expires_at VARCHAR(255)
      )
    `);

    await pgPool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `);

    console.log('Migrating agents...');
    const agents = sqliteDb.prepare('SELECT * FROM agents').all();
    for (const agent of agents) {
      await pgPool.query(
        'INSERT INTO agents (id, name, type, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [agent.id, agent.name, agent.type, agent.status, agent.created_at, agent.updated_at]
      );
    }
    console.log(`Migrated ${agents.length} agents`);

    console.log('Migrating sessions...');
    const sessions = sqliteDb.prepare('SELECT * FROM sessions').all();
    for (const session of sessions) {
      await pgPool.query(
        'INSERT INTO sessions (id, type, data, created_at, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [session.id, session.type, session.data, session.created_at, session.expires_at]
      );
    }
    console.log(`Migrated ${sessions.length} sessions`);

    console.log('Recording migration...');
    await pgPool.query(
      'INSERT INTO migrations (name, applied_at) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      ['001_initial_schema', new Date().toISOString()]
    );

    await pgPool.end();
    sqliteDb.close();

    console.log('Migration completed successfully!');
  }

  run().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

const args = process.argv.slice(2);
if (args.length < 6) {
  console.log('Usage: node migrate-sqlite-pg.cjs <sqlite-path> <pg-host> <pg-port> <pg-user> <pg-password> <pg-database>');
  console.log('Example: node migrate-sqlite-pg.cjs ./data/core.db localhost 5432 postgres password privy_jiner');
  process.exit(1);
}

const [sqlitePath, pgHost, pgPort, pgUser, pgPassword, pgDatabase] = args;

migrate({
  sqlitePath,
  pgHost,
  pgPort: parseInt(pgPort, 10),
  pgUser,
  pgPassword,
  pgDatabase,
});
