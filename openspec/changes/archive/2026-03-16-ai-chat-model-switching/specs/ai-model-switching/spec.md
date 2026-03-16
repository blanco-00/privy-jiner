## ADDED Requirements

### Requirement: User can view list of configured AI models in chat
The system SHALL display a dropdown selector in the chat header showing all AI models that the user has configured and enabled.

#### Scenario: User has configured models
- **WHEN** the user navigates to the AI chat page
- **THEN** the model selector dropdown SHALL display all enabled models from their configuration
- **AND** each option SHALL show the model name and provider

#### Scenario: User has no configured models
- **WHEN** the user navigates to the AI chat page with no configured models
- **THEN** the model selector SHALL display a disabled state
- **AND** show a link or button to navigate to the model configuration page

### Requirement: User can switch between AI models in chat
The system SHALL allow the user to select a different AI model from the dropdown, and subsequent messages SHALL use the selected model.

#### Scenario: User selects a different model
- **WHEN** the user clicks the model selector and chooses a different model
- **THEN** the selector SHALL update to show the newly selected model
- **AND** subsequent messages sent by the user SHALL be processed by the newly selected model

#### Scenario: Model switch during active conversation
- **WHEN** the user switches models while having existing conversation history
- **THEN** the system SHALL preserve the existing message history
- **AND** the new model SHALL receive the conversation context for continued dialogue

### Requirement: Selected model persists per conversation
The system SHALL remember the selected model for each conversation and restore it when the user returns to that conversation.

#### Scenario: Returning to a conversation
- **WHEN** the user returns to a previously created conversation
- **THEN** the system SHALL restore the model that was active when the conversation was last active

#### Scenario: New conversation
- **WHEN** the user creates a new conversation
- **THEN** the system SHALL use the default model (first enabled model or system default)

### Requirement: Model information displays on assistant messages
The system SHALL show which model generated each assistant response by displaying a small badge next to or below the message.

#### Scenario: Assistant message displays model badge
- **WHEN** the assistant sends a message in response to the user
- **THEN** the message SHALL include a visible indicator showing which model generated the response
- **AND** the badge SHALL be subtle and non-intrusive

### Requirement: Backend API provides user's configured models
The system SHALL provide a REST API endpoint that returns the list of models configured by the user.

#### Scenario: API returns model list
- **WHEN** an authenticated user calls GET /api/ai/models
- **THEN** the API SHALL return a JSON array of configured models
- **AND** each model SHALL include id, provider, name, and enabled status

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated user calls GET /api/ai/models
- **THEN** the API SHALL return a 401 Unauthorized response
