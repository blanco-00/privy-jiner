# Spec: Finance Bills

## ADDED Requirements

### Requirement: Recurring bill management
The system SHALL allow users to manage recurring bills with automatic due date reminders.

#### Scenario: Create recurring bill
- **WHEN** user creates a recurring bill
- **THEN** system stores bill name, category, amount, and due day (1-28)
- **AND** system calculates next due date automatically
- **AND** system stores payment method (optional)

#### Scenario: Generate due date reminders
- **WHEN** system checks for due bills (triggered externally)
- **THEN** system identifies bills due within 7 days
- **AND** system returns reminder notification data
- **AND** system includes bill name, amount, and due date

#### Scenario: Mark bill as paid
- **WHEN** user marks a bill as paid
- **THEN** system records payment date
- **AND** system updates next due date to following month
- **AND** system stores payment transaction

#### Scenario: Update bill
- **WHEN** user updates bill details
- **THEN** system updates bill information
- **AND** system recalculates next due date if due day changed

#### Scenario: Delete bill
- **WHEN** user deletes a recurring bill
- **THEN** system removes bill from database
- **AND** historical payment records are preserved

#### Scenario: Query upcoming bills
- **WHEN** user queries upcoming bills
- **THEN** system returns bills due in next 30 days
- **AND** system calculates total amount due
