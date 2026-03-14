# Spec: Profile Management

## ADDED Requirements

### Requirement: User profile
The system SHALL allow users to manage their personal profile information.

#### Scenario: Create profile
- **WHEN** user creates their profile
- **THEN** system stores name, birthday, height, weight, blood_type
- **AND** system stores allergy info and medical history

#### Scenario: Update profile
- **WHEN** user updates profile information
- **THEN** system updates all changed fields
- **AND** system updates last modified timestamp

#### Scenario: Get profile
- **WHEN** user requests their profile
- **THEN** system returns all profile fields
- **AND** system calculates age from birthday

## ADDED Requirements

### Requirement: Health metrics
The system SHALL track health metrics over time.

#### Scenario: Add health metric
- **WHEN** user adds health metric (weight, blood pressure)
- **THEN** system stores metric type, value, date
- **AND** system generates metric ID

#### Scenario: Get health history
- **WHEN** user requests health metrics history
- **THEN** system returns metrics sorted by date
- **AND** system filters by metric type if specified
