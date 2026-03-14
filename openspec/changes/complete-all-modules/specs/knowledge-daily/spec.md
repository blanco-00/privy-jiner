# Spec: Knowledge Daily

## ADDED Requirements

### Requirement: Daily knowledge push
The system SHALL provide daily knowledge content to users.

#### Scenario: Add knowledge item
- **WHEN** user adds a knowledge item
- **THEN** system stores title, content, category, source
- **AND** system stores created timestamp

#### Scenario: Query knowledge items
- **WHEN** user queries knowledge items
- **THEN** system returns items sorted by date
- **AND** system filters by category if specified

#### Scenario: Get random knowledge
- **WHEN** user requests random knowledge
- **THEN** system returns random knowledge item
- **AND** system supports filtering by category

#### Scenario: Delete knowledge item
- **WHEN** user deletes a knowledge item
- **THEN** system removes item from database

#### Scenario: Search knowledge
- **WHEN** user searches knowledge
- **THEN** system returns matching items
- **AND** search matches title and content

## ADDED Requirements

### Requirement: Knowledge categories
The system SHALL support knowledge categorization.

#### Scenario: List categories
- **WHEN** user requests knowledge categories
- **THEN** system returns categories: 历史, 科学, 生活, 健康, 其他
