# Spec: Fashion Outfit

## ADDED Requirements

### Requirement: Outfit logging
The system SHALL allow users to log daily outfits with selected clothing items.

#### Scenario: Log daily outfit
- **WHEN** user logs a daily outfit
- **THEN** system stores date and selected items
- **AND** system stores occasion (casual/work/special)
- **AND** system stores weather (optional)

#### Scenario: Query outfit history
- **WHEN** user queries outfit history
- **THEN** system returns outfits sorted by date descending
- **AND** system filters by date range if specified
- **AND** system includes item details

#### Scenario: Get outfit statistics
- **WHEN** user requests outfit statistics
- **THEN** system returns most worn items
- **AND** system returns outfits per occasion
- **AND** system returns weekly rotation summary

#### Scenario: Delete outfit
- **WHEN** user deletes an outfit log
- **THEN** system removes outfit from database

## ADDED Requirements

### Requirement: Outfit recommendations
The system SHALL provide basic outfit recommendations based on wardrobe.

#### Scenario: Get random outfit suggestion
- **WHEN** user requests outfit suggestion
- **THEN** system selects random items from wardrobe
- **AND** system returns outfit combination
