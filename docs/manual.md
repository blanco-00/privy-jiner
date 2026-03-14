# Privy-Jiner User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Features](#features)
5. [Deployment Modes](#deployment-modes)
6. [Data Management](#data-management)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

Privy-Jiner (瑾儿私人管家) is an open-source personal AI assistant system designed for individual use. It supports both standalone deployment and OpenClaw plugin modes, providing features like finance management, health tracking, fashion recommendations, knowledge push, and news aggregation.

### Key Features

- **Core Framework**: Agent coordination, task management, memory system, event bus
- **AI Integration**: Support for OpenAI, Claude, and other third-party models
- **Modules**:
  - Finance: Income/expense tracking, budgets, investments
  - Health: Water intake, exercise tracking, health goals
  - Fashion: Wardrobe management, outfit recommendations
  - Knowledge: Daily knowledge push
  - News: Smart news aggregation and recommendations
- **Deployment**: Standalone mode or OpenClaw plugin
- **i18n**: Chinese and English support
- **Data Privacy**: Local SQLite storage, no cloud sync

---

## Installation

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

### Quick Start

```bash
# Clone the repository
git clone https://github.com/blanco-00/privy-jiner.git
cd privy-jiner

# Install dependencies
npm install

# Build the project
npm run build

# Run in standalone mode
npm run dev
```

### Docker Installation

```bash
# Build the image
docker build -t privy-jiner .

# Run the container
docker run -d -p 3000:3000 privy-jiner
```

---

## Configuration

### Configuration File Location

The default configuration file is located at:
- Linux/macOS: `~/.privy-jiner/config.json`
- Windows: `%USERPROFILE%\.privy-jiner\config.json`

### Configuration Options

```json
{
  "deployment": {
    "mode": "standalone",
    "port": 3000,
    "host": "0.0.0.0"
  },
  "database": {
    "type": "sqlite",
    "path": "~/.privy-jiner/data/core.db"
  },
  "logging": {
    "level": "info",
    "directory": "~/.privy-jiner/logs"
  },
  "i18n": {
    "defaultLocale": "en",
    "fallbackLocale": "en"
  }
}
```

### Database Configuration

#### SQLite (Default)

```json
{
  "database": {
    "type": "sqlite",
    "path": "~/.privy-jiner/data/core.db"
  }
}
```

#### MySQL

```json
{
  "database": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "your-password",
    "database": "privy_jiner"
  }
}
```

#### PostgreSQL

```json
{
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "your-password",
    "database": "privy_jiner"
  }
}
```

### Connection Pooling

For MySQL and PostgreSQL, connection pooling is enabled by default:
- **MySQL**: Pool size 10 (configurable)
- **PostgreSQL**: Pool size 10 (configurable)

### Database Migration

Migrate data between database types:

```bash
privy-jiner db migrate --from mysql --to sqlite --output data.db
```

### AI Model Configuration

```json
{
  "ai": {
    "models": [
      {
        "id": "openai-gpt4",
        "provider": "openai",
        "name": "GPT-4",
        "model": "gpt-4",
        "apiKey": "your-api-key"
      }
    ],
    "defaultModelId": "openai-gpt4",
    "tokenLimit": 1000000,
    "tokenAlertThreshold": 80
  }
}
```

---

## Features

### Finance Module

Manage your finances with income/expense tracking, budgets, investments, and recurring bills.

```typescript
import { FinanceManager } from '@privy-jiner/modules/finance';

const finance = new FinanceManager(database);

// Add income
finance.addRecord({
  type: 'income',
  amount: 5000,
  currency: 'CNY',
  category: 'salary',
  date: new Date()
});

// Set budget
finance.addBudget({
  category: 'food',
  amount: 2000,
  currency: 'CNY',
  period: 'monthly',
  startDate: new Date()
});
```

### Health Module

Track water intake, exercise, and health goals.

```typescript
import { HealthManager } from '@privy-jiner/modules/health';

const health = new HealthManager(database);

// Log water intake
health.logWater(250); // 250ml

// Log exercise
health.logExercise('running', 30, { calories: 300 });

// Set daily goal
health.setGoal({
  type: 'water',
  target: 2000,
  unit: 'ml',
  period: 'daily'
});
```

---

## Deployment Modes

### Standalone Mode

Run Privy-Jiner as an independent service with its own Web Dashboard.

```bash
npm run dev
```

Access the dashboard at `http://localhost:3000`

### OpenClaw Plugin Mode

Deploy as an OpenClaw plugin for integration with QQ Bot.

1. Build the plugin: `npm run build`
2. Copy to OpenClaw plugins directory
3. Configure in OpenClaw

---

## Data Management

### Backup

```typescript
import { DataPrivacyManager } from '@privy-jiner/core';

const privacy = new DataPrivacyManager();
await privacy.backup({
  destination: '/path/to/backup',
  compress: true
});
```

### Export

```typescript
await privacy.exportData({
  format: 'json',
  outputPath: '/path/to/export.json'
});
```

### Encryption

```typescript
const privacy = new DataPrivacyManager();
privacy.setEncryptionKey('your-secret-key');

const encrypted = privacy.encrypt('sensitive data');
const decrypted = privacy.decrypt(encrypted);
```

---

## Troubleshooting

### Common Issues

1. **Database locked**: Close other applications accessing the database
2. **Port already in use**: Change the port in configuration
3. **AI API errors**: Verify API key is correct and has sufficient credits

### Logs

Logs are stored in `~/.privy-jiner/logs/`

Check the latest logs:
```bash
tail -f ~/.privy-jiner/logs/privy-jiner-*.log
```

---

## Support

- GitHub Issues: https://github.com/blanco-00/privy-jiner/issues
- Gitee Issues: https://gitee.com/232911373/privy-jiner/issues
