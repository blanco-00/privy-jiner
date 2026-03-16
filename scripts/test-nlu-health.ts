import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.join(__dirname, '../../core/dist/data/test.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS health_water_logs (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

const { v4: uuidv4 } = await import('uuid');

function logWater(amount: number, date: string) {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO health_water_logs (id, amount, date, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, amount, date, now);
  
  return { id, amount, date, created_at: now };
}

const testCases = [
  { input: 'I drank 3 glasses of water', expected: 3 },
  { input: 'had 2 cups of water', expected: 2 },
  { input: 'water: 500ml', expected: 500 },
  { input: 'drank 1 glass of water', expected: 1 },
];

console.log('Testing water logging...\n');

for (const tc of testCases) {
  console.log(`Input: "${tc.input}"`);
  
  const amountMatch = tc.input.match(/(\d+)/);
  const amount = amountMatch ? parseInt(amountMatch[1]) * 250 : 250;
  
  const date = new Date().toISOString().split('T')[0];
  const result = logWater(amount, date);
  
  console.log(`  -> Logged: ${result.amount}ml on ${result.date}`);
  console.log(`  -> ID: ${result.id}\n`);
}

const logs = db.prepare('SELECT * FROM health_water_logs ORDER BY created_at DESC').all();
console.log(`Total water logs: ${logs.length}`);

db.close();
