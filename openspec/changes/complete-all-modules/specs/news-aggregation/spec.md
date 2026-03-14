# Spec: News Aggregation

## ADDED Requirements

### Requirement: News management
The system SHALL allow users to manage news articles locally.

#### Scenario: Add news article
- **WHEN** user adds a news article
- **THEN** system stores title, content, category, source, url
- **AND** system stores published date
- **AND** system stores is_read status

#### Scenario: Query news articles
- **WHEN** user queries news articles
- **THEN** system returns articles sorted by date
- **AND** system filters by category if specified
- **AND** system supports pagination

#### Scenario: Mark article as read
- **WHEN** user marks article as read
- **THEN** system updates is_read status to true

#### Scenario: Delete article
- **WHEN** user deletes a news article
- **THEN** system removes article from database

#### Scenario: Search news
- **WHEN** user searches news
- **THEN** system returns matching articles
- **AND** search matches title and content

## ADDED Requirements

### Requirement: News categories
The system SHALL support news categorization.

#### Scenario: List categories
- **WHEN** user requests news categories
- **THEN** system returns categories: 科技, 财经, 体育, 娱乐, 国际, 其他
