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
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 0 0 16px;
  font-size: 28px;
  color: #f5f5f5;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user {
  align-self: flex-end;
  background: #e8a854;
  color: #0f0f0f;
}

.message.assistant {
  align-self: flex-start;
  background: #242424;
  color: #f5f5f5;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #333;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
}

.input-area input:focus {
  outline: none;
  border-color: #e8a854;
}

.btn-send {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  background: #e8a854;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  margin-top: 16px;
  text-align: right;
}

.btn-clear {
  padding: 8px 16px;
  font-size: 13px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
}

.btn-clear:hover {
  background: #1a1a1a;
  color: #e85454;
  border-color: #e85454;
}

.empty {
  text-align: center;
  color: #666;
  padding: 40px;
}
</style>
