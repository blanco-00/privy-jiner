## ADDED Requirements

### Requirement: isNaturalLanguage detects NL messages
The OpenClaw plugin shall detect messages with naturalLanguage field.

#### Scenario: Message with naturalLanguage field
- **WHEN** GatewayMessage has naturalLanguage: "I drank water"
- **THEN** isNaturalLanguage() returns true

#### Scenario: Message without naturalLanguage field
- **WHEN** GatewayMessage has action: "health_log_water" but no naturalLanguage
- **THEN** isNaturalLanguage() returns false

### Requirement: handleNaturalLanguage processes NL when enabled
The plugin shall process NL requests when NL feature is enabled.

#### Scenario: NL enabled, valid NL input
- **WHEN** NL is enabled and receives naturalLanguage: "I drank 3 glasses"
- **THEN** calls NLU parser and executes tool

#### Scenario: NL disabled
- **WHEN** NL is disabled and receives naturalLanguage request
- **THEN** returns error: "Natural language processing is disabled"

### Requirement: Structured tool calls work as before
The plugin shall maintain backward compatibility.

#### Scenario: Structured tool call
- **WHEN** receives { action: "health_log_water", payload: { amount: 3 } }
- **THEN** executes tool directly without NLU parsing
