## ADDED Requirements

### Requirement: Accept natural language from OpenClaw
The OpenClaw bridge MUST accept natural language messages from the OpenClaw gateway.

#### Scenario: Receive NL message
- **WHEN** OpenClaw sends message with type "request" and naturalLanguage field
- **THEN** bridge extracts the natural language text for processing

#### Scenario: Forward structured tool call
- **WHEN** OpenClaw sends structured tool call (existing behavior)
- **THEN** bridge forwards to appropriate module handler (unchanged)

### Requirement: Process natural language through NLU
The bridge MUST send natural language to NLU service for intent parsing.

#### Scenario: Parse and execute NL request
- **WHEN** bridge receives "I drank 3 glasses of water"
- **THEN** NLU service parses intent, executes API call, returns result to OpenClaw

#### Scenario: Handle parsing failure
- **WHEN** NLU cannot parse the input
- **THEN** bridge returns error message to OpenClaw requesting clarification

### Requirement: Return execution result to OpenClaw
The bridge MUST return the execution result (success/failure) to OpenClaw gateway.

#### Scenario: Successful execution
- **WHEN** tool execution completes successfully
- **THEN** bridge returns `{ success: true, result: { ... } }` to OpenClaw

#### Scenario: Execution failure
- **WHEN** tool execution fails (API error, invalid params)
- **THEN** bridge returns `{ success: false, error: "..." }` to OpenClaw

### Requirement: Maintain backward compatibility
The bridge MUST continue supporting structured tool calls (existing behavior).

#### Scenario: Existing tool call works
- **WHEN** OpenClaw sends structured tool call `{ action: "health_log_water", payload: { amount: 3 } }`
- **THEN** bridge executes tool directly without NLU parsing (unchanged)

### Requirement: Log all NL interactions
The bridge MUST log natural language requests and their outcomes for debugging.

#### Scenario: Log request
- **WHEN** bridge receives NL request
- **THEN** it logs: input text, parsed intent, execution result

## ADDED Requirements

### Requirement: Configure NL feature toggle
The system MUST allow enabling/disabling natural language processing.

#### Scenario: Disable NL processing
- **WHEN** NL feature is disabled in config
- **THEN** natural language requests return error: "NL processing disabled"

#### Scenario: Enable NL processing
- **WHEN** NL feature is enabled in config
- **THEN** natural language requests are processed through NLU
