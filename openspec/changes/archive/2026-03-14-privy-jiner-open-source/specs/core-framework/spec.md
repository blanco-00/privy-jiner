# Spec: Core Framework

## ADDED Requirements

### Requirement: Agent coordination system
The system SHALL provide a coordination layer for managing AI agents, including the main agent (瑾儿/丫鬟头子) and sub-agents (丫鬟们).

#### Scenario: Main agent receives user request
- **WHEN** user sends a request via any channel
- **THEN** main agent receives and routes the request to appropriate sub-agent
- **AND** main agent tracks the request status

#### Scenario: Sub-agent completes task
- **WHEN** sub-agent completes a task
- **THEN** sub-agent reports result to main agent
- **AND** main agent forwards result to user

#### Scenario: Main agent delegates multiple tasks
- **WHEN** main agent receives multiple concurrent requests
- **THEN** main agent delegates tasks to up to 5 sub-agents concurrently
- **AND** main agent monitors all sub-agent statuses

---

### Requirement: Task management system
The system SHALL provide task tracking capabilities without built-in scheduling, focusing on task creation, status tracking, and completion.

#### Scenario: Create a new task
- **WHEN** user creates a new task
- **THEN** system assigns a unique task ID
- **AND** system sets task status to "pending"
- **AND** system stores task in SQLite database

#### Scenario: Update task status
- **WHEN** sub-agent claims a task
- **THEN** system updates task status to "in_progress"
- **AND** system records the claiming agent ID
- **AND** system records the start timestamp

#### Scenario: Complete a task
- **WHEN** sub-agent completes a task
- **THEN** system updates task status to "completed"
- **AND** system stores the task result
- **AND** system records the completion timestamp

#### Scenario: Query tasks by status
- **WHEN** user queries tasks by status
- **THEN** system returns all tasks matching the specified status
- **AND** system returns tasks sorted by creation time

---

### Requirement: Memory management system
The system SHALL provide long-term memory storage for AI agents, enabling context retention across sessions.

#### Scenario: Store memory entry
- **WHEN** agent needs to store information
- **THEN** system creates a memory entry with timestamp
- **AND** system categorizes the memory type (user preference, event, knowledge, etc.)
- **AND** system stores memory in SQLite database

#### Scenario: Retrieve relevant memories
- **WHEN** agent needs context for a new request
- **THEN** system searches memory for relevant entries
- **AND** system returns memories sorted by relevance score

#### Scenario: Update memory entry
- **WHEN** agent needs to update a memory entry
- **THEN** system updates the memory content
- **AND** system updates the last modified timestamp

#### Scenario: Archive old memories
- **WHEN** system runs memory cleanup (triggered externally)
- **THEN** system archives memories older than 30 days
- **AND** system maintains quick access to recent memories

---

### Requirement: Plugin system interface
The system SHALL provide a standardized plugin interface allowing third-party developers to extend functionality.

#### Scenario: Load plugin at startup
- **WHEN** system starts
- **THEN** system scans plugin directory for valid plugins
- **AND** system loads plugins with valid manifest
- **AND** system calls plugin's onLoad hook

#### Scenario: Unload plugin
- **WHEN** plugin is removed or disabled
- **THEN** system calls plugin's onUnload hook
- **AND** system removes plugin from memory
- **AND** system stops processing plugin events

#### Scenario: Plugin subscribes to events
- **WHEN** plugin subscribes to an event type
- **THEN** system registers plugin as event listener
- **AND** system notifies plugin when matching events occur

#### Scenario: Plugin exposes capabilities
- **WHEN** plugin exposes capabilities
- **THEN** system registers capabilities in plugin registry
- **AND** system routes matching requests to plugin

---

### Requirement: Event bus system
The system SHALL provide an event bus for decoupled inter-module communication.

#### Scenario: Publish event
- **WHEN** module publishes an event
- **THEN** event bus broadcasts event to all subscribers
- **AND** event bus includes event payload and timestamp

#### Scenario: Subscribe to event
- **WHEN** module subscribes to an event type
- **THEN** event bus registers module as subscriber
- **AND** event bus forwards future events to module

#### Scenario: Event with multiple subscribers
- **WHEN** event is published with multiple subscribers
- **THEN** event bus delivers event to all subscribers
- **AND** event bus handles subscriber errors independently

---

### Requirement: Configuration management
The system SHALL provide unified configuration management supporting both standalone and plugin modes.

#### Scenario: Load configuration
- **WHEN** system starts
- **THEN** system loads configuration from config file
- **AND** system validates configuration schema
- **AND** system applies default values for missing fields

#### Scenario: Detect deployment mode
- **WHEN** system loads configuration
- **THEN** system detects deployment mode (standalone or plugin)
- **AND** system loads appropriate communication layer

#### Scenario: Reload configuration
- **WHEN** configuration file changes
- **THEN** system detects configuration change
- **AND** system reloads configuration
- **AND** system notifies affected modules

---

### Requirement: Logging system
The system SHALL provide comprehensive logging for debugging and monitoring.

#### Scenario: Log debug message
- **WHEN** system logs a debug message
- **THEN** system writes message to log file with timestamp
- **AND** system includes log level and module name

#### Scenario: Log error with stack trace
- **WHEN** system encounters an error
- **THEN** system writes error message to log file
- **AND** system includes full stack trace
- **AND** system includes context information

#### Scenario: Rotate log files
- **WHEN** log file size exceeds threshold
- **THEN** system creates new log file
- **AND** system archives old log files (retains last 7 days)
