# tags-view Specification

## Purpose
TBD - created by archiving change copy-vue-pure-admin-layout. Update Purpose after archive.
## Requirements
### Requirement: Tags view shows open pages as tabs
The tags view SHALL display all open pages as scrollable tabs.

#### Scenario: New page adds tab
- **WHEN** user navigates to a new page
- **THEN** a new tab is added to the tags view
- **AND** active tab is highlighted

#### Scenario: Tab shows active page
- **WHEN** user is on a page
- **THEN** corresponding tab is visually highlighted as active

### Requirement: Tags view has scroll buttons
The tags view SHALL have left/right scroll buttons when tabs overflow.

#### Scenario: Scroll buttons appear when tabs overflow
- **WHEN** there are more tabs than can fit
- **THEN** left and right scroll buttons appear
- **AND** clicking scrolls the tab list

### Requirement: Tags view has context menu
Right-clicking a tab SHALL show a context menu with close options.

#### Scenario: Context menu shows on right-click
- **WHEN** user right-clicks on a tab
- **THEN** context menu appears with: Refresh, Close, Close Others, Close All

#### Scenario: Close current tab
- **WHEN** user clicks "Close" in context menu
- **THEN** tab is removed
- **AND** user navigates to previous tab if closing active tab

#### Scenario: Close other tabs
- **WHEN** user clicks "Close Others"
- **THEN** all tabs except current are closed
- **AND** current tab remains and is navigated to

