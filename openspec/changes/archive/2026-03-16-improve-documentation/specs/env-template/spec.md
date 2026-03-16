## ADDED Requirements

### Requirement: .env.example file exists in project root
The project SHALL include a .env.example file that users can copy to create their configuration.

#### Scenario: User creates config from template
- **WHEN** user copies .env.example to .env
- **THEN** jiner can start with default SQLite database using the configuration

### Requirement: .env.example contains minimal required fields
The .env.example SHALL contain only the minimum required fields for basic operation.

#### Scenario: Minimal configuration
- **WHEN** user configures only OPENAI_API_KEY in .env
- **THEN** jiner SHALL use default values for all other settings
- **AND** jiner SHALL log a warning about missing optional configuration

### Requirement: .env.example documents all supported variables
The .env.example SHALL include comments explaining each configuration variable.

#### Scenario: Configuration discovery
- **WHEN** user reads .env.example
- **THEN** each configuration variable has an adjacent comment explaining its purpose
- **AND** sensitive variables like API keys are marked with security notes
