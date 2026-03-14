# contacts-management Specification

## Purpose
TBD - created by archiving change personal-schedule-management. Update Purpose after archive.
## Requirements
### Requirement: Contact groups
The system SHALL support contact grouping.

#### Scenario: Create group
- **WHEN** user creates a contact group
- **THEN** system stores group name and color

#### Scenario: Get upcoming birthdays
- **WHEN** user requests upcoming birthdays
- **THEN** system returns contacts with birthdays in next 30 days
- **AND** system calculates days until birthday

