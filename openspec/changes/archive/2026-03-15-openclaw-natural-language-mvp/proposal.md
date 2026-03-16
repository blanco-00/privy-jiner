## Why

Currently, jiner lacks a natural language interface for executing system functions. When integrated with OpenClaw, users can only invoke specific tools with structured parameters. This limits usability—users must know exact command formats. By adding natural language processing powered by LLMs, users can say "I drank 3 glasses of water" and have the system intelligently parse intent and call the appropriate API.

This MVP enables the core capability: natural language → intent parsing → API execution, which can later be extended to more complex scenarios.

## What Changes

1. **Add AI Provider Model List API** - Extend AI configuration to fetch available models from providers (OpenAI, Claude, etc.)
2. **Add Natural Language Intent Parser** - New service that uses LLM to parse natural language into structured tool calls
3. **Enhance Openclaw Integration** - Accept natural language commands from OpenClaw gateway, process via LLM, execute jiner APIs
4. **Add Health Water Logging MVP** - Implement the simplest end-to-end flow: "log water intake" via natural language

## Capabilities

### New Capabilities

- **nl-intent-parser**: Parse natural language into structured tool call requests using LLM
- **model-provider-config**: Configure AI providers and fetch available models from APIs
- **openclaw-nl-bridge**: Bridge between OpenClaw natural language commands and jiner API execution

### Modified Capabilities

- **openclaw-integration**: Extended to accept and process natural language (currently only structured tool calls)
- **ai-model-management**: Extended to support fetching model lists from providers (currently only manual model entry)

## Impact

- **New Files**: 
  - `packages/ai/src/providers/` - AI provider adapters
  - `packages/ai/src/nlu.ts` - Natural language understanding service
  - `packages/core/src/openclaw/nl-bridge.ts` - OpenClaw NL integration

- **Modified Files**:
  - `packages/ai/src/manager.ts` - Add model list fetching
  - `packages/core/src/openclaw/index.ts` - Add NL message handling

- **Dependencies**: None (uses existing better-sqlite3, existing AI client structure)
- **Database**: New tables for provider configs (optional, can use env vars initially)
