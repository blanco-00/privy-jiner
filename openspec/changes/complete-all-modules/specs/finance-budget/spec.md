# Spec: Finance Budget

## ADDED Requirements

### Requirement: Budget management
The system SHALL allow users to set budgets by category and month, and track spending against budgets.

#### Scenario: Create budget
- **WHEN** user creates a budget for a category and month
- **THEN** system stores budget amount
- **AND** system initializes spent amount to zero
- **AND** system ensures budget is unique for category-month combination

#### Scenario: Update spent amount automatically
- **WHEN** user records an expense
- **THEN** system increments spent amount for matching budget
- **AND** system updates budget last modified timestamp

#### Scenario: Check budget status
- **WHEN** user checks budget status
- **THEN** system returns budget amount, spent amount, and remaining amount
- **AND** system calculates percentage spent
- **AND** system highlights overspent budgets

#### Scenario: Update budget
- **WHEN** user updates an existing budget
- **THEN** system updates budget amount
- **AND** system recalculates remaining amount
- **AND** system updates last modified timestamp

#### Scenario: Delete budget
- **WHEN** user deletes a budget
- **THEN** system removes budget from database
- **AND** system does not affect existing transactions
