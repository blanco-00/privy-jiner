# Plugin Development Guide

## Overview

Privy-Jiner supports a modular plugin system that allows developers to extend functionality through feature plugins and scenario plugins.

## Plugin Types

### Feature Plugins

Feature plugins provide specific functionality that can be used independently:
- Finance plugin: Financial management
- Health plugin: Health tracking
- Fashion plugin: Wardrobe management

### Scenario Plugins

Scenario plugins combine multiple feature plugins to provide complex workflows:
- Daily routine assistant
- Personal productivity booster

## Creating a Plugin

### 1. Project Structure

```
my-plugin/
├── plugin.json
├── src/
│   └── index.ts
└── package.json
```

### 2. Plugin Manifest (plugin.json)

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "entry": "dist/index.js",
  "capabilities": ["myFeature"],
  "database": {
    "mode": "isolated",
    "path": "~/.privy-jiner/data/plugins/my-plugin.db"
  }
}
```

### 3. Plugin Implementation

```typescript
export default class MyPlugin {
  private tools: Record<string, Function>;

  constructor() {
    this.tools = {
      myFeature: (args) => {
        return { result: 'Hello, World!' };
      }
    };
  }

  async onLoad(): Promise<void> {
    console.log('Plugin loaded');
  }

  async onUnload(): Promise<void> {
    console.log('Plugin unloaded');
  }
}
```

## Plugin API

### Lifecycle Hooks

- `onLoad()`: Called when plugin is loaded
- `onUnload()`: Called when plugin is unloaded

### Tools

Expose functions that can be called by the main system:

```typescript
this.tools = {
  greet: (args: { name: string }) => {
    return `Hello, ${args.name}!`;
  }
};
```

### Events

Subscribe to system events:

```typescript
import { globalEventBus } from '@privy-jiner/core';

globalEventBus.subscribe('user:action', (payload) => {
  console.log('User action:', payload);
});
```

## Database Access

### Isolated Mode (Recommended)

Each plugin gets its own database file:

```json
{
  "database": {
    "mode": "isolated",
    "path": "~/.privy-jiner/data/plugins/my-plugin.db"
  }
}
```

### Shared Mode

Access the core database:

```json
{
  "database": {
    "mode": "shared"
  }
}
```

## Publishing

### Build

```bash
npm run build
```

### Publish to npm

```bash
npm publish
```

## Best Practices

1. **Error Handling**: Always wrap async operations in try/catch
2. **Logging**: Use the logger for debugging
3. **Versioning**: Follow semantic versioning
4. **Documentation**: Provide clear README and API docs
5. **Testing**: Write unit tests for your plugin

## Example Plugins

See the built-in modules for reference:
- `packages/modules/finance`
- `packages/modules/health`
- `packages/modules/fashion`
