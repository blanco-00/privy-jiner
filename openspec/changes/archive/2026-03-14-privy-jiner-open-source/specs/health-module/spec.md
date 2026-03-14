# Spec: Health Module

## ADDED Requirements

### Requirement: Water intake tracking
The system SHALL allow users to track daily water intake with timestamp and quantity.

#### Scenario: Log water intake
- **WHEN** user logs water intake
- **THEN** system records date, time, and amount in milliliters
- **AND** system generates unique log entry ID
- **AND** system updates daily total

#### Scenario: Query daily water intake
- **WHEN** user queries water intake for a date
- **THEN** system returns all water logs for that date
- **AND** system calculates daily total in milliliters
- **AND** system calculates percentage of daily goal

#### Scenario: Generate water intake report
- **WHEN** user requests weekly water intake report
- **THEN** system aggregates water intake by day
- **AND** system calculates weekly average
- **AND** system identifies days below target

---

### Requirement: Exercise tracking
The system SHALL allow users to track exercise activities with type, duration, and notes.

#### Scenario: Log exercise
- **WHEN** user logs an exercise activity
- **THEN** system records exercise type (e.g., 提肛, 腹式呼吸)
- **AND** system records duration or count
- **AND** system records completion status
- **AND** system stores optional notes

#### Scenario: Query exercise history
- **WHEN** user queries exercise history
- **THEN** system returns exercises sorted by date descending
- **AND** system filters by exercise type if specified
- **AND** system calculates total duration per type

#### Scenario: Mark exercise as incomplete
- **WHEN** user marks exercise as incomplete
- **THEN** system updates completion status to false
- **AND** system records reason if provided
- **AND** system updates last modified timestamp

---

### Requirement: Health reminders
The system SHALL provide reminders for health activities based on user-defined schedules.

#### Scenario: Schedule water reminder
- **WHEN** user schedules water reminder at specific times
- **THEN** system stores reminder schedule
- **AND** system triggers reminder at scheduled times
- **AND** system sends reminder via configured channel

#### Scenario: Schedule exercise reminder
- **WHEN** user schedules exercise reminder
- **THEN** system stores reminder schedule
- **AND** system triggers reminder at scheduled times
- **AND** system includes exercise type in reminder

#### Scenario: Customize reminder message
- **WHEN** user customizes reminder message
- **THEN** system uses custom message in notification
- **AND** system maintains default message if no custom message

---

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

---

### Requirement: SQLite database storage
The health module SHALL store all health data in SQLite database.

#### Scenario: Initialize database schema
- **WHEN** health module initializes
- **THEN** system creates water_logs table
- **AND** system creates exercise_logs table
- **AND** system creates health_goals table
- **AND** system creates health_reminders table

#### Scenario: Handle database errors
- **WHEN** database operation fails
- **THEN** system logs error with full details
- **AND** system returns user-friendly error message
- **AND** system maintains data integrity (no partial updates)
