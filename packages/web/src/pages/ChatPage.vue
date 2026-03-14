<template>
  <div class="chat-page">
    <h1>{{ t('chat.title') }}</h1>

    <div class="chat-container">
      <div class="messages" ref="messagesContainer">
        <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.created_at) }}</div>
        </div>
        <div v-if="messages.length === 0" class="empty">
          {{ t('chat.startConversation') }}
        </div>
      </div>

      <div class="input-area">
        <input v-model="input" type="text" :placeholder="t('chat.placeholder')" @keyup.enter="sendMessage" :disabled="sending" />
        <button @click="sendMessage" :disabled="sending || !input.trim()" class="btn-send">
          {{ t('chat.send') }}
        </button>
      </div>
    </div>

    <div class="actions">
      <button @click="clearHistory" class="btn-clear">{{ t('chat.clearHistory') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const messages = ref<any[]>([]);
const input = ref('');
const sending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  initLocale();
  loadHistory();
});

async function loadHistory() {
  try {
    messages.value = await (await fetch('/api/ai/chat/history?limit=50')).json();
    messages.value.reverse();
    scrollToBottom();
  } catch (e) {
    console.error('Failed to load chat history');
  }
}

async function sendMessage() {
  if (!input.value.trim() || sending.value) return;
  
  const userMsg = input.value.trim();
  input.value = '';
  sending.value = true;

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: userMsg,
    created_at: new Date().toISOString(),
  });
  scrollToBottom();

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg }),
    });
    const data = await res.json();
    
    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.response,
      created_at: new Date().toISOString(),
    });
    scrollToBottom();
  } catch (e) {
    console.error('Failed to send message');
  } finally {
    sending.value = false;
  }
}

async function clearHistory() {
  if (!confirm(t('chat.confirmClear'))) return;
  try {
    await fetch('/api/ai/chat/clear', { method: 'POST' });
    messages.value = [];
  } catch (e) {
    console.error('Failed to clear history');
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<style scoped>
.chat-page {
  padding: var(--space-xl);
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 0 0 var(--space-md);
  font-size: var(--font-3xl);
  color: var(--text-primary);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--card-padding-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.message {
  max-width: 80%;
  padding: var(--input-padding) var(--space-md);
  border-radius: var(--radius-lg);
}

.message.user {
  align-self: flex-end;
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.message.assistant {
  align-self: flex-start;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.message-time {
  font-size: var(--font-xs);
  opacity: 0.7;
  margin-top: var(--space-xs);
}

.input-area {
  display: flex;
  gap: var(--input-padding);
  padding: var(--space-md);
  border-top: 1px solid var(--border-primary);
}

.input-area input {
  flex: 1;
  padding: var(--input-padding) var(--space-md);
  font-size: var(--font-base);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.input-area input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.btn-send {
  padding: var(--input-padding) var(--space-lg);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  margin-top: var(--space-md);
  text-align: right;
}

.btn-clear {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-clear:hover {
  background: var(--bg-secondary);
  color: var(--accent-danger);
  border-color: var(--accent-danger);
}

.empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-2xl);
}
</style>
