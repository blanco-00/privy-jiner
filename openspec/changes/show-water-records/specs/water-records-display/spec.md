## ADDED Requirements

### Requirement: Water records page displays today's water intake
The water records page SHALL display today's total water intake in milliliters, along with a progress indicator showing the percentage toward the daily goal.

#### Scenario: Display today's water total
- **WHEN** user navigates to the water records page
- **THEN** system SHALL display today's total water intake (e.g., "500ml")
- **AND** system SHALL display the daily goal (e.g., "2000ml")
- **AND** system SHALL display progress as a percentage and visual progress bar

#### Scenario: No water logged today
- **WHEN** user navigates to the water records page with no water logged today
- **THEN** system SHALL display "0ml" as today's total
- **AND** system SHALL display progress as 0%

### Requirement: Water records page displays historical water logs
The water records page SHALL display a list of historical water intake records, sorted by date (most recent first).

#### Scenario: Display water log list
- **WHEN** user navigates to the water records page
- **THEN** system SHALL display a list of water records with date, amount, and time
- **AND** records SHALL be grouped by date
- **AND** records SHALL be sorted in descending order (newest first)

#### Scenario: No historical records
- **WHEN** user navigates to the water records page with no historical records
- **THEN** system SHALL display an empty state message (e.g., "No records yet")

### Requirement: User can manually add water intake
The water records page SHALL allow users to manually add water intake records.

#### Scenario: Add water record via input
- **WHEN** user enters an amount in the input field and clicks "Add" button
- **THEN** system SHALL send the amount to the API to log the water intake
- **AND** system SHALL display a success message
- **AND** system SHALL refresh the today's total and record list

#### Scenario: Add water with quick buttons
- **WHEN** user clicks a quick add button (e.g., +250ml, +500ml)
- **THEN** system SHALL immediately log that amount
- **AND** system SHALL update the displayed totals

### Requirement: User can set daily water goal
The water records page SHALL allow users to set their daily water intake goal.

#### Scenario: Set daily goal
- **WHEN** user enters a new goal amount and saves
- **THEN** system SHALL store the goal locally
- **AND** system SHALL update the progress calculation

### Requirement: Page includes logging for debugging
The water records page SHALL include console.log statements with prefix `[WaterPage]` to aid in debugging.

#### Scenario: Log page initialization
- **WHEN** water page component mounts
- **THEN** system SHALL log "[WaterPage] Component mounted" to console

#### Scenario: Log API calls
- **WHEN** making API calls to fetch or submit water data
- **THEN** system SHALL log "[WaterPage] Fetching water data..." and "[WaterPage] Water data received"
- **AND** system SHALL log any errors with "[WaterPage] Error:" prefix
