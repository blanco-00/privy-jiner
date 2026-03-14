# Spec: Health Goals

## ADDED Requirements

### Requirement: Health goals
The system SHALL allow users to set health goals and track progress against them.

#### Scenario: Set daily water goal
- **WHEN** user sets daily water intake goal
- **THEN** system stores goal in milliliters
- **AND** system uses goal for progress calculations
- **AND** system highlights days meeting goal

#### Scenario: Set weekly exercise goal
- **WHEN** user sets weekly exercise goal
- **THEN** system stores goal in minutes or sessions
- **AND** system tracks progress against goal
- **AND** system shows remaining target

#### Scenario: Update health goal
- **WHEN** user updates an existing health goal
- **THEN** system updates goal value
- **AND** system recalculates progress
- **AND** system maintains goal change history

#### Scenario: Get goal progress
- **WHEN** user checks goal progress
- **THEN** system returns current progress percentage
- **AND** system compares to goal target
- **AND** system shows streak days if applicable

#### Scenario: Delete goal
- **WHEN** user deletes a health goal
- **THEN** system removes goal from database
- **AND** historical progress data is preserved
