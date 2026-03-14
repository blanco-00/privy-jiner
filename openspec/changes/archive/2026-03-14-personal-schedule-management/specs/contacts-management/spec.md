# Spec: Contacts Management

## ADDED Requirements

### Requirement: Contact management
The system SHALL allow users to manage contacts.

#### Scenario: Add contact
- **WHEN** user adds a contact
- **THEN** system stores name, phone, email, birthday
- **AND** system stores group and tags
- **AND** system assigns unique contact ID

#### Scenario: Query contacts
- **WHEN** user queries contacts
- **THEN** system returns all contacts
- **AND** system filters by group if specified
- **AND** system supports search by name

#### Scenario: Update contact
- **WHEN** user updates contact information
- **THEN** system updates changed fields
- **AND** system updates last modified timestamp

#### Scenario: Delete contact
- **WHEN** user deletes a contact
- **THEN** system removes contact from database

## ADDED Requirements

### Requirement: Contact groups
The system SHALL support contact grouping.

#### Scenario: Create group
- **WHEN** user creates a contact group
- **THEN** system stores group name and color

#### Scenario: Get upcoming birthdays
- **WHEN** user requests upcoming birthdays
- **THEN** system returns contacts with birthdays in next 30 days
- **AND** system calculates days until birthday
