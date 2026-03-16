## 1. Dashboard Cleanup

- [x] 1.1 Remove dashboard shortcuts route from router
- [x] 1.2 Delete packages/web/src/views/dashboard/shortcuts folder
- [x] 1.3 Update welcome page to fetch real health data
- [x] 1.4 Update welcome page to fetch real finance data

## 2. i18n Fix

- [x] 2.1 Add missing login translations to packages/i18n/src/translations.ts
- [x] 2.2 Add login.pureQQLogin and login.pureWeiBoLogin keys
- [ ] 2.3 Test login page has no console warnings

## 3. AI Config Page

- [x] 3.1 Create packages/web/src/views/ai-config/index.vue
- [x] 3.2 Add provider selection (OpenAI/Claude)
- [x] 3.3 Add API key input field
- [x] 3.4 Add model selector dropdown
- [x] 3.5 Add test connection button
- [x] 3.6 Add router entry for /ai-config

## 4. NLU Backend Endpoint

- [x] 4.1 Create /api/ai/nlu endpoint in backend
- [x] 4.2 Connect to existing NLUService
- [x] 4.3 Register health_log_water tool executor
- [x] 4.4 Return structured response to frontend

## 5. Connect AI Chat to NLU

- [x] 5.1 Modify AI chat to detect NL commands
- [x] 5.2 Send NL input to /api/ai/nlu endpoint
- [x] 5.3 Display execution result in chat
- [x] 5.4 Add NL mode toggle in chat UI

## 6. Test End-to-End

- [ ] 6.1 Test: "I drank 3 glasses of water" → logs to database
- [ ] 6.2 Test: Health page shows logged water
- [ ] 6.3 Test: AI config saves and loads
- [ ] 6.4 Verify no i18n warnings
