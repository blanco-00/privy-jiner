# Spec: Tasks Management

## ADDED Requirements

### Requirement: Task management
The system SHALL allow users to manage tasks/todos.

#### Scenario: Create task
- **WHEN** user creates a task
- **THEN** system stores title, description
- **AND** system stores priority (low/medium/high)
- **AND** system stores due_date and status (pending/in_progress/completed)

#### Scenario: Query tasks
- **WHEN** user queries tasks
- **THEN** system returns all tasks
- **AND** system filters by status if specified
- **AND** system orders by priority and due_date

#### Scenario: Update task status
- **WHEN** user updates task status
- **THEN** system updates status field
- **AND** system records completed_at timestamp

#### Scenario: Delete task
- **WHEN** user deletes task
- **THEN** system removes task from database

## ADDED Requirements

### Requirement: Task categories
The system SHALL support task categorization.

#### Scenario: Categorize task
- **WHEN** user assigns category to task
- **THEN** system stores category (work/personal/study/health/other)

#### Scenario: Get overdue tasks
- **WHEN** user requests overdue tasks
- **THEN** system returns tasks with past due_date and not completed
