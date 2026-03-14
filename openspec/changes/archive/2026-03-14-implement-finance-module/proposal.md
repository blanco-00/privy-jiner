## Why

Privy-Jiner needs core functionality to be useful. Currently the dashboard is empty with no real features. Users need financial tracking, health tracking, and other personal management capabilities to make the system valuable.

## What Changes

- Add Finance module with expense/income tracking, categories, budgets
- Add Health module with water intake, exercise tracking
- Add API endpoints for each module
- Add Dashboard integration for each module
- Create modular plugin architecture for extensibility

## Capabilities

### New Capabilities

- `finance-tracking`: Record and query income/expenses with categories
- `health-tracking`: Track water intake and exercise activities
- `dashboard-widgets`: Display real-time stats on dashboard
- `plugin-api`: Standardized API for plugins to register routes

### Modified Capabilities

- None yet - this is initial implementation

## Impact

- New package: `packages/modules/finance`
- New package: `packages/modules/health`
- Modified: `packages/core` - add plugin registration
- Modified: `packages/dashboard` - add module pages and widgets
