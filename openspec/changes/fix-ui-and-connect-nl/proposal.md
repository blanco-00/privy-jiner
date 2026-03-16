## Why

The current jiner UI has several issues that need fixing: duplicated dashboard pages, incomplete i18n translations causing console warnings, and most importantly - the NL (Natural Language) feature we implemented in the backend is not connected to the frontend. Users cannot say "I drank water" and have it automatically logged. We need to connect the frontend to the NLU backend and make the system actually work end-to-end.

## What Changes

1. **Clean up Dashboard** - Remove duplicate "shortcuts" page, keep only overview
2. **Fix i18n** - Add missing translations to eliminate console warnings on login page
3. **Connect AI Chat to NLU** - Integrate frontend chat with the NLU backend service
4. **Add AI Config page** - Create UI for configuring AI providers and models
5. **Connect OpenClaw plugin** - Configure and test the OpenClaw integration
6. **Real-time data** - Replace hardcoded mock data on welcome page with real API data

## Capabilities

### New Capabilities
- **ai-config-ui**: Frontend page for configuring AI providers (OpenAI, Claude)
- **nl-frontend-integration**: Connect AI chat to NLU backend for natural language commands

### Modified Capabilities
- **dashboard**: Remove duplicate shortcuts page, use real data from APIs
- **welcome-page**: Replace hardcoded data with real API calls
- **openclaw-integration**: Connect and test the plugin (currently implemented but not wired)
- **i18n**: Fix missing translations

## Impact

- **Frontend**: Modify router, views, add AI config page
- **Backend**: Already implemented (NLU service exists)
- **Database**: No changes needed
- **Testing**: Need to test end-to-end NL flow
