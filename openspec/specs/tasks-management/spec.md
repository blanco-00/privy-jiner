# tasks-management Specification

## Purpose
TBD - created by archiving change personal-schedule-management. Update Purpose after archive.
## Requirements
### Requirement: Task categories
The system SHALL support task categorization.

#### Scenario: Categorize task
- **WHEN** user assigns category to task
- **THEN** system stores category (work/personal/study/health/other)

#### Scenario: Get overdue tasks
- **WHEN** user requests overdue tasks
- **THEN** system returns tasks with past due_date and not completed

