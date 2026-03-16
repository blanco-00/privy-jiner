## MODIFIED Requirements

### Requirement: Dashboard overview shows real data
The dashboard overview shall fetch and display real data from APIs.

#### Scenario: Water intake displays correctly
- **WHEN** user visits dashboard
- **THEN** water intake shows actual value from /api/health/water/today

#### Scenario: Finance summary displays
- **WHEN** user visits dashboard  
- **THEN** expense shows real data from /api/finance/summary

### REMOVED Requirements

### Requirement: Dashboard shortcuts page
**Reason**: Duplicate functionality - overview already has shortcuts
**Migration**: Use dashboard overview instead
