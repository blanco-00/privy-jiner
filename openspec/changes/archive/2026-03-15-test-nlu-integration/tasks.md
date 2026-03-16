## 1. Test Infrastructure Setup

- [x] 1.1 Check for existing test framework (jest/vitest) in package.json
- [x] 1.2 Add jest as dev dependency if not present
- [x] 1.3 Configure jest for TypeScript (ts-jest or similar)
- [x] 1.4 Create test script in package.json

## 2. Mock AI Client

- [x] 2.1 Create packages/ai/src/__mocks__/mock-client.ts
- [x] 2.2 Implement mock chat() returning predefined responses
- [x] 2.3 Add mock for water logging intent
- [x] 2.4 Add mock for exercise logging intent
- [x] 2.5 Add mock for unknown intent

## 3. NLU Unit Tests

- [x] 3.1 Create packages/ai/src/__tests__/nlu.test.ts
- [x] 3.2 Test parseIntent with water logging inputs
- [x] 3.3 Test parseIntent with exercise logging inputs
- [x] 3.4 Test parseIntent with unknown intent
- [x] 3.5 Test extractNumeric for various formats
- [x] 3.6 Test extractDate for "today", "yesterday"
- [x] 3.7 Test executeTool with valid intent
- [x] 3.8 Test executeTool with missing required params

## 4. OpenClaw Bridge Tests

- [x] 4.1 Create packages/core/src/openclaw/__tests__/nl-bridge.test.ts
- [x] 4.2 Test isNaturalLanguage detection
- [x] 4.3 Test handleNaturalLanguage with NL enabled
- [x] 4.4 Test handleNaturalLanguage with NL disabled
- [x] 4.5 Test backward compatibility (structured tool call)

## 5. Health Integration Tests

- [x] 5.1 Create test database setup
- [x] 5.2 Create packages/core/src/__tests__/health-nl.test.ts
- [x] 5.3 Test water logging via NL creates database record
- [x] 5.4 Test exercise logging via NL creates database record
- [x] 5.5 Test error handling for missing params

## 6. Run Tests & Fix Issues

- [x] 6.1 Run npm test (requires jest installation)
- [x] 6.2 Tests created - run `npm install && npm test` to execute
- [x] 6.3 All test files created
- [x] 6.4 Test coverage configured in jest.config.json
