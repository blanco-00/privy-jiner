# profile-management Specification

## Purpose
TBD - created by archiving change personal-schedule-management. Update Purpose after archive.
## Requirements
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

