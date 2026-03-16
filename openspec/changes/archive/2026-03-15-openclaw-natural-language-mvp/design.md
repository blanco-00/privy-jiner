## Context

**Current State:**
- jiner is a personal AI assistant with modules: finance, health, fashion, knowledge, news
- Already has OpenClaw plugin integration with structured tool handlers (finance_record, health_log_water, etc.)
- Has basic AI model management (add/list/update models) but no model list fetching from providers
- No natural language processing - only structured API calls

**Constraints:**
- Lightweight deployment (SQLite, minimal dependencies)
- Must work with existing TypeScript monorepo
- OpenClaw integration must remain compatible

**Stakeholders:**
- End users wanting voice/chat interaction via OpenClaw
- Developers extending jiner capabilities

## Goals / Non-Goals

**Goals:**
1. Enable model provider configuration with dynamic model list fetching
2. Implement natural language → API call conversion (NLU)
3. Create MVP: "log water intake" via natural language through OpenClaw
4. Establish foundation for extending to other modules

**Non-Goals:**
1. Full conversational AI with memory/context (future work)
2. Multi-step task orchestration (future work)
3. Voice input processing (future work)
4. Advanced tool discovery at runtime (future work)

## Decisions

### D1: LLM-based Intent Parsing

**Decision:** Use LLM to parse natural language into structured tool calls.

**Alternatives Considered:**
- Rule-based regex/keyword matching (rejected - brittle, hard to maintain)
- Local NLU models like Rasa (rejected - too heavy for personal use)
- Fine-tuned small model (rejected - requires training data)

**Rationale:** LLM is already required for the system. Using GPT-4o/mini for parsing is reliable, requires no training, and handles variations like "I drank water", "had 3 cups of water", "water: 300ml".

### D2: Prompt-based Tool Definition

**Decision:** Define available tools as structured JSON in the LLM prompt, not from database.

**Alternatives Considered:**
- Store tool definitions in SQLite (rejected - harder to update, duplication)
- OpenClaw capability registration (rejected - we need jiner-specific tool mappings)

**Rationale:** Simple, version-controlled, easy to modify. Tool definitions can include jiner-specific mappings like:
```json
{
  "tool": "health_log_water",
  "keywords": ["water", "drink", "hydration", "cups", "glasses"],
  "param_mapping": { "amount": "numeric_extraction" }
}
```

### D3: Minimal MVP Scope

**Decision:** Only implement health_log_water for MVP.

**Alternatives Considered:**
- Implement all 9 OpenClaw tools (rejected - too much scope)
- Implement finance_record (rejected - categories are complex)

**Rationale:** Water logging has:
- Simple numeric input (amount)
- Clear natural language patterns
- No complex category mapping
- Easy verification (did it record correctly?)

### D4: Provider Model List via Direct API Calls

**Decision:** Fetch model lists by calling provider APIs directly (e.g., OpenAI API).

**Alternatives Considered:**
- Hardcode popular models (rejected - gets outdated)
- Third-party model aggregation service (rejected - extra dependency)

**Rationale:** Most providers have simple `/models` endpoints. For MVP, start with OpenAI (most common), then add Claude/Gemini as needed.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM parsing can be unreliable | User intent misidentified | Add confidence threshold, fallback to error message |
| API key exposure | Security | Use environment variables, never log keys |
| LLM cost | Financial | Use cheap models (GPT-4o-mini), cache parsed results |
| Network failure | Availability | Graceful degradation, show error to user |
| Provider rate limits | Availability | Add retry logic, queue requests |

## Migration Plan

**Phase 1 (This MVP):**
1. Add model provider config to AI module
2. Implement NLU intent parser service
3. Add OpenClaw NL bridge endpoint
4. Test: "I drank 3 glasses of water" → health water logged

**Phase 2 (Future):**
1. Add more tool mappings (finance, exercise, fashion)
2. Add conversation context/memory
3. Support local models (Ollama)
4. Add UI for model provider configuration

**Rollback:**
- All changes are additive - no breaking changes
- Can disable NL feature via config flag
- OpenClaw tool handlers remain functional for structured calls

## Open Questions

1. **Q: Should NLU parsing happen on jiner side or OpenClaw side?**
   - Currently: jiner receives natural language and parses internally
   - Alternative: OpenClaw sends structured tool call directly
   - Decision for MVP: jiner-side (more flexible)

2. **Q: How to handle ambiguous requests like "I had coffee and water"?**
   - Current: Return error asking for clarification
   - Future: Execute both if clearly parseable

3. **Q: Should we support local LLM models (Ollama)?**
   - Yes, as future enhancement for privacy/offline use
   - Will need to add Ollama provider adapter

## Naming Recommendations

Based on research of popular AI assistant projects (Leon, inbox-zero, n8n, awesome-ai-agents), here are naming recommendations for this feature:

### Current Issues
- `privy-jiner` - too long, not memorable
- No clear brand identity for the OpenClaw plugin

### Recommended Names

| Component | Recommended Name | Rationale |
|-----------|-----------------|------------|
| **Core Project** | `jiner` | Short, memorable, already in use |
| **NL Bridge Module** | `jiner-nl-bridge` | Clear purpose, matches OpenClaw integration |
| **NLU Service** | `jiner-nlu` | Natural language understanding component |
| **OpenClaw Plugin** | `jiner-assistant` | More descriptive than just "plugin" |

### Brand Guidelines (Based on Leon's Success)

1. **Single Identity**: Use `jiner` consistently across npm, GitHub, documentation
2. **Visual Identity**: Create simple logo/icon for the project
3. **Documentation Structure**:
   - One-line description in README
   - Quick start guide (3-5 steps)
   - Feature list with icons
   - Roadmap (public)
4. **Community**: Consider Discord/Telegram for community building
5. **Developer Experience**: Clear contribution guide, good code comments

### Documentation Best Practices Observed

From Leon project:
- README has animated hero image
- Clear "Why?" section explaining motivation
- Roadmap at roadmap.getleon.ai
- YouTube dev journey (中文开发者记录)
- Multiple language support mention
