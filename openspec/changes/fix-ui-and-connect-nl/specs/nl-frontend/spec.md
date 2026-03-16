## ADDED Requirements

### Requirement: AI Chat sends to NLU backend
The AI chat shall connect to NLU backend for natural language processing.

#### Scenario: User types natural language command
- **WHEN** user types "I drank 3 glasses of water" in AI chat
- **THEN** system parses intent and executes health API
- **AND** returns result to user

#### Scenario: NL mode disabled
- **WHEN** NL mode is toggled off
- **THEN** chat behaves as normal AI conversation

### Requirement: Show execution result in chat
The system shall display what action was taken.

#### Scenario: Water logged successfully
- **WHEN** NL command "I drank water" is processed
- **THEN** chat shows "✅ Logged 250ml of water"
