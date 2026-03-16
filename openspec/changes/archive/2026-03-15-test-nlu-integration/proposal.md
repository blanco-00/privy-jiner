## Why

The OpenClaw Natural Language MVP was implemented but lacks comprehensive test coverage. Without tests, the system is fragile - any refactoring or API changes could break functionality without detection. We need automated tests to ensure reliability and enable safe future development.

## What Changes

1. **Unit tests for NLU service** - Test intent parsing, param extraction, tool execution
2. **Integration tests for OpenClaw bridge** - Test NL message handling, feature toggle
3. **Health module tests** - Test water/exercise logging via NL
4. **Mock AI client** - Create mock for testing without real API calls
5. **Test utilities** - Helper functions for common test scenarios

## Capabilities

### New Capabilities
- `nlu-unit-tests`: Unit tests for NLU service (parseIntent, extractParams, executeTool)
- `nlu-mocks`: Mock AI client for deterministic testing
- `openclaw-bridge-tests`: Integration tests for NL message flow
- `health-integration-tests`: End-to-end tests for water logging via NL

### Modified Capabilities
- None - this is new test coverage

## Impact

- **New Files**:
  - `packages/ai/src/__tests__/nlu.test.ts`
  - `packages/ai/src/__tests__/mocks.ts`
  - `packages/core/src/openclaw/__tests__/nl-bridge.test.ts`
  - `packages/core/src/__tests__/health-nl.test.ts`

- **Dependencies**: Add jest for testing (or use existing test framework)
- **No breaking changes** - purely additive test code
