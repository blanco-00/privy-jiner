## ADDED Requirements

### Requirement: NLU parseIntent returns correct tool for water logging
The NLU service shall correctly identify water logging intent from various phrasings.

#### Scenario: Parse "I drank 3 glasses of water"
- **WHEN** parseIntent receives "I drank 3 glasses of water"
- **THEN** returns tool: "health_log_water" with confidence > 0.5

#### Scenario: Parse "water: 500ml"
- **WHEN** parseIntent receives "water: 500ml"
- **THEN** returns tool: "health_log_water"

#### Scenario: Parse "had 2 cups of water"
- **WHEN** parseIntent receives "had 2 cups of water"
- **THEN** returns tool: "health_log_water"

### Requirement: NLU parseIntent extracts numeric parameters correctly
The NLU service shall extract numeric values from user input.

#### Scenario: Extract number from "3 glasses"
- **WHEN** numeric extraction receives "3 glasses"
- **THEN** returns 3

#### Scenario: Extract number from "500ml"
- **WHEN** numeric extraction receives "500ml"
- **THEN** returns 500

### Requirement: NLU returns null for unknown intents
The NLU service shall return null tool for unrecognized requests.

#### Scenario: Unknown request
- **WHEN** parseIntent receives "What is the weather?"
- **THEN** returns tool: null with confidence: 0

### Requirement: NLU executeTool calls registered executor
The NLU service shall execute the correct tool when intent is parsed.

#### Scenario: Execute water logging tool
- **WHEN** executeTool receives { tool: "health_log_water", args: { amount: 3 } }
- **THEN** calls the registered executor with { amount: 3 }
