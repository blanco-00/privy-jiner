# API Reference

## Core API

### PrivyJiner

Main application class.

```typescript
import { PrivyJiner } from '@privy-jiner/core';

const app = new PrivyJiner();
await app.initialize();
await app.start();
```

#### Methods

- `initialize()`: Initialize the application
- `start()`: Start the application
- `stop()`: Stop the application
- `getConfigManager()`: Get configuration manager
- `getAgentCoordinator()`: Get agent coordinator
- `getTaskManager()`: Get task manager
- `getMemoryManager()`: Get memory manager
- `getEventBus()`: Get event bus
- `getPluginManager()`: Get plugin manager

### ConfigManager

Manage application configuration.

```typescript
const config = app.getConfigManager();

// Get configuration
config.get();

// Update configuration
config.set({ deployment: { mode: 'standalone' } });

// AI models
config.addAIModel({
  id: 'gpt4',
  provider: 'openai',
  name: 'GPT-4',
  model: 'gpt-4',
  apiKey: 'key'
});
```

### TaskManager

Manage tasks.

```typescript
const tasks = app.getTaskManager();

// Create task
const task = tasks.create('Buy groceries', 'Get milk and bread', 'high');

// List tasks
const pending = tasks.getPending();

// Complete task
tasks.complete(task.id);
```

### MemoryManager

Manage memory/context.

```typescript
const memory = app.getMemoryManager();

// Add memory
memory.add('User prefers dark mode', 'short_term', 5);

// Search memory
const results = memory.search('dark mode', { type: ['short_term'], limit: 10 });
```

### EventBus

Pub/sub event system.

```typescript
const events = app.getEventBus();

// Subscribe
events.subscribe('user:login', (payload) => {
  console.log('User logged in:', payload);
});

// Publish
events.publish('user:login', { userId: '123' });
```

---

## Modules API

### FinanceManager

```typescript
const finance = new FinanceManager(db);

// Records
finance.addRecord({ type: 'expense', amount: 50, category: 'food', date: new Date() });
const records = finance.listRecords({ type: 'expense' });

// Budgets
finance.addBudget({ category: 'food', amount: 500, period: 'monthly', startDate: new Date() });
const status = finance.checkBudgetStatus(budgetId);

// Investments
const portfolio = finance.getPortfolioValue();
```

### HealthManager

```typescript
const health = new HealthManager(db);

// Water
health.logWater(250);
const total = health.getTodayWaterTotal();

// Exercise
health.logExercise('running', 30);

// Goals
health.setGoal({ type: 'water', target: 2000, unit: 'ml', period: 'daily' });
const status = health.checkGoalStatus('water');
```

### FashionManager

```typescript
const fashion = new FashionManager(db);

// Wardrobe
fashion.addItem({ name: 'Blue Shirt', category: 'top', favorite: true });

// Outfits
fashion.logOutfit({ name: 'Casual', itemIds: ['item1', 'item2'] });

// Capsule
fashion.createCapsule({ name: 'Summer Essentials', itemIds: ['item1', 'item2', 'item3'] });
const combinations = fashion.generateCombinations(capsuleId);
```

---

## WebSocket API

### Connect

```javascript
const ws = new WebSocket('ws://localhost:3001');
```

### Messages

```javascript
// Subscribe
ws.send(JSON.stringify({ type: 'subscribe', payload: { event: 'task:created' } }));

// Query
ws.send(JSON.stringify({ type: 'query', payload: { endpoint: '/tasks' } }));
```

---

## HTTP API

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| GET | /api/finance/records | List finance records |
| POST | /api/finance/records | Add record |
| GET | /api/health/water | Get water logs |
| POST | /api/health/water | Log water |

### Authentication

Currently uses session-based auth. Include session cookie in requests.

### Rate Limiting

No rate limiting in standalone mode. Configure reverse proxy for production.
