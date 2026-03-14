# Spec: Fashion Wardrobe

## ADDED Requirements

### Requirement: Wardrobe management
The system SHALL allow users to manage their wardrobe with clothing items categorized by type.

#### Scenario: Add clothing item
- **WHEN** user adds a clothing item
- **THEN** system stores item name, category, color, brand
- **AND** system stores purchase date and price (optional)
- **AND** system assigns unique item ID

#### Scenario: Query wardrobe by category
- **WHEN** user queries wardrobe filtered by category
- **THEN** system returns items in that category
- **AND** system includes item details

#### Scenario: Update clothing item
- **WHEN** user updates clothing item details
- **THEN** system updates item information
- **AND** system updates last modified timestamp

#### Scenario: Delete clothing item
- **WHEN** user deletes a clothing item
- **THEN** system removes item from wardrobe

#### Scenario: Get wardrobe summary
- **WHEN** user requests wardrobe summary
- **THEN** system returns total items count
- **AND** system returns item count per category

## ADDED Requirements

### Requirement: Clothing categories
The system SHALL support predefined clothing categories.

#### Scenario: List categories
- **WHEN** user requests clothing categories
- **THEN** system returns categories: 上衣, 裤子, 裙子, 鞋子, 配饰, 外套
