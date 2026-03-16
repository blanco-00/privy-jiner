# ai-config-persistence-fix Specification

## Purpose
Fix the API key not being saved due to field name mismatch between frontend and backend.

## ADDED Requirements

### Requirement: API key persistence
The system SHALL correctly persist the API key when saving AI configuration.

#### Scenario: Save config with API key
- **WHEN** user fills in API key and clicks save
- **THEN** system sends request with correct field names to backend
- **AND** backend stores encrypted API key in database

#### Scenario: Load saved config
- **WHEN** user visits AI config page
- **THEN** system loads saved configuration from database
- **AND** displays masked API key (********) in the form

#### Scenario: Save fails due to missing required fields
- **WHEN** user clicks save without providing API key
- **THEN** system shows validation warning message
- **AND** save request is not sent
