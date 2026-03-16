## Why

The AI Config page (`/ai-config`) shows "保存成功" (save success) message, but the API key is **not actually persisted** due to a field name mismatch between frontend (camelCase `apiKey`) and backend (snake_case `api_key`). Additionally, users cannot see a list of their saved model configurations - this feature doesn't exist in the UI.

## What Changes

1. **Fix API key persistence bug**
   - Frontend sends `apiKey` but backend expects `api_key`
   - Fix field name mapping in frontend or backend

2. **Add saved model configurations list**
   - Display previously saved AI configurations
   - Allow users to view, select, and delete saved configs

3. **Improve save feedback**
   - Show clear indication of save result (success/failure)
   - Verify data is actually persisted after save

## Capabilities

### New Capabilities
- `ai-config-list`: Display saved AI model configurations list in the UI
- `ai-config-persistence-fix`: Fix the API key not being saved due to field name mismatch

### Modified Capabilities
- `ai-config`: Update existing AI config page to include list view and fix persistence

## Impact

- **Frontend**: `packages/web/src/views/ai-config/index.vue` - Add model list component, fix field mapping
- **Backend**: `packages/core/src/api/ai-routes.ts` - May need to accept both `apiKey` and `api_key` for compatibility
- **Database**: No changes needed - `ai_config` table already exists
