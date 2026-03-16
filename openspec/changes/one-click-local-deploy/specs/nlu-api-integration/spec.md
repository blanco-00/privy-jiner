## ADDED Requirements

### Requirement: NLU API accepts natural language and returns structured result
The `/api/ai/nlu` endpoint SHALL parse natural language and invoke appropriate service.

#### Scenario: Water logging via natural language
- **WHEN** user sends "我喝了500ml水" to `/api/ai/nlu`
- **THEN** API calls AI to parse intent
- **AND** invokes `healthService.logWater(500, date)`
- **AND** returns `{ success: true, message: "Logged 500ml of water!", tool: "health_log_water" }`

#### Scenario: Exercise logging via natural language
- **WHEN** user sends "我跑了30分钟" to `/api/ai/nlu`
- **THEN** API parses activity "run" and duration 30
- **AND** invokes `healthService.logExercise({ type: "run", duration: 30, date })`
- **AND** returns success message

#### Scenario: Expense logging via natural language
- **WHEN** user sends "我花了100元买咖啡" to `/api/ai/nlu`
- **THEN** API parses amount 100 and category "coffee"
- **AND** invokes `financeService.createTransaction({ amount: 100, type: "expense", description: "coffee" })`
- **AND** returns success message

### Requirement: NLU API returns error when AI not configured
The endpoint SHALL return clear error when AI provider is not configured.

#### Scenario: AI not configured
- **WHEN** user calls `/api/ai/nlu` without configuring AI
- **THEN** API returns `{ error: "AI not configured. Please set up your AI provider first." }`
- **AND** status code 400

### Requirement: NLU API logs all requests for debugging
The endpoint SHALL log incoming requests and responses for troubleshooting.

#### Request logging
- **WHEN** NLU endpoint receives request
- **THEN** logs `[AI /nlu] Received message: "..."`
- **AND** logs `[AI /nlu] Calling AI API: provider_name`

#### Response logging
- **WHEN** NLU request completes
- **THEN** logs `[AI /nlu] Logging water: { amount: 500, date: "2026-03-16" }`
- **OR** logs `[AI /nlu] Logging exercise: { activity: "run", duration: 30 }`

### Requirement: OpenClaw plugin calls NLU API via HTTP Tool
The OpenClaw plugin SHALL be configured to use HTTP Tool instead of Exec.

#### Scenario: HTTP Tool configured
- **GIVEN** OpenClaw plugin configuration
- **WHEN** user triggers health-related message
- **THEN** OpenClaw makes HTTP POST to `http://localhost:3001/api/ai/nlu`
- **AND** passes `{ message: "user message" }` as body

#### Error handling
- **WHEN** Jiner API is unreachable (Jiner not running on port 3001)
- **THEN** OpenClaw receives error response
- **AND** logs "[Jiner Plugin] API error: connection refused"
