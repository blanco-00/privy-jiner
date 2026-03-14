# Spec: OpenClaw Integration

## ADDED Requirements

### Requirement: OpenClaw plugin detection
The system SHALL detect if running as OpenClaw plugin or standalone mode.

#### Scenario: Detect OpenClaw environment
- **WHEN** system starts
- **THEN** system checks for OpenClaw Gateway presence
- **AND** system sets deployment mode to "plugin" if Gateway detected
- **AND** system sets deployment mode to "standalone" otherwise

#### Scenario: Load appropriate communication layer
- **WHEN** system initializes communication
- **THEN** system loads OpenClaw plugin interface in plugin mode
- **AND** system loads WebSocket server in standalone mode
- **AND** system uses same message format for both modes

---

### Requirement: OpenClaw plugin interface
The system SHALL implement OpenClaw plugin interface for Gateway integration.

#### Scenario: Register plugin with Gateway
- **WHEN** plugin loads
- **THEN** system registers plugin ID and capabilities with Gateway
- **AND** system exposes tool functions
- **AND** system subscribes to Gateway events

#### Scenario: Receive message from Gateway
- **WHEN** Gateway sends message to plugin
- **THEN** system processes message content
- **AND** system routes to appropriate module
- **AND** system returns response to Gateway

#### Scenario: Handle plugin configuration
- **WHEN** Gateway provides plugin configuration
- **THEN** system loads configuration from Gateway
- **AND** system validates required fields
- **AND** system applies configuration to modules

---

### Requirement: OpenClaw plugin manifest
The system SHALL provide valid openclaw.plugin.json manifest.

#### Scenario: Define plugin metadata
- **WHEN** system generates plugin manifest
- **THEN** manifest includes plugin ID and name
- **AND** manifest includes version number
- **AND** manifest includes description
- **AND** manifest includes configuration schema

#### Scenario: Define plugin tools
- **WHEN** system defines plugin tools
- **THEN** manifest includes tool function names
- **AND** manifest includes tool descriptions
- **AND** manifest includes parameter schemas

#### Scenario: Validate plugin manifest
- **WHEN** system validates manifest
- **THEN** system checks required fields present
- **AND** system validates configuration schema
- **AND** system ensures tool names are unique

---

### Requirement: Dual-mode message handling
The system SHALL handle messages consistently in both plugin and standalone modes.

#### Scenario: Receive user message (plugin mode)
- **WHEN** user sends message via OpenClaw Gateway
- **THEN** system receives message through plugin interface
- **AND** system processes message same as standalone mode
- **AND** system sends response through Gateway

#### Scenario: Receive user message (standalone mode)
- **WHEN** user sends message via WebSocket
- **THEN** system receives message through WebSocket server
- **AND** system processes message same as plugin mode
- **AND** system sends response through WebSocket

#### Scenario: Handle message attachments
- **WHEN** message includes attachments (files, images)
- **THEN** system saves attachments to local storage
- **AND** system processes attachments as per message context
- **AND** system includes attachment references in response

---

### Requirement: OpenClaw capability exposure
The system SHALL expose Privy-Jiner capabilities as OpenClaw tools.

#### Scenario: Expose finance capabilities
- **WHEN** plugin exposes finance tools
- **THEN** Gateway registers tools: finance_record, finance_query, finance_report
- **AND** tools accept structured parameters
- **AND** tools return standardized responses

#### Scenario: Expose health capabilities
- **WHEN** plugin exposes health tools
- **THEN** Gateway registers tools: health_log_water, health_log_exercise, health_query
- **AND** tools accept structured parameters
- **AND** tools return standardized responses

#### Scenario: Expose fashion capabilities
- **WHEN** plugin exposes fashion tools
- **THEN** Gateway registers tools: fashion_add_item, fashion_log_outfit, fashion_recommend
- **AND** tools accept structured parameters
- **AND** tools return standardized responses
