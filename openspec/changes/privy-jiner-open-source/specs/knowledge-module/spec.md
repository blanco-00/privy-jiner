# Spec: Knowledge Module

## ADDED Requirements

### Requirement: Knowledge base management
The system SHALL allow users to maintain a knowledge base with categorized content.

#### Scenario: Add knowledge entry
- **WHEN** user adds a knowledge entry
- **THEN** system stores knowledge title and content
- **AND** system categorizes knowledge (性爱/心理/历史/科技)
- **AND** system stores creation timestamp
- **AND** system assigns unique knowledge ID

#### Scenario: Update knowledge entry
- **WHEN** user updates a knowledge entry
- **THEN** system updates content or metadata
- **AND** system updates last modified timestamp
- **AND** system maintains version history (optional)

#### Scenario: Query knowledge by category
- **WHEN** user queries knowledge by category
- **THEN** system returns all entries in specified category
- **AND** system sorts entries by creation date
- **AND** system excludes archived entries

---

### Requirement: Daily knowledge push
The system SHALL provide scheduled knowledge pushes to users.

#### Scenario: Schedule daily push
- **WHEN** user schedules daily knowledge push
- **THEN** system stores push schedule (time, frequency)
- **AND** system associates push with categories
- **AND** system enables scheduled pushes

#### Scenario: Trigger knowledge push
- **WHEN** system triggers scheduled knowledge push (triggered externally)
- **THEN** system selects knowledge entry based on schedule
- **AND** system formats content for delivery
- **AND** system sends via configured channel

#### Scenario: Customize push content
- **WHEN** user customizes push content
- **THEN** system uses custom content in push
- **AND** system maintains fallback to default content

---

### Requirement: Knowledge categories
The system SHALL support predefined knowledge categories.

#### Scenario: Initialize knowledge categories
- **WHEN** system initializes
- **THEN** system creates default categories: 性爱, 心理, 历史, 科技
- **AND** system allows adding custom categories
- **AND** system allows renaming categories

#### Scenario: Categorize knowledge entry
- **WHEN** user categorizes knowledge entry
- **THEN** system associates entry with one or more categories
- **AND** system updates category metadata
- **AND** system validates category exists

#### Scenario: Query by multiple categories
- **WHEN** user queries knowledge by multiple categories
- **THEN** system returns entries matching any specified category
- **AND** system groups results by category
- **AND** system excludes duplicate entries

---

### Requirement: Knowledge history
The system SHALL maintain history of pushed knowledge.

#### Scenario: Log push history
- **WHEN** system pushes knowledge to user
- **THEN** system records push timestamp
- **AND** system records knowledge ID
- **AND** system records delivery channel
- **AND** system records user interaction (read, liked, etc.)

#### Scenario: Query push history
- **WHEN** user queries push history
- **THEN** system returns all past pushes
- **AND** system filters by date range if specified
- **AND** system includes user interaction data

---

### Requirement: SQLite database storage
The knowledge module SHALL store all knowledge data in SQLite database.

#### Scenario: Initialize database schema
- **WHEN** knowledge module initializes
- **THEN** system creates knowledge_base table
- **AND** system creates knowledge_categories table
- **AND** system creates push_history table
- **AND** system creates push_schedule table

#### Scenario: Handle database errors
- **WHEN** database operation fails
- **THEN** system logs error with full details
- **AND** system returns user-friendly error message
- **AND** system maintains data integrity (no partial updates)
