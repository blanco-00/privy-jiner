# Spec: Health Reminders

## ADDED Requirements

### Requirement: Health reminders
The system SHALL provide reminders for health activities based on user-defined schedules.

#### Scenario: Schedule water reminder
- **WHEN** user schedules water reminder at specific times
- **THEN** system stores reminder schedule
- **AND** system triggers reminder at scheduled times
- **AND** system returns reminder data for display

#### Scenario: Schedule exercise reminder
- **WHEN** user schedules exercise reminder
- **THEN** system stores reminder schedule
- **AND** system triggers reminder at scheduled time
- **AND** system includes exercise type in reminder

#### Scenario: Customize reminder message
- **WHEN** user customizes reminder message
- **THEN** system uses custom message in notification
- **AND** system maintains default message if no custom message set

#### Scenario: Enable/disable reminder
- **WHEN** user toggles reminder on/off
- **THEN** system updates reminder status
- **AND** system does not delete reminder data

#### Scenario: Delete reminder
- **WHEN** user deletes a reminder
- **THEN** system removes reminder from database

#### Scenario: Get active reminders
- **WHEN** user queries active reminders
- **THEN** system returns all enabled reminders
- **AND** system includes next trigger time
