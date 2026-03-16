## ADDED Requirements

### Requirement: Capabilities are discovered at runtime from AI service config
The plugin SHALL automatically discover available capabilities from AI service configuration.

#### Scenario: Capabilities loaded from AI tools config
- **WHEN** plugin `onLoad()` is called
- **THEN** system reads tools from AI service configuration
- **AND** generates capability list from tool definitions
- **AND** logs "[Jiner Plugin] Discovered capabilities: water, exercise, expense"

#### Capability mapping
- **GIVEN** AI service has tool definitions with keywords
- **WHEN** capabilities are discovered
- **THEN** tool names are mapped to capability descriptions
- **AND** keywords are exposed for OpenClaw intent matching

### Requirement: New capabilities are automatically available after restart
When user adds new tools to AI service config, they SHALL be available without code changes.

#### Scenario: New tool added to config
- **WHEN** user adds new tool definition to AI config
- **AND** restarts Jiner service
- **THEN** new tool appears in OpenClaw tool list
- **AND** can be triggered via natural language

#### Configuration-driven capabilities
- **GIVEN** AI tools are defined in config (not hardcoded)
- **WHEN** Jiner starts
- **THEN** all configured tools are registered as capabilities
- **AND** no code changes needed for new tools

### Requirement: Plugin exports capability metadata for OpenClaw
The plugin SHALL provide capability metadata that OpenClaw can read.

#### Scenario: Get capabilities returns structured data
- **WHEN** OpenClaw calls `getCapabilities()`
- **THEN** returns array of `{ name, description, keywords, endpoint }`
- **AND** logs "[Jiner Plugin] Exported N capabilities"

#### Capability structure
- **GIVEN** capability exists
- **WHEN** exported
- **THEN** includes: `name`, `description`, `keywords[]`, `endpoint`
- **AND** includes: `nlu_required: boolean`

### Requirement: Logging for capability discovery
The system SHALL log capability discovery process for debugging.

#### Discovery logging
- **WHEN** capabilities are discovered
- **THEN** logs "[Jiner Plugin] === Capability Discovery Start ==="
- **AND** logs "[Jiner Plugin] Found X tools in AI config"
- **AND** logs "[Jiner Plugin] === Capability Discovery Complete ==="

#### Error logging
- **WHEN** capability discovery fails
- **THEN** logs "[Jiner Plugin] ERROR: Failed to discover capabilities"
- **AND** logs the error message
- **AND** continues with empty capabilities (graceful degradation)
