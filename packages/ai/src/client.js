export class BaseModelClient {
    model;
    constructor(model) {
        this.model = model;
    }
}
export class OpenAIClient extends BaseModelClient {
    async chat(options) {
        const apiKey = this.model.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        const baseUrl = this.model.baseUrl || 'https://api.openai.com/v1';
        const url = `${baseUrl}/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: this.model.model,
                messages: options.messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
        }
        const data = await response.json();
        const message = data.choices[0]?.message?.content || '';
        const usage = data.usage;
        return {
            content: message,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
            },
        };
    }
    async *chatStream(options) {
        const apiKey = this.model.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        const baseUrl = this.model.baseUrl || 'https://api.openai.com/v1';
        const url = `${baseUrl}/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: this.model.model,
                messages: options.messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens,
                stream: true,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
        }
        if (!response.body) {
            throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: '))
                    continue;
                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                    yield { delta: '', done: true };
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) {
                        yield { delta, done: false };
                    }
                }
                catch {
                    // Skip invalid JSON
                }
            }
        }
    }
    calculateCost(promptTokens, completionTokens) {
        const pricing = {
            'gpt-4': { prompt: 0.03, completion: 0.06 },
            'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
            'gpt-3.5-turbo': { prompt: 0.001, completion: 0.002 },
        };
        const modelPricing = pricing[this.model.model] || { prompt: 0.001, completion: 0.002 };
        return (promptTokens / 1000) * modelPricing.prompt + (completionTokens / 1000) * modelPricing.completion;
    }
}
export class ClaudeClient extends BaseModelClient {
    async chat(options) {
        const apiKey = this.model.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key not configured');
        }
        const baseUrl = this.model.baseUrl || 'https://api.anthropic.com/v1';
        const url = `${baseUrl}/messages`;
        const systemMessage = options.messages.find(m => m.role === 'system');
        const nonSystemMessages = options.messages.filter(m => m.role !== 'system');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model.model,
                system: systemMessage?.content,
                messages: nonSystemMessages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens || 1024,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Claude API error: ${error}`);
        }
        const data = await response.json();
        const content = data.content.find(c => c.type === 'text')?.text || '';
        const usage = data.usage;
        return {
            content,
            usage: {
                promptTokens: usage.input_tokens,
                completionTokens: usage.output_tokens,
                totalTokens: usage.input_tokens + usage.output_tokens,
            },
        };
    }
    async *chatStream(options) {
        // Claude doesn't support streaming in the same way, fall back to non-streaming
        const response = await this.chat(options);
        yield { delta: response.content, done: true, usage: response.usage };
    }
    calculateCost(promptTokens, completionTokens) {
        const pricing = {
            'claude-3-opus': { prompt: 0.015, completion: 0.075 },
            'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
            'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
        };
        const modelPricing = pricing[this.model.model] || { prompt: 0.003, completion: 0.015 };
        return (promptTokens / 1000) * modelPricing.prompt + (completionTokens / 1000) * modelPricing.completion;
    }
}
export function createModelClient(model) {
    switch (model.provider) {
        case 'openai':
            return new OpenAIClient(model);
        case 'claude':
            return new ClaudeClient(model);
        default:
            throw new Error(`Unsupported model provider: ${model.provider}`);
    }
}
export class ChatService {
    aiManager;
    constructor(aiManager) {
        this.aiManager = aiManager;
    }
    async sendMessage(conversationId, message) {
        const conversation = this.aiManager.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        const model = this.aiManager.getModel(conversation.modelId);
        if (!model || !model.enabled) {
            throw new Error('Model not available');
        }
        const messages = JSON.parse(conversation.messages);
        messages.push({ role: 'user', content: message });
        const client = createModelClient(model);
        const response = await client.chat({ model, messages });
        messages.push({ role: 'assistant', content: response.content });
        this.aiManager.updateConversation(conversationId, messages);
        if (response.usage) {
            this.aiManager.recordTokenUsage({
                modelId: model.id,
                conversationId,
                promptTokens: response.usage.promptTokens,
                completionTokens: response.usage.completionTokens,
                totalTokens: response.usage.totalTokens,
                cost: client.calculateCost(response.usage.promptTokens, response.usage.completionTokens),
                currency: 'USD',
            });
        }
        return response;
    }
    async *sendMessageStream(conversationId, message) {
        const conversation = this.aiManager.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        const model = this.aiManager.getModel(conversation.modelId);
        if (!model || !model.enabled) {
            throw new Error('Model not available');
        }
        const messages = JSON.parse(conversation.messages);
        messages.push({ role: 'user', content: message });
        const client = createModelClient(model);
        const chunks = [];
        for await (const chunk of client.chatStream({ model, messages })) {
            if (!chunk.done && chunk.delta) {
                chunks.push(chunk.delta);
                yield chunk;
            }
            if (chunk.done && chunk.usage) {
                this.aiManager.recordTokenUsage({
                    modelId: model.id,
                    conversationId,
                    promptTokens: chunk.usage.promptTokens,
                    completionTokens: chunk.usage.completionTokens,
                    totalTokens: chunk.usage.totalTokens,
                    cost: client.calculateCost(chunk.usage.promptTokens, chunk.usage.completionTokens),
                    currency: 'USD',
                });
            }
        }
        messages.push({ role: 'assistant', content: chunks.join('') });
        this.aiManager.updateConversation(conversationId, messages);
    }
}
//# sourceMappingURL=client.js.map