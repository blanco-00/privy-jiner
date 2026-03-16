## ADDED Requirements

### Requirement: Water logging via NL creates database record
The health module shall create water log records when triggered via NL.

#### Scenario: NL triggers water logging
- **WHEN** NL request "I drank 3 glasses" is processed
- **THEN** database contains health_water_logs entry with amount >= 3

### Requirement: Exercise logging via NL creates database record
The health module shall create exercise records when triggered via NL.

#### Scenario: NL triggers exercise logging
- **WHEN** NL request "I ran for 30 minutes" is processed
- **THEN** database contains health_exercise_logs entry

### Requirement: Error when required params missing
The system shall return error when NL parsing misses required parameters.

#### Scenario: Missing amount for water logging
- **WHEN** NL request "I drank water" (no amount) is processed
- **THEN** returns error about missing required parameter: amount
