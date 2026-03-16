## ADDED Requirements

### Requirement: Parse natural language to structured tool call
The NLU service MUST accept natural language text and return a structured tool call with tool name and parameters.

#### Scenario: Parse water logging intent
- **WHEN** NLU service receives "I drank 3 glasses of water"
- **THEN** it returns `{ tool: "health_log_water", args: { amount: 3 } }`

#### Scenario: Parse exercise logging intent
- **WHEN** NLU service receives "I ran for 30 minutes this morning"
- **THEN** it returns `{ tool: "health_log_exercise", args: { activity: "running", duration: 30 } }`

#### Scenario: Parse expense recording intent
- **WHEN** NLU service receives "Spent $50 on lunch"
- **THEN** it returns `{ tool: "finance_record", args: { type: "expense", amount: 50, category: "food" } }`

### Requirement: Return parsing confidence score
The NLU service MUST return a confidence score (0-1) indicating how certain the parsing is.

#### Scenario: High confidence parsing
- **WHEN** user input matches known patterns clearly
- **THEN** confidence score is >= 0.8

#### Scenario: Low confidence parsing
- **WHEN** user input is ambiguous
- **THEN** confidence score is < 0.8 and system requests clarification

### Requirement: Handle unparseable input gracefully
The NLU service MUST handle inputs that cannot be mapped to any tool.

#### Scenario: Unknown intent
- **WHEN** NLU cannot match input to any known tool
- **THEN** return `{ tool: null, args: {}, confidence: 0, error: "Could not understand request" }`

### Requirement: Support tool definitions via prompt injection
The NLU service MUST accept tool definitions as structured JSON to determine available actions.

#### Scenario: Custom tool definitions
- **WHEN** tool definitions include `{ "tool": "custom_action", "keywords": ["do X"] }`
- **THEN** NLU parses inputs matching "do X" to custom_action

## ADDED Requirements

### Requirement: Execute parsed tool call
The NLU service MUST execute the parsed tool call against the appropriate module API.

#### Scenario: Execute water logging
- **WHEN** NLU returns `{ tool: "health_log_water", args: { amount: 3 } }`
- **THEN** health module API is called and water record is created in database

#### Scenario: Execute expense recording
- **WHEN** NLU returns `{ tool: "finance_record", args: { type: "expense", amount: 50 } }`
- **THEN** finance module API is called and expense record is created
