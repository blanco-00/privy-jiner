# plugin-system Specification

## Purpose
TBD - created by archiving change privy-jiner-open-source. Update Purpose after archive.
## Requirements
### Requirement: Plugin database isolation
The system SHALL support isolated and shared database modes for plugins.

#### Scenario: Plugin uses isolated database
- **WHEN** plugin is configured with isolated database
- **THEN** system creates dedicated database file for plugin
- **AND** system grants exclusive access to plugin
- **AND** system stores plugin-specific data in isolated database
- **AND** system prevents plugin from accessing other plugin databases

#### Scenario: Plugin uses shared database
- **WHEN** plugin is configured with shared database
- **THEN** system grants access to shared core database
- **AND** plugin shares data with other plugins via events
- **AND** system uses schema prefixes (plugin_name_table_name) to avoid conflicts

#### Scenario: Configure plugin database mode
- **WHEN** user installs or updates plugin
- **THEN** system allows choosing database mode
- **AND** system defaults to "isolated" for security
- **AND** system validates database configuration

#### Scenario: Uninstall plugin with data cleanup
- **WHEN** user uninstalls plugin
- **THEN** system prompts user for data handling
- **AND** system offers options: delete / keep / archive
- **AND** system handles user choice (delete file, backup file, or keep database)

---

### Requirement: Plugin database manifest extension
Plugin manifest SHALL support database mode configuration.

#### Scenario: Define isolated database in manifest
- **WHEN** developer creates plugin manifest
- **THEN** manifest includes database.mode field with value "isolated"
- **AND** manifest includes database.path field
- **AND** system validates that database path is in plugins/ subdirectory

#### Scenario: Define shared database in manifest
- **WHEN** developer creates plugin manifest
- **THEN** manifest includes database.mode field with value "shared"
- **AND** system validates that shared database is core.db

---

### Requirement: Cross-plugin data exchange via events
The system SHALL allow plugins to exchange data via event bus with permission control.

#### Scenario: Plugin publishes data event
- **WHEN** plugin wants to share data
- **THEN** system validates event has permission flag
- **AND** system logs all data events for audit
- **AND** system routes event to subscribing plugins

#### Scenario: Plugin subscribes to data event
- **WHEN** plugin needs data from other plugin
- **THEN** system checks event permission
- **AND** system delivers event only if plugin has access right
- **AND** system logs data access for audit

---

### Requirement: Plugin interface definition
The system SHALL define a standardized plugin interface for third-party developers.

#### Scenario: Define plugin metadata
- **WHEN** developer creates plugin
- **THEN** plugin defines unique ID, name, version
- **AND** plugin defines description and author
- **AND** plugin defines dependencies

#### Scenario: Define plugin capabilities
- **WHEN** plugin exposes capabilities
- **THEN** plugin declares capability types (功能/数据源/通讯/UI)
- **AND** plugin declares capability names and descriptions
- **AND** plugin provides tool functions for capabilities

#### Scenario: Implement plugin lifecycle hooks
- **WHEN** plugin implements lifecycle
- **THEN** plugin provides onLoad() hook
- **AND** plugin provides onUnload() hook
- **AND** plugin provides optional onConfigChange() hook

---

### Requirement: Modular plugin architecture
The system SHALL support modular plugins where users install needed features.

#### Scenario: Install feature plugin
- **WHEN** user installs a feature plugin (e.g., finance)
- **THEN** system downloads plugin from npm
- **AND** system installs plugin to plugin directory
- **AND** system enables plugin automatically
- **AND** system registers plugin capabilities

#### Scenario: Install scenario plugin
- **WHEN** user installs a scenario plugin (e.g., travel)
- **THEN** system downloads plugin from npm
- **AND** system installs plugin to plugin directory
- **AND** system enables plugin automatically
- **AND** system registers plugin capabilities for scenario

#### Scenario: List installed plugins
- **WHEN** user queries installed plugins
- **THEN** system returns all installed plugins
- **AND** system groups plugins by type (feature/scenario)
- **AND** system shows plugin status (enabled/disabled)

---

### Requirement: Plugin capability composition
Scenario plugins SHALL compose multiple feature modules.

#### Scenario: Scenario plugin includes finance capability
- **WHEN** scenario plugin includes finance features
- **THEN** plugin exposes finance tools
- **AND** plugin composes with core finance module
- **AND** system routes finance requests to scenario plugin

#### Scenario: Scenario plugin includes health capability
- **WHEN** scenario plugin includes health features
- **THEN** plugin exposes health tools
- **AND** plugin composes with core health module
- **AND** system routes health requests to scenario plugin

---

### Requirement: Standalone deployment plugin compatibility
Core framework SHALL support plugins in standalone deployment mode.

#### Scenario: Load plugin in standalone mode
- **WHEN** system starts in standalone mode
- **THEN** system loads all installed plugins
- **AND** system initializes plugin capabilities
- **AND** system provides same features as plugin mode

#### Scenario: Plugin database abstraction in standalone mode
- **WHEN** plugin needs database access in standalone mode
- **THEN** system provides unified database interface
- **AND** system supports SQLite/MySQL/PostgreSQL based on user config
- **AND** plugin uses database without caring about implementation

#### Scenario: Plugin AI model access in standalone mode
- **WHEN** plugin needs AI model in standalone mode
- **THEN** system provides AI integration interface
- **AND** plugin configures its own models via system interface
- **AND** plugin uses token management system

---

