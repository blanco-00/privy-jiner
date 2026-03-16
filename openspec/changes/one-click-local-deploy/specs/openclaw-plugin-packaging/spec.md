## ADDED Requirements

### Requirement: OpenClaw plugin can be packaged as single JS file
The system SHALL generate a single `dist/openclaw-plugin.js` file that can be loaded by OpenClaw gateway.

#### Scenario: Package builds successfully
- **WHEN** developer runs `npm run build:plugin`
- **THEN** `dist/openclaw-plugin.js` file is generated
- **AND** file size is less than 2MB

#### Scenario: Package contains all required exports
- **WHEN** OpenClaw loads the plugin file
- **THEN** plugin exports `onLoad`, `onUnload`, `getToolHandlers` functions
- **AND** exports are callable

### Requirement: Plugin loads without errors in OpenClaw
The plugin SHALL load successfully in OpenClaw gateway without console errors.

#### Scenario: Plugin onLoad executes
- **WHEN** OpenClaw starts and loads plugin
- **THEN** `onLoad()` function is called
- **AND** logs "[Jiner Plugin] Loaded successfully" to console

#### Scenario: Database initializes on load
- **WHEN** plugin `onLoad()` is called
- **THEN** SQLite database connection is established
- **AND** tables are created if not exist

### Requirement: Plugin provides tool handlers for all capabilities
The plugin SHALL export handlers for water logging, exercise tracking, and expense recording.

#### Scenario: Tool handlers are registered
- **WHEN** OpenClaw queries available tools
- **THEN** handlers for `health_log_water`, `health_log_exercise`, `finance_record_expense` are returned
