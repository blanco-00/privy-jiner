# notice-center Specification

## Purpose
TBD - created by archiving change copy-vue-pure-admin-layout. Update Purpose after archive.
## Requirements
### Requirement: Notice center displays notifications
The notice center SHALL display a bell icon with notification count badge.

#### Scenario: Notice icon shows unread count
- **WHEN** there are unread notifications
- **THEN** badge shows number of unread notifications

#### Scenario: User clicks notice icon
- **WHEN** user clicks notice bell icon
- **THEN** dropdown shows list of notifications

#### Scenario: Notice list is scrollable
- **WHEN** there are many notifications
- **THEN** list is scrollable with max-height

### Requirement: Notice center shows notification types
The notice center SHALL distinguish between different notification types.

#### Scenario: Different notification types displayed
- **WHEN** notifications are of different types (info, success, warning, error)
- **THEN** each shows appropriate icon and color

