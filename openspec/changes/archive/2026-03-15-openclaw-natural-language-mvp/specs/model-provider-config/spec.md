## ADDED Requirements

### Requirement: Configure AI provider credentials
The system MUST allow configuration of AI provider API credentials (API key, base URL).

#### Scenario: Save OpenAI API key
- **WHEN** user provides OpenAI API key via config
- **THEN** credential is stored securely and can be used for API calls

#### Scenario: Save Claude API key
- **WHEN** user provides Claude API key via config
- **THEN** credential is stored securely and can be used for API calls

### Requirement: Fetch available models from provider
The system MUST fetch the list of available models from the configured AI provider.

#### Scenario: Fetch OpenAI models
- **WHEN** OpenAI provider is configured with valid API key
- **THEN** system calls OpenAI /models endpoint and returns model list

#### Scenario: Handle provider API failure
- **WHEN** provider API is unreachable or returns error
- **THEN** system returns cached model list or empty list with error message

### Requirement: Select active model for NLU
The system MUST allow selecting which model to use for NLU intent parsing.

#### Scenario: Set active model
- **WHEN** user selects a model from available list
- **THEN** selected model is marked as active for NLU processing

#### Scenario: Default to first available model
- **WHEN** no model is explicitly selected
- **THEN** system uses the first available model from the provider

### Requirement: Support multiple providers
The system MUST support configuring multiple AI providers (OpenAI, Claude, etc.).

#### Scenario: Switch between providers
- **WHEN** user configures multiple providers
- **THEN** user can switch active provider in settings

### Requirement: Test provider connection
The system MUST provide a way to test if provider credentials are valid.

#### Scenario: Successful connection test
- **WHEN** user clicks "Test Connection" with valid credentials
- **THEN** system returns success message

#### Scenario: Failed connection test
- **WHEN** user clicks "Test Connection" with invalid credentials
- **THEN** system returns error message indicating auth failure
