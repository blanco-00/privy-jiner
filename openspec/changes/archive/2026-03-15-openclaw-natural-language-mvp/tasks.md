## 1. AI Provider Configuration

- [x] 1.1 Extend AI model manager to support provider configuration (OpenAI, Claude)
- [x] 1.2 Add fetchModels() method to call provider /models API
- [x] 1.3 Add connection test functionality
- [x] 1.4 Store provider credentials in config (env vars for MVP)
- [x] 1.5 Add getActiveModel() and setActiveModel() methods

## 2. Natural Language Intent Parser (NLU)

- [x] 2.1 Create packages/ai/src/nlu.ts service
- [x] 2.2 Define tool mapping structure (keywords → tool name → param extraction)
- [x] 2.3 Implement parseIntent() - send text + tool defs to LLM
- [x] 2.4 Implement extractParams() - extract structured args from LLM response
- [x] 2.5 Add confidence threshold check (0.8)
- [x] 2.6 Add executeTool() - call actual module APIs based on parsed intent

## 3. OpenClaw Natural Language Bridge

- [x] 3.1 Create packages/core/src/openclaw/nl-bridge.ts
- [x] 3.2 Add isNaturalLanguage() detection in message handler
- [x] 3.3 Integrate NLU service into OpenClaw message flow
- [x] 3.4 Add NL feature toggle to config
- [x] 3.5 Add logging for NL interactions

## 4. Health Module Integration (MVP)

- [x] 4.1 Read existing health module API (health-routes.ts)
- [x] 4.2 Add health_log_water tool definition to NLU
- [x] 4.3 Map natural language patterns to water logging:
  - "I drank X glasses/cups of water" → amount: X
  - "water: Xml" → amount: X
- [x] 4.4 Test end-to-end: NL → NLU → health API → database

## 5. Integration Testing

- [x] 5.1 Test OpenClaw message receiving with NL content (via test scripts)
- [x] 5.2 Test NLU parsing for water logging (via NLU service)
- [x] 5.3 Test error handling (via test scripts)
- [x] 5.4 Test backward compatibility (structured tool calls work)
- [x] 5.5 Verify database record created correctly (via test scripts)

## 6. Documentation & Cleanup

- [x] 6.1 Add comments to NLU service explaining prompt structure
- [x] 6.2 Document tool mapping format for future extensions
- [x] 6.3 Verify build passes (npm run build)
- [ ] 6.4 Test in standalone mode (not just OpenClaw plugin)
