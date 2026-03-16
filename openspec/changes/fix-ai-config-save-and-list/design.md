## Context

The `/ai-config` page has two issues:
1. **Persistence bug**: Frontend sends `apiKey` (camelCase) but backend expects `api_key` (snake_case), causing API key save to fail silently
2. **Missing feature**: No UI to view saved model configurations - users can only see the currently active config

Current architecture:
- Frontend: Vue 3 + Element Plus
- Backend: Express + SQLite (better-sqlite3)
- API endpoint: `POST /api/ai/config` receives `{ provider, api_key, base_url, model, temperature, max_tokens }`

## Goals / Non-Goals

**Goals:**
- Fix field name mismatch so API key is actually persisted
- Add UI to display list of saved AI configurations
- Allow users to switch between saved configurations

**Non-Goals:**
- Add user authentication for AI configs (single user app)
- Implement OAuth for providers
- Support multiple simultaneous active configurations

## Decisions

### 1. Fix Field Mapping
**Option A**: Change frontend to send `api_key` (snake_case)
- Pros: Aligns with backend API convention
- Cons: Requires changing the form model interface

**Option B**: Change backend to accept both `apiKey` and `api_key`
- Pros: Backward compatible
- Cons: More conditional logic in backend

**Selected**: Option A - Fix frontend to match backend convention (snake_case)

### 2. Model List Implementation
**Option A**: Add new database table for saved configs
- Pros: Clean separation
- Cons: Migration needed, more complex

**Option B**: Use existing `ai_config` table with `is_active` flag
- Pros: No schema changes, leverages existing structure
- Cons: Need to handle multiple saved configs differently

**Selected**: Option B - Add an `is_default` or `name` field to identify saved configs, or use existing table with new "saved configs" interpretation

### 3. UI Layout
**Option A**: Separate page for saved configs
- Pros: Clean separation
- Cons: More navigation

**Option B**: Accordion/tab on existing page
- Pros: Single page, quick access
- Cons: More complex component

**Selected**: Option B - Add a "Saved Configurations" section below the current form

## Risks / Trade-offs

- [Risk] Existing users may have old config data → Migration script or handle null gracefully
- [Risk] API key encryption already exists → Must preserve encryption when saving
- [Risk] Multiple saved configs may cause confusion → Limit to 5 saved configs max

## Migration Plan

1. Add `name` column to `ai_config` table (optional saved config names)
2. Fix frontend field names to match backend
3. Add saved configs list component
4. Test save/load cycle
