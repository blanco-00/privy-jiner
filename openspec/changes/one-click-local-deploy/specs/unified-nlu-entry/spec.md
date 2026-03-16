## ADDED Requirements

### Requirement: Jiner frontend chat calls NLU API for intent parsing
The Jiner frontend chat page SHALL call `/api/ai/nlu` instead of `/api/ai/chat` to enable structured data saving.

#### Scenario: Jiner frontend logs water via chat
- **WHEN** user types "我喝了500ml水" in Jiner frontend chat
- **THEN** frontend calls `/api/ai/nlu` with `{ message: "我喝了500ml水" }`
- **AND** backend parses intent and calls `healthService.logWater(500, date)`
- **AND** returns `{ success: true, message: "Logged 500ml of water!" }`

#### Scenario: Same message in Jiner frontend and OpenClaw produces identical result
- **GIVEN** user says "我跑了30分钟" in Jiner frontend chat
- **AND** user says "我跑了30分钟" in OpenClaw
- **WHEN** both requests complete
- **THEN** both save the same exercise record to database
- **AND** both return the same success message

### Requirement: Frontend handles NLU response gracefully
The frontend SHALL display the structured response from NLU API properly.

#### Scenario: NLU success response displayed
- **WHEN** NLU returns `{ success: true, message: "Logged 500ml of water!" }`
- **THEN** frontend displays the message to user
- **AND** shows confirmation of data saved

#### Scenario: NLU failure response displayed
- **WHEN** NLU returns `{ success: false, message: "Could not understand" }`
- **THEN** frontend displays friendly error message
- **AND** suggests user to be more specific

### Requirement: Both chat endpoints coexist
The system SHALL maintain both `/api/ai/chat` (for pure AI conversation) and `/api/ai/nlu` (for intent parsing).

#### Scenario: Pure conversation without data saving
- **WHEN** user sends general conversation message
- **AND** message doesn't match any known intent keywords
- **THEN** NLU returns `{ success: false }`
- **AND** frontend handles gracefully (treats as normal chat)

#### Endpoint distinction
- **GIVEN** user wants to just chat with AI
- **WHEN** they use the dedicated AI chat mode
- **THEN** they call `/api/ai/chat` which doesn't parse intents

### Requirement: Unified logging for debugging
Both entry points SHALL log consistently for troubleshooting.

#### Request logging
- **WHEN** NLU endpoint receives request (from any source)
- **THEN** logs `[AI /nlu] Received message: "..."`
- **AND** logs source: "from frontend" or "from OpenClaw" (via request headers or body context)

#### Response logging
- **WHEN** NLU request completes
- **THEN** logs `[AI /nlu] Intent parsed: tool=health_log_water, confidence=0.95`
- **AND** logs `[AI /nlu] Data saved successfully`