### Requirement: Lightweight OpenClaw plugin
OpenClaw plugin SHALL be lightweight and expose only essential capabilities.

#### Scenario: Minimal plugin footprint
- **WHEN** OpenClaw plugin loads
- **THEN** plugin loads only core framework
- **AND** plugin exposes only essential tools (no heavy modules)
- **AND** plugin uses minimal dependencies

#### Scenario: Optional feature modules in OpenClaw plugin
- **WHEN** user wants full features in OpenClaw plugin
- **THEN** system allows enabling optional modules
- **AND** system recommends installing full standalone version

---

### Requirement: Plugin loading
The system SHALL discover and load valid plugins at startup.

#### Scenario: Scan plugin directory
- **WHEN** system starts
- **THEN** system scans configured plugin directory
- **AND** system identifies plugin manifest files
- **AND** system validates manifest syntax

#### Scenario: Load plugin
- **WHEN** system loads a valid plugin
- **THEN** system instantiates plugin class
- **AND** system calls plugin's onLoad() hook
- **AND** system registers plugin capabilities
- **AND** system logs plugin loaded

#### Scenario: Skip invalid plugin
- **WHEN** system encounters invalid plugin manifest
- **THEN** system logs validation error
- **AND** system continues loading other plugins
- **AND** system does not crash on invalid plugin

---

### Requirement: Plugin unloading
The system SHALL safely unload plugins when disabled or removed.

#### Scenario: Unload plugin
- **WHEN** plugin is disabled or removed
- **THEN** system calls plugin's onUnload() hook
- **THEN** system unregisters plugin capabilities
- **AND** system removes plugin event listeners
- **AND** system clears plugin from memory
- **AND** system logs plugin unloaded

#### Scenario: Handle plugin unload error
- **WHEN** plugin's onUnload() hook throws error
- **THEN** system logs error
- **AND** system forces plugin cleanup
- **AND** system continues operating

---

### Requirement: Plugin communication
The system SHALL provide inter-plugin communication through event bus.

#### Scenario: Plugin publishes event
- **WHEN** plugin publishes an event
- **THEN** event bus broadcasts event to all subscribers
- **AND** event includes plugin ID as source
- **AND** event includes timestamp

#### Scenario: Plugin subscribes to event
- **WHEN** plugin subscribes to an event type
- **THEN** event bus registers plugin as subscriber
- **AND** event bus forwards matching events to plugin
- **AND** plugin handles events asynchronously

#### Scenario: Prevent event loops
- **WHEN** plugin publishes event
- **THEN** event bus excludes publisher from subscribers
- **AND** event bus prevents recursive event publishing

---

### Requirement: Plugin configuration
The system SHALL allow per-plugin configuration management.

#### Scenario: Load plugin configuration
- **WHEN** plugin loads
- **THEN** system loads plugin configuration from central config
- **AND** system validates configuration against plugin's schema
- **AND** system passes configuration to plugin

#### Scenario: Update plugin configuration
- **WHEN** user updates plugin configuration
- **THEN** system updates configuration in central config
- **AND** system notifies plugin of configuration change
- **AND** plugin applies new configuration

#### Scenario: Get plugin configuration schema
- **WHEN** system requests plugin configuration schema
- **THEN** plugin returns schema definition
- **AND** schema includes field types and constraints
- **AND** schema includes default values

---

### Requirement: Plugin isolation
The system SHALL isolate plugins to prevent crashes or malicious behavior.

#### Scenario: Run plugin in isolated context
- **WHEN** plugin executes
- **THEN** system provides isolated execution context
- **AND** system restricts file system access to plugin directory
- **AND** system limits plugin memory usage

#### Scenario: Handle plugin errors
- **WHEN** plugin throws error
- **THEN** system catches error in isolation layer
- **AND** system logs error with plugin ID
- **AND** system continues operating without plugin

#### Scenario: Terminate misbehaving plugin
- **WHEN** plugin exceeds resource limits
- **THEN** system terminates plugin process
- **AND** system unloads plugin
- **AND** system notifies user of plugin termination

---

### Requirement: Plugin discovery and installation
The system SHALL provide plugin discovery and installation capabilities.

#### Scenario: List installed plugins
- **WHEN** user queries installed plugins
- **THEN** system returns list of loaded plugins
- **AND** system includes plugin metadata
- **AND** system includes plugin status (enabled/disabled)

#### Scenario: Install plugin from npm
- **WHEN** user installs plugin from npm registry
- **THEN** system downloads plugin package
- **THEN** system validates plugin manifest
- **THEN** system copies plugin to plugin directory
- **AND** system loads plugin on next restart

#### Scenario: Enable/disable plugin
- **WHEN** user enables or disables plugin
- **THEN** system updates plugin status in configuration
- **AND** system loads or unloads plugin immediately
- **AND** system confirms status change

---

### Requirement: Plugin versioning
The system SHALL support plugin versioning and compatibility.

#### Scenario: Check plugin version
- **WHEN** plugin loads
- **THEN** system checks plugin version against system requirements
- **AND** system validates compatibility
- **AND** system warns if plugin is outdated

#### Scenario: Update plugin
- **WHEN** user updates plugin
- **THEN** system unloads old version
- **AND** system installs new version
- **AND** system migrates plugin data if needed

#### Scenario: Validate version format
- **WHEN** system checks plugin version
- **THEN** system validates semver format (major.minor.patch)
- **AND** system rejects invalid version format
- **AND** system logs version validation error

