## 1. Backend API Implementation

- [x] 1.1 Add modelId field to conversations table in SQLite schema
- [x] 1.2 Create GET /api/ai/models endpoint to return user's configured models
- [x] 1.3 Update conversation creation/loading to include modelId
- [x] 1.4 Test API endpoint with authenticated user

## 2. Frontend Model Selector Component

- [x] 2.1 Create ModelSelector.vue component in packages/web/src/components/chat/
- [x] 2.2 Integrate Element Plus el-select component
- [x] 2.3 Add model option rendering with provider and name display
- [x] 2.4 Handle empty state (no configured models)
- [x] 2.5 Add loading and error states

## 3. Chat View Integration

- [x] 3.1 Integrate ModelSelector into /ai-chat/chat view header
- [x] 3.2 Connect selector to Pinia store for selected model
- [x] 3.3 Fetch models list on chat page load via API
- [x] 3.4 Persist selected model to conversation on change

## 4. Message Display Enhancement

- [x] 4.1 Add model badge to assistant message display
- [x] 4.2 Style badge to be subtle and non-intrusive
- [x] 4.3 Show provider name in badge

## 5. State Management

- [x] 5.1 Add models list to AI chat Pinia store
- [x] 5.2 Add selectedModelId to store
- [x] 5.3 Add actions to fetch models and update selection
- [x] 5.4 Load selected model when opening existing conversation

## 6. Testing & Polish

- [ ] 6.1 Test model switching with multiple configured models
- [ ] 6.2 Verify model persists when returning to conversation
- [ ] 6.3 Test empty state UI
- [ ] 6.4 Verify mobile responsiveness of selector
- [ ] 6.5 Test error handling when API fails
