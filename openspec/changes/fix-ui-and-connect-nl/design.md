## Context

**Current State:**
- Welcome page shows hardcoded mock data (not from real APIs)
- Dashboard has 2 pages: overview + shortcuts (duplicated)
- Login page has i18n warnings (missing translations)
- AI Chat page exists but doesn't use NLU backend
- NLU backend implemented but not connected to frontend
- OpenClaw plugin code exists but not wired up

**What Works:**
- Health API endpoints (/api/health/water, /api/health/exercise)
- Finance API endpoints
- NLU service in packages/ai
- OpenClaw bridge with NL handling

## Goals / Non-Goals

**Goals:**
1. Remove dashboard shortcuts page, keep only overview
2. Connect welcome page to real APIs for health/finance data
3. Fix i18n missing translations
4. Add AI configuration page for provider/model selection
5. Connect AI Chat to NLU backend
6. Test "I drank water" → health log

**Non-Goals:**
- Redesign UI (keep existing layout)
- Add new features beyond NL integration
- Database changes

## Decisions

### D1: Dashboard Cleanup

**Decision:** Remove shortcuts page, modify overview to show real data.

### D2: Welcome Page Data

**Decision:** Fetch data from existing APIs:
- GET /api/health/water/today → water intake
- GET /api/finance/summary → expense data

### D3: AI Chat Integration

**Decision:** Add "Natural Language Mode" toggle in AI chat. When enabled:
1. User types "I drank 3 glasses water"
2. Frontend sends to /api/ai/nlu (new endpoint)
3. Backend NLU parses → calls health API
4. Returns result to chat

### D4: AI Config Page

**Decision:** Create simple form with:
- Provider dropdown (OpenAI/Claude)
- API Key input
- Model selector (fetched from provider)
- Test connection button

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| API keys exposed | Security | Use env vars, don't store in DB |
| NLU parsing fails | User confusion | Show clear error messages |
| Real APIs fail | Broken UI | Show fallback/mock data |

## Open Questions

1. Should NL always be on, or optional toggle?
2. How to test OpenClaw without running gateway?
3. Should we keep shortcuts page or remove it?
