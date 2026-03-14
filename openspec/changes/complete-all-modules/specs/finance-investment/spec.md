# Spec: Finance Investment

## ADDED Requirements

### Requirement: Investment portfolio tracking
The system SHALL allow users to track investments with purchase details, current prices, and profit/loss calculations.

#### Scenario: Add investment
- **WHEN** user adds an investment
- **THEN** system stores investment name and type (stock/fund/insurance/gold/other)
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

#### Scenario: Delete investment
- **WHEN** user deletes an investment
- **THEN** system removes investment from portfolio
- **AND** historical records are preserved

#### Scenario: Query investments by type
- **WHEN** user queries investments filtered by type
- **THEN** system returns only investments of that type
- **AND** system calculates total value per type
