## ADDED Requirements

### Requirement: Unified Natural Language API
The Jiner system SHALL expose a single natural language processing endpoint that can handle all system capabilities (health, finance, fashion, knowledge, news) through conversational input.

#### Scenario: Health-related natural language request
- **WHEN** user sends a message related to health (e.g., "我喝了500ml水", "今天运动了30分钟")
- **THEN** the system SHALL parse the intent using NLU
- **AND** the system SHALL route to the appropriate health manager (HealthManager)
- **AND** the system SHALL execute the corresponding action
- **AND** the system SHALL return a conversational response

#### Scenario: Finance-related natural language request
- **WHEN** user sends a message related to finance (e.g., "今天花了100块买咖啡", "本月收入5000")
- **THEN** the system SHALL parse the intent using NLU
- **AND** the system SHALL route to the FinanceManager
- **AND** the system SHALL execute the corresponding action
- **AND** the system SHALL return a conversational response

#### Scenario: Fashion-related natural language request
- **WHEN** user sends a message related to fashion (e.g., "添加一件红色T恤", "今天穿了什么")
- **THEN** the system SHALL parse the intent using NLU
- **AND** the system SHALL route to the FashionManager
- **AND** the system SHALL execute the corresponding action

### Requirement: Tool Handler Delegation to Business Logic
All OpenClawPlugin tool handlers SHALL delegate to actual business logic instead of returning stub responses.

#### Scenario: health_log_water tool invocation
- **WHEN** the Gateway sends a request with action "health_log_water" and payload containing amount
- **THEN** the system SHALL call HealthManager.logWater() with the provided amount
- **AND** the system SHALL return the created WaterLog object

#### Scenario: health_log_exercise tool invocation  
- **WHEN** the Gateway sends a request with action "health_log_exercise" and payload containing activity and duration
- **THEN** the system SHALL call HealthManager.logExercise() with the provided parameters
- **AND** the system SHALL return the created ExerciseLog object

#### Scenario: finance_record tool invocation
- **WHEN** the Gateway sends a request with action "finance_record" and payload containing type, amount, category
- **THEN** the system SHALL call FinanceManager.addRecord() with the provided parameters
- **AND** the system SHALL return the created record

#### Scenario: finance_query tool invocation
- **WHEN** the Gateway sends a request with action "finance_query" and payload containing query parameters
- **THEN** the system SHALL call FinanceManager.query() with the provided parameters
- **AND** the system SHALL return matching records

#### Scenario: fashion_add_item tool invocation
- **WHEN** the Gateway sends a request with action "fashion_add_item" and payload containing item details
- **THEN** the system SHALL call FashionManager.addItem() with the provided parameters
- **AND** the system SHALL return the created item

#### Scenario: Unknown tool invocation
- **WHEN** the Gateway sends a request with an unknown action
- **THEN** the system SHALL throw an error "Unknown action: {action}"

### Requirement: Manager Dependency Injection
The OpenClawPlugin SHALL have access to all Manager instances for business logic execution.

#### Scenario: Plugin initialization with managers
- **WHEN** the plugin loads in plugin mode
- **THEN** the system SHALL initialize Database connection
- **AND** the system SHALL instantiate all managers (HealthManager, FinanceManager, FashionManager, etc.)
- **AND** the system SHALL make managers available to tool handlers

#### Scenario: Plugin initialization in standalone mode
- **WHEN** the plugin loads in standalone mode
- **THEN** the system SHALL initialize its own Database
- **AND** the system SHALL instantiate managers with local database
