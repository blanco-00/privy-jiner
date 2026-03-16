# Intent Routing Specification

## ADDED Requirements

### Requirement: Gateway SHALL support automatic intent routing
The Openclaw Gateway SHALL route user messages to appropriate plugins based on intent recognition, without requiring explicit tool invocation.

#### Scenario: Health intent detected
- **WHEN** user sends message "我喝了30ml水"
- **THEN** Gateway identifies intent as "health_log_water" with confidence >= 0.7
- **THEN** Gateway automatically calls jiner health_log_water tool with parsed entities

#### Scenario: Finance intent detected
- **WHEN** user sends message "今天花了50块买咖啡"
- **THEN** Gateway identifies intent as "finance_log_expense" with confidence >= 0.7
- **THEN** Gateway automatically calls jiner finance_log_expense tool

#### Scenario: Low confidence intent
- **WHEN** user sends ambiguous message
- **THEN** Gateway requests clarification from user
- **THEN** Gateway does NOT auto-route until intent confirmed

### Requirement: Intent routing SHALL support keyword matching
The system SHALL support configuration-based keyword matching for fast intent detection.

#### Scenario: Keyword match
- **WHEN** message contains configured keywords AND fallbackToNlu is false
- **THEN** route to matching capability immediately
- **THEN** skip NLU classification

#### Scenario: Keyword no match, NLU fallback
- **WHEN** message does NOT match any keywords AND fallbackToNlu is true
- **THEN** call NLU classification endpoint
- **THEN** route based on NLU result

### Requirement: Intent routing SHALL be configurable
The routing rules SHALL be configurable through openclaw.json.

#### Scenario: Custom keywords
- **WHEN** administrator configures custom keywords in openclaw.json
- **THEN** routing uses custom keywords for intent detection
- **THEN** existing default keywords still work

#### Scenario: Routing disabled
- **WHEN** routing config is disabled or removed
- **THEN** system falls back to explicit tool invocation mode
- **THEN** jiner_nlu tool works as before

### Requirement: Intent classification endpoint
The jiner plugin SHALL provide an intent classification endpoint.

#### Scenario: Classify health intent
- **WHEN** POST /api/ai/classify-intent with message "喝水200ml"
- **THEN** returns intent "health_log_water"
- **THEN** returns confidence >= 0.9
- **THEN** returns parsed entities {amount: 200, unit: "ml"}

#### Scenario: Classify finance intent
- **WHEN** POST /api/ai/classify-intent with message "工资入账10000"
- **THEN** returns intent "finance_log_income"
- **THEN** returns parsed entities {amount: 10000, type: "salary"}

#### Scenario: Unknown intent
- **WHEN** POST /api/ai/classify-intent with message "hello world"
- **THEN** returns intent "unknown"
- **THEN** returns confidence < nluThreshold

## MODIFIED Requirements

### Requirement: jiner_nlu tool (existing)
The existing jiner_nlu tool SHALL work in both explicit and automatic routing modes.

#### Scenario: Explicit invocation (backward compatible)
- **WHEN** user explicitly calls jiner_nlu tool
- **THEN** tool processes message and returns structured result
- **THEN** existing behavior unchanged

#### Scenario: Auto-routing invocation
- **WHEN** Gateway auto-routes intent to jiner
- **THEN** same processing as explicit invocation
- **THEN** result returned to user with context
