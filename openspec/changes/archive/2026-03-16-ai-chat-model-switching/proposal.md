## Why

The current AI chat interface in Privy-Jiner (`/ai-chat/chat`) only supports a single model or requires users to configure models separately. Users want to switch between their configured AI models (OpenAI, Claude, Zhipu, MiniMax) directly within the chat interface to compare responses or use the best model for specific tasks. This is a common pattern in all major AI chat products (ChatGPT, Claude, Poe, Perplexity).

## What Changes

- Add a model selector dropdown in the chat header to switch between user's configured AI models
- Display the currently selected model name and provider in the chat interface
- Persist the selected model per conversation or globally
- Show model capabilities/info in the selector (e.g., context length, provider)
- Backend API to fetch user's configured models list for the dropdown

## Capabilities

### New Capabilities
- `ai-model-switching`: Allow users to switch between their configured AI models directly in the chat interface, with visual feedback of the current model

### Modified Capabilities
- None

## Impact

- **Frontend**: New model selector component in chat header, store updates for selected model
- **Backend**: New endpoint to list user's configured models for the selector
- **AI Package**: May need to support dynamic model selection in the client
