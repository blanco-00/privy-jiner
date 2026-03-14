# Spec: Schedule Management

## ADDED Requirements

### Requirement: Schedule events
The system SHALL allow users to create and manage schedule events.

#### Scenario: Create schedule event
- **WHEN** user creates a schedule event
- **THEN** system stores title, description, start_time, end_time
- **AND** system stores location and event type
- **AND** system stores is_all_day flag

#### Scenario: Query schedules
- **WHEN** user queries schedules
- **THEN** system returns schedules within date range
- **AND** system supports daily/weekly/monthly view

#### Scenario: Update schedule
- **WHEN** user updates schedule
- **THEN** system updates changed fields
- **AND** system recalculates if recurring

#### Scenario: Delete schedule
- **WHEN** user deletes schedule
- **THEN** system removes schedule from database

## ADDED Requirements

### Requirement: Recurring events
The system SHALL support recurring schedule events.

#### Scenario: Create recurring event
- **WHEN** user creates recurring event
- **THEN** system stores repeat_type (daily/weekly/monthly/yearly)
- **AND** system stores repeat_until date
- **AND** system generates individual instances

## ADDED Requirements

### Requirement: Schedule reminders
The system SHALL support schedule reminders.

#### Scenario: Set reminder
- **WHEN** user sets reminder for schedule
- **THEN** system stores reminder time before event
- **AND** system triggers notification at reminder time
