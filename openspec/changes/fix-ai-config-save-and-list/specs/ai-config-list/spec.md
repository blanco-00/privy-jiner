# ai-config-list Specification

## Purpose
Display saved AI model configurations list in the UI and allow users to manage them.

## ADDED Requirements

### Requirement: Saved configurations list
The system SHALL display a list of saved AI configurations below the configuration form.

#### Scenario: View saved configurations
- **WHEN** user visits AI config page
- **THEN** system displays list of saved configurations (if any)
- **AND** shows provider, model name, and masked API key for each

#### Scenario: Select saved configuration
- **WHEN** user clicks on a saved configuration
- **THEN** system loads that configuration into the form
- **AND** user can edit and save as new or update existing

#### Scenario: Delete saved configuration
- **WHEN** user clicks delete on a saved configuration
- **THEN** system shows confirmation dialog
- **AND** removes configuration from database after confirmation

#### Scenario: Save as new configuration
- **WHEN** user clicks "Save as New" button
- **THEN** system creates a new saved configuration
- **AND** preserves the current configuration as separate entry
