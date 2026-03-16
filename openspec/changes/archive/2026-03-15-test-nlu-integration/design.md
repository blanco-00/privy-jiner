## Context

**Current State:**
- NLU service implemented in `packages/ai/src/nlu.ts`
- OpenClaw bridge with NL handling in `packages/core/src/openclaw/index.ts`
- Health module integration working
- No automated tests exist

**Constraints:**
- Use existing test framework if any (check package.json for jest/vitest)
- Tests must run without requiring real API keys
- Must be fast to execute

## Goals / Non-Goals

**Goals:**
1. Create mock AI client for deterministic testing
2. Unit tests for NLU parsing logic
3. Integration tests for OpenClaw NL message flow
4. End-to-end tests for water logging via NL

**Non-Goals:**
- Load testing (future work)
- Performance benchmarking (future work)
- Testing with real API calls (requires secrets)

## Decisions

### D1: Mock AI Client

**Decision:** Create a mock client that returns predefined responses.

**Alternatives:**
- Use real API with test keys (rejected - requires secrets, non-deterministic)
- Use VCR/playback (rejected - too complex for MVP)

**Rationale:** Simple, fast, deterministic, no external dependencies.

### D2: Test File Organization

**Decision:** Place tests alongside source files in `__tests__` directories.

```
packages/ai/src/__tests__/nlu.test.ts
packages/core/src/openclaw/__tests__/nl-bridge.test.ts
```

**Rationale:** Follows common TypeScript conventions, easy to find.

### D3: Test Data

**Decision:** Use inline test cases for simplicity.

**Rationale:** Tests are self-documenting, easy to modify.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Tests may drift from implementation | Keep tests in sync with code reviews |
| Mock may not match real behavior | Add integration test with real API as optional |
| Test maintenance burden | Keep tests focused, avoid over-mocking |

## Test Scenarios

### NLU Service Tests
- parseIntent with water logging requests
- parseIntent with exercise requests  
- parseIntent with unknown intent
- extractNumeric for various formats
- extractDate for "today", "yesterday", specific dates
- executeTool with valid/invalid intents

### OpenClaw Bridge Tests
- isNaturalLanguage detection
- handleNaturalLanguage with NL enabled
- handleNaturalLanguage with NL disabled
- Fallback to structured tool call

### Health Integration Tests
- Water logging via parsed intent
- Error handling for missing params
