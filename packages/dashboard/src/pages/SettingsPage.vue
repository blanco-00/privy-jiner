<template>
  <div class="settings-page">
    <h1>Database Settings</h1>
    
    <div class="card">
      <div class="status-bar">
        <div class="status-dot" :class="{ connected: dbStatus.connected }"></div>
        <span>{{ dbStatus.connected ? 'Connected' : 'Not Connected' }}</span>
        <span class="db-type">{{ dbStatus.type?.toUpperCase() }}</span>
      </div>

      <div class="form-field">
        <label>Database Type</label>
        <select v-model="config.type">
          <option value="sqlite">SQLite (Local)</option>
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
        </select>
      </div>

      <div v-if="config.type === 'sqlite'" class="form-field">
        <label>Database Path</label>
        <input v-model="config.path" type="text" placeholder=".privy-jiner/data/core.db" />
      </div>

      <template v-else>
        <div class="form-field">
          <label>Host</label>
          <input v-model="config.host" type="text" placeholder="localhost" />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Port</label>
            <input v-model="config.port" type="number" :placeholder="config.type === 'mysql' ? '3306' : '5432'" />
          </div>
          <div class="form-field">
            <label>Database Name</label>
            <input v-model="config.database" type="text" placeholder="privy_jiner" />
          </div>
        </div>
        <div class="form-field">
          <label>Username</label>
          <input v-model="config.username" type="text" placeholder="root" />
        </div>
        <div class="form-field">
          <label>Password</label>
          <input v-model="config.password" type="password" placeholder="Enter password" />
        </div>
      </template>

      <div v-if="message" class="message" :class="message.type">
        {{ message.text }}
      </div>

      <div class="actions">
        <button class="btn-secondary" @click="testConnection" :disabled="loading">
          {{ loading ? 'Testing...' : 'Test Connection' }}
        </button>
        <button class="btn-primary" @click="saveConfig" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save & Initialize' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const loading = ref(false);
const message = ref<{ type: string; text: string } | null>(null);

const dbStatus = ref({ connected: false, type: '' });

const config = reactive({
  type: 'sqlite' as 'sqlite' | 'mysql' | 'postgresql',
  path: '.privy-jiner/data/core.db',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
});

onMounted(async () => {
  try {
    const res = await fetch('/api/database/status');
    const data = await res.json();
    dbStatus.value = data;
    if (data.type) config.type = data.type;
  } catch (e) {
    console.error('Failed to load status');
  }
});

async function testConnection() {
  loading.value = true;
  message.value = null;

  try {
    const res = await fetch('/api/database/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    message.value = {
      type: data.success ? 'success' : 'error',
      text: data.success ? 'Connection successful!' : (data.error || 'Connection failed'),
    };
  } catch (e) {
    message.value = { type: 'error', text: 'Failed to connect' };
  } finally {
    loading.value = false;
  }
}

async function saveConfig() {
  loading.value = true;
  message.value = null;

  try {
    const res = await fetch('/api/database/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    message.value = {
      type: data.success ? 'success' : 'error',
      text: data.success ? 'Saved successfully!' : (data.error || 'Save failed'),
    };
  } catch (e) {
    message.value = { type: 'error', text: 'Failed to save' };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.settings-page {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 32px;
  font-size: 28px;
  color: #f5f5f5;
}

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #242424;
  border-radius: 8px;
  margin-bottom: 24px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e85454;
}

.status-dot.connected {
  background: #54e88a;
}

.db-type {
  margin-left: auto;
  font-size: 12px;
  color: #888;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #f5f5f5;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  outline: none;
}

.form-field input:focus,
.form-field select:focus {
  border-color: #e8a854;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.message.success {
  background: rgba(84, 232, 138, 0.1);
  color: #54e88a;
}

.message.error {
  background: rgba(232, 84, 84, 0.1);
  color: #e85454;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #e8a854;
  color: #0f0f0f;
}

.btn-primary:hover:not(:disabled) {
  background: #f0b866;
}

.btn-secondary {
  background: transparent;
  color: #888;
  border: 1px solid #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #242424;
  color: #f5f5f5;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
