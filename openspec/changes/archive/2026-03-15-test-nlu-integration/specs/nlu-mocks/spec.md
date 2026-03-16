## ADDED Requirements

### Requirement: Mock AI client returns predefined responses
The mock client shall return configurable responses for testing.

#### Scenario: Mock returns water intent
- **WHEN** mock is configured with water intent response
- **THEN** chat() returns parsed intent for health_log_water

#### Scenario: Mock returns error for invalid request
- **WHEN** mock receives unknown request
- **THEN** returns null tool with confidence 0

### Requirement: Mock is deterministic
The mock shall return the same response for the same input.

#### Scenario: Same input returns same output
- **WHEN** mock receives "I drank water" twice
- **THEN** both calls return identical tool and args
