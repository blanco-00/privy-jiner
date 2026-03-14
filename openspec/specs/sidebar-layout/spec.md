# sidebar-layout Specification

## Purpose
TBD - created by archiving change copy-vue-pure-admin-layout. Update Purpose after archive.
## Requirements
### Requirement: Sidebar displays navigation menu
The sidebar SHALL display a vertical navigation menu with collapsible sections and active state highlighting.

#### Scenario: Sidebar shows menu items
- **WHEN** user loads the dashboard
- **THEN** sidebar displays all navigation items grouped by category

#### Scenario: Sidebar collapses to icon-only mode
- **WHEN** user clicks collapse button
- **THEN** sidebar shrinks to 64px width showing only icons
- **AND** tooltips appear on hover showing menu labels

#### Scenario: Active menu item is highlighted
- **WHEN** user navigates to a page
- **THEN** the corresponding menu item is highlighted with accent color
- **AND** left border shows accent color

### Requirement: Sidebar logo displays correctly
The sidebar SHALL display a logo at the top that collapses gracefully.

#### Scenario: Logo visible in expanded mode
- **WHEN** sidebar is expanded
- **THEN** logo image and text "Privy-Jiner" are visible

#### Scenario: Logo hidden in collapsed mode
- **WHEN** sidebar is collapsed
- **THEN** logo is hidden, only collapse/expand button visible

