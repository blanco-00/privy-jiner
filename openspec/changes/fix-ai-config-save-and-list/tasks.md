## 1. Fix API Key Persistence Bug

- [x] 1.1 Fix frontend field name mapping in ai-config/index.vue (change `apiKey` to `api_key` when sending to backend)
- [x] 1.2 Fix `baseUrl` to `base_url` field name mapping
- [x] 1.3 Test save and verify API key is persisted in database

## 2. Add Backend API for Saved Configurations

- [x] 2.1 Add GET /api/ai/configs endpoint to list all saved configurations
- [x] 2.2 Add DELETE /api/ai/configs/:id endpoint to delete a configuration
- [x] 2.3 Add PUT /api/ai/configs/:id endpoint to update a configuration

## 3. Add Frontend Saved Configurations List UI

- [x] 3.1 Add "Saved Configurations" section below the form in ai-config/index.vue
- [x] 3.2 Display list of saved configs with provider, model, masked API key
- [x] 3.3 Add click handler to load selected configuration into form
- [x] 3.4 Add delete button for each saved configuration
- [x] 3.5 Add "Save as New" button to save current form as new configuration
- [x] 3.6 Add confirmation dialog before deleting

## 4. Add Internationalization

- [x] 4.1 Add i18n keys for new UI elements (savedConfigsTitle, deleteConfig, confirmDelete, etc.)

## 5. Verify and Test

- [ ] 5.1 Test complete save/load/delete cycle
- [ ] 5.2 Verify persistence across page refresh
- [ ] 5.3 Test with different providers (OpenAI, Claude, Zhipu, MiniMax)
