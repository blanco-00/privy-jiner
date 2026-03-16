## Context

**Background:**
Privy-Jiner is a personal AI assistant with a Vue 3 frontend and Node.js backend. The existing AI chat interface (`/ai-chat/chat`) supports multiple AI providers (OpenAI, Claude, Zhipu, MiniMax) but currently lacks a way to switch between user's configured models directly in the chat UI.

**Current State:**
- Frontend: Vue 3 + Element Plus + Pinia
- Backend: Express + SQLite
- AI Package: Supports multiple providers via `packages/ai/src/client.ts`
- Existing Model Config: Users configure API keys and models in `/ai-config` page

**Research Findings (Mainstream Patterns):**
Based on analysis of ChatGPT, Claude, Gemini, Poe, Perplexity, and Cursor/Windsurf:
1. **Model selector location**: Most common in input toolbar (above/beside textarea) or header dropdown
2. **Model info display**: Show model name as badge on messages, indicating which model generated the response
3. **Persistence**: Per-conversation model selection is the standard (Poe, Gemini support this)
4. **UI Pattern**: Two-step selector (provider → model) or flat model list with provider grouping

## Goals / Non-Goals

**Goals:**
1. Add model selector dropdown to chat interface header
2. Display currently selected model name in UI
3. Show model badge on assistant messages (which model responded)
4. Persist selected model per conversation
5. Backend API to fetch user's configured models for the selector

**Non-Goals:**
- Implementing new AI providers (already supported)
- Real-time model comparison (out of scope)
- Cost tracking/display per model
- Voice input or multimodal features
- Changing the core chat message rendering (deep-chat component)

## Decisions

### 1. Model Selector Location
**Decision**: Place model selector in chat header, above the message area

**Rationale**: 
- Matches mainstream pattern (ChatGPT, Gemini place it near top)
- More visible than input toolbar placement
- Doesn't interfere with the input area UX
- Element Plus provides easy-to-customize select component

**Alternative Considered**: Input toolbar (beside send button)
- Rejected: Crowds the input area, especially on smaller screens

### 2. Model Selection Persistence
**Decision**: Per-conversation model selection (stored in conversation metadata)

**Rationale**:
- Standard pattern (Poe, Gemini allow per-chat model)
- Users may want different models for different tasks
- Conversation already has an ID in SQLite, easy to add model field

**Alternative Considered**: Global user preference
- Rejected: Less flexible, requires additional user settings store

### 3. Model Badge Display
**Decision**: Show model badge below assistant message bubbles

**Rationale**:
- Clear indication of which model responded
- Standard pattern used by Poe, Perplexity
- Non-intrusive (small font, subtle opacity)

### 4. Backend API Design
**Decision**: New endpoint `GET /api/ai/models` returning user's configured models

**Response Format:**
```json
{
  "models": [
    {
      "id": "uuid",
      "provider": "openai",
      "name": "gpt-4o",
      "enabled": true
    }
  ]
}
```

**Rationale**:
- Reuses existing AI config infrastructure
- Simple, no additional database changes needed
- Frontend can call on page load

### 5. Component Architecture
**Decision**: Create new `ModelSelector.vue` component using Element Plus

**Structure:**
```
packages/web/src/
├── components/
│   └── chat/
│       └── ModelSelector.vue    # New component
└── views/ai-chat/chat/
    └── index.vue               # Integrate selector
```

**Rationale**:
- Follows existing codebase patterns (Element Plus)
- Reusable if needed elsewhere
- Keeps chat view clean

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| User has no configured models | Selector shows empty state | Show "Configure models" link to `/ai-config` |
| API call fails | Selector doesn't load | Show error toast, allow retry |
| Model API key invalid | Chat fails to respond | Show error message, allow model switch |
| Mobile responsiveness | Selector takes too much space | Use compact dropdown on small screens |

**Trade-offs:**
- **Simplicity vs Features**: MVP only shows enabled models, not full provider/model hierarchy
- **Consistency vs Flexibility**: Per-conversation selection means history might be confusing if model changes mid-conversation

## Migration Plan

**Phase 1 (Backend):**
1. Add `modelId` field to conversations table (nullable)
2. Create `GET /api/ai/models` endpoint

**Phase 2 (Frontend):**
1. Create `ModelSelector.vue` component
2. Integrate into `/ai-chat/chat` view
3. Add model badge to assistant messages
4. Update store to handle selected model

**Rollback:**
- Database migration is additive (no schema breaking)
- Frontend: Remove component, revert to default model
- No breaking changes to existing chat functionality

## Open Questions

1. Should we show provider logo in selector? (Nice-to-have, not MVP)
2. How to handle model-specific capabilities display? (Context length, vision support)
3. Should we allow switching mid-conversation or warn about context loss?
