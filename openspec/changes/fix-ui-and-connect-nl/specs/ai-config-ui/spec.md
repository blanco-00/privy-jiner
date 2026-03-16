## ADDED Requirements

### Requirement: AI provider configuration form
The system shall provide a UI for configuring AI provider credentials.

#### Scenario: User configures OpenAI
- **WHEN** user enters OpenAI API key and clicks save
- **THEN** credentials are stored and can be used for API calls

#### Scenario: User fetches available models
- **WHEN** user clicks "Fetch Models" with valid API key
- **THEN** dropdown shows list of available models

#### Scenario: Test connection
- **WHEN** user clicks "Test Connection"
- **THEN** system returns success/failure message
