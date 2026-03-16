/**
 * Simple test runner for OpenClawPlugin
 * Run: node scripts/test-openclaw-plugin.js
 */
const path = require('path');
const { OpenClawPlugin } = require('../packages/core/dist/openclaw/index.js');
const { HealthService } = require('../packages/core/dist/modules/health/index.js');
const { FinanceService } = require('../packages/core/dist/modules/finance/index.js');
const { FashionService } = require('../packages/core/dist/modules/fashion/index.js');
const Database = require('better-sqlite3');

const TEST_DB_PATH = path.join(process.cwd(), 'tmp/test-openclaw.db');

console.log('🧪 OpenClawPlugin Integration Tests\n');

// Initialize database
const db = new Database(TEST_DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS health_water_logs (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS health_exercise_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    calories INTEGER,
    steps INTEGER,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS finance_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS finance_transactions (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS fashion_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT,
    brand TEXT,
    purchase_date TEXT,
    purchase_price REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS fashion_outfits (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    occasion TEXT,
    weather TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS fashion_outfit_items (
    outfit_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    PRIMARY KEY (outfit_id, item_id)
  );
`);

// Insert default finance categories
const categories = [
  { name: 'Salary', type: 'income', color: '#54e88a', icon: '💵' },
  { name: 'Food', type: 'expense', color: '#e85454', icon: '🍔' },
];
const stmt = db.prepare('INSERT OR IGNORE INTO finance_categories (id, name, type, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)');
for (const cat of categories) {
  stmt.run(cat.name + '-id', cat.name, cat.type, cat.color, cat.icon, new Date().toISOString());
}

// Create plugin with managers
const plugin = new OpenClawPlugin();
plugin.setManagers({
  db,
  healthService: new HealthService(db),
  financeService: new FinanceService(db),
  fashionService: new FashionService(db),
});

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============= TESTS =============

console.log('\n📋 Health Tools Tests\n');

test('health_log_water - should log water intake', async () => {
  const message = {
    id: '1',
    type: 'request',
    action: 'health_log_water',
    payload: { amount: 500 },
  };
  
  const result = await plugin.handleGatewayMessage(message);
  
  assert(result.success === true, 'Should return success');
  assert(result.data.amount === 500, 'Should log 500ml');
});

test('health_log_exercise - should log exercise', async () => {
  const message = {
    id: '1',
    type: 'request',
    action: 'health_log_exercise',
    payload: { activity: 'running', duration: 30 },
  };
  
  const result = await plugin.handleGatewayMessage(message);
  
  assert(result.success === true, 'Should return success');
  assert(result.data.type === 'running', 'Should log running');
  assert(result.data.duration === 30, 'Should log 30 minutes');
});

test('health_query - should query water data', async () => {
  // First log some water
  await plugin.handleGatewayMessage({
    id: '1',
    type: 'request',
    action: 'health_log_water',
    payload: { amount: 500 },
  });
  
  // Then query
  const result = await plugin.handleGatewayMessage({
    id: '2',
    type: 'request',
    action: 'health_query',
    payload: { type: 'water' },
  });
  
  assert(result.success === true, 'Should return success');
  assert(result.data.todayTotal === 500, 'Should have 500ml total');
});

console.log('\n📋 Finance Tools Tests\n');

test('finance_record - should record expense', async () => {
  const message = {
    id: '1',
    type: 'request',
    action: 'finance_record',
    payload: { type: 'expense', amount: 100 },
  };
  
  const result = await plugin.handleGatewayMessage(message);
  
  assert(result.success === true, 'Should return success');
  assert(result.data.amount === 100, 'Should log 100');
  assert(result.data.type === 'expense', 'Should be expense');
});

test('finance_record - should record income', async () => {
  const message = {
    id: '1',
    type: 'request',
    action: 'finance_record',
    payload: { type: 'income', amount: 5000 },
  };
  
  const result = await plugin.handleGatewayMessage(message);
  
  assert(result.success === true, 'Should return success');
  assert(result.data.amount === 5000, 'Should log 5000');
  assert(result.data.type === 'income', 'Should be income');
});

test('finance_query - should query transactions', async () => {
  // Record some transactions
  await plugin.handleGatewayMessage({
    id: '1',
    type: 'request',
    action: 'finance_record',
    payload: { type: 'expense', amount: 50 },
  });
  
  await plugin.handleGatewayMessage({
    id: '2',
    type: 'request',
    action: 'finance_record',
    payload: { type: 'income', amount: 3000 },
  });
  
  // Query
  const result = await plugin.handleGatewayMessage({
    id: '3',
    type: 'request',
    action: 'finance_query',
    payload: {},
  });
  
  assert(result.success === true, 'Should return success');
  assert(result.data.length >= 2, 'Should have at least 2 transactions');
});

test('finance_report - should get summary', async () => {
  const result = await plugin.handleGatewayMessage({
    id: '1',
    type: 'request',
    action: 'finance_report',
    payload: { startDate: '2026-01-01', endDate: '2026-12-31' },
  });
  
  assert(result.success === true, 'Should return success');
  assert(result.data !== undefined, 'Should have data');
});

console.log('\n📋 Fashion Tools Tests\n');

test('fashion_add_item - should add wardrobe item', async () => {
  const message = {
    id: '1',
    type: 'request',
    action: 'fashion_add_item',
    payload: { name: 'Red T-Shirt', category: 'top', color: 'red' },
  };
  
  const result = await plugin.handleGatewayMessage(message);
  
  assert(result.success === true, 'Should return success');
  assert(result.data.name === 'Red T-Shirt', 'Should log item name');
  assert(result.data.category === 'top', 'Should log category');
});

test('fashion_recommend - should get recommendations', async () => {
  const result = await plugin.handleGatewayMessage({
    id: '1',
    type: 'request',
    action: 'fashion_recommend',
    payload: {},
  });
  
  assert(result.success === true, 'Should return success');
});

console.log('\n📋 Error Handling Tests\n');

test('should throw error for unknown action', async () => {
  let errorThrown = false;
  try {
    await plugin.handleGatewayMessage({
      id: '1',
      type: 'request',
      action: 'unknown_tool',
      payload: {},
    });
  } catch (e) {
    errorThrown = true;
    assert(e.message.includes('Unknown action'), 'Should throw unknown action error');
  }
  assert(errorThrown, 'Should throw error');
});

console.log('\n📋 Natural Language Processing Tests\n');

test('should process NL and execute tool', async () => {
  plugin.setNLUParser(async (input) => {
    if (input.includes('water') || input.includes('喝')) {
      return { tool: 'health_log_water', args: { amount: 500 } };
    }
    return { tool: '', args: {}, error: 'Could not understand' };
  });
  
  const result = await plugin.handleGatewayMessage({
    id: '1',
    type: 'request',
    action: 'chat',
    naturalLanguage: '我喝了500ml水',
  });
  
  assert(result.success === true, 'Should return success');
  assert(result.parsed.tool === 'health_log_water', 'Should parse water tool');
});

// ============= SUMMARY =============

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Tests failed!');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
