# Spec: AI Configuration

## ADDED Requirements

### Requirement: AI model configuration
The system SHALL allow users to configure AI models for chat.

#### Scenario: Save API configuration
- **WHEN** user saves AI configuration
- **THEN** system stores provider (openai/anthropic), api_key, model
- **AND** system encrypts api_key for storage

#### Scenario: Get configuration
- **WHEN** user requests AI configuration
- **THEN** system returns provider and model (without api_key)

#### Scenario: Test connection
- **WHEN** user tests AI connection
- **THEN** system makes test API call
- **AND** system returns success/failure

## ADDED Requirements

### Requirement: AI Chat interface
The system SHALL provide chat interface for natural language interaction.

#### Scenario: Send message
- **WHEN** user sends message to AI
- **THEN** system sends message to configured AI
- **AND** system returns AI response

#### Scenario: Execute command
- **WHEN** user requests system operation
- **THEN** system parses intent
- **AND** system executes operation (create schedule, add expense, etc.)
- **AND** system confirms completion

#### Scenario: Get chat history
- **WHEN** user requests chat history
- **THEN** system returns conversation history
- **AND** system supports clearing history
