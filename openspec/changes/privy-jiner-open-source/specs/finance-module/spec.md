# Spec: Finance Module

## ADDED Requirements

### Requirement: Income and expense recording
The system SHALL allow users to record income and expense transactions with categories, amounts, and dates.

#### Scenario: Create income record
- **WHEN** user creates an income record
- **THEN** system stores transaction type as "income"
- **AND** system stores amount as positive value
- **AND** system stores category, date, and description
- **AND** system assigns unique transaction ID

#### Scenario: Create expense record
- **WHEN** user creates an expense record
- **THEN** system stores transaction type as "expense"
- **AND** system stores amount as positive value
- **AND** system stores category, date, and description
- **AND** system assigns unique transaction ID

#### Scenario: Query transactions by date range
- **WHEN** user queries transactions for a date range
- **THEN** system returns all transactions within the range
- **AND** system orders transactions by date descending
- **AND** system calculates total income and expense

---

### Requirement: Budget management
The system SHALL allow users to set budgets by category and month, and track spending against budgets.

#### Scenario: Create budget
- **WHEN** user creates a budget for a category and month
- **THEN** system stores budget amount
- **AND** system initializes spent amount to zero
- **AND** system ensures budget is unique for category-month combination

#### Scenario: Update spent amount
- **WHEN** user records an expense
- **THEN** system increments spent amount for matching budget
- **AND** system updates budget last modified timestamp

#### Scenario: Check budget status
- **WHEN** user checks budget status
- **THEN** system returns budget amount, spent amount, and remaining amount
- **AND** system calculates percentage spent
- **AND** system highlights overspent budgets

---

### Requirement: Investment portfolio tracking
The system SHALL allow users to track investments with purchase details, current prices, and profit/loss calculations.

#### Scenario: Add investment
- **WHEN** user adds an investment
- **THEN** system stores investment name and type (stock/fund/insurance/gold)
- **AND** system stores purchase date and price
- **AND** system stores quantity or shares

#### Scenario: Update current price
- **WHEN** user updates current price of investment
- **THEN** system updates current price and timestamp
- **AND** system calculates profit/loss automatically
- **AND** system calculates profit/loss percentage

#### Scenario: Query investment summary
- **WHEN** user queries investment summary
- **THEN** system returns total investment value
- **AND** system returns total profit/loss
- **AND** system returns best and worst performing investments

---

### Requirement: Recurring bill management
The system SHALL allow users to manage recurring bills with automatic due date reminders.

#### Scenario: Create recurring bill
- **WHEN** user creates a recurring bill
- **THEN** system stores bill name, category, amount, and due day
- **AND** system calculates next due date automatically
- **AND** system stores payment method

#### Scenario: Generate due date reminders
- **WHEN** system checks for due bills (triggered externally)
- **THEN** system identifies bills due within 7 days
- **AND** system sends reminder notification to user
- **AND** system includes bill name, amount, and due date

#### Scenario: Mark bill as paid
- **WHEN** user marks a bill as paid
- **THEN** system records payment date
- **AND** system updates next due date to following month
- **AND** system stores payment transaction

---

### Requirement: Financial reports
The system SHALL generate financial reports including monthly summaries and category breakdowns.

#### Scenario: Generate monthly summary
- **WHEN** user requests monthly summary
- **THEN** system calculates total income for the month
- **AND** system calculates total expenses for the month
- **AND** system calculates net savings
- **AND** system groups expenses by category

#### Scenario: Generate category breakdown
- **WHEN** user requests category breakdown
- **THEN** system calculates total spending per category
- **AND** system calculates percentage of total spending per category
- **AND** system compares to previous month spending

#### Scenario: Export report to CSV
- **WHEN** user exports financial report
- **THEN** system generates CSV file with all transactions
- **AND** system includes transaction details (date, category, amount, description)
- **AND** system downloads file to user device

---

### Requirement: SQLite database storage
The finance module SHALL store all financial data in SQLite database.

#### Scenario: Initialize database schema
- **WHEN** finance module initializes
- **THEN** system creates finance_records table
- **AND** system creates budgets table
- **AND** system creates investments table
- **AND** system creates recurring_bills table

#### Scenario: Handle database errors
- **WHEN** database operation fails
- **THEN** system logs error with full details
- **AND** system returns user-friendly error message
- **AND** system maintains data integrity (no partial updates)

---

### Requirement: Optional MySQL support
The finance module SHALL optionally support MySQL for users requiring complex transactions.

#### Scenario: Detect MySQL configuration
- **WHEN** system loads configuration with MySQL connection details
- **THEN** system initializes MySQL connection
- **AND** system uses MySQL for all finance operations

#### Scenario: Validate MySQL connection
- **WHEN** system attempts MySQL connection
- **THEN** system verifies database exists
- **AND** system verifies required tables exist
- **AND** system falls back to SQLite if MySQL is unavailable

---

### Requirement: Data privacy
The finance module SHALL ensure all financial data remains local and encrypted.

#### Scenario: Encrypt sensitive data
- **WHEN** storing financial transactions
- **THEN** system encrypts sensitive fields (optional, based on user configuration)
- **AND** system stores encryption key in local configuration
- **AND** system never uploads data to cloud

#### Scenario: Backup financial data
- **WHEN** system performs daily backup
- **THEN** system creates backup of finance database
- **AND** system stores backup in local backup directory
- **AND** system encrypts backup file
