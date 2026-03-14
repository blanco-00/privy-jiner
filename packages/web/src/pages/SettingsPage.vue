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
  padding: var(--space-xl);
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 var(--space-xl);
  font-size: var(--font-3xl);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-danger);
}

.status-dot.connected {
  background: var(--accent-success);
}

.db-type {
  margin-left: auto;
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.form-field {
  margin-bottom: calc(var(--space-md) + var(--space-xs));
}

.form-field label {
  display: block;
  margin-bottom: var(--space-sm);
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-base);
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  outline: none;
}

.form-field input:focus,
.form-field select:focus {
  border-color: var(--accent-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.message {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  margin-bottom: calc(var(--space-md) + var(--space-xs));
  font-size: var(--font-base);
}

.message.success {
  background: rgba(84, 232, 138, 0.1);
  color: var(--accent-success);
}

.message.error {
  background: rgba(232, 84, 84, 0.1);
  color: var(--accent-danger);
}

.actions {
  display: flex;
  gap: var(--space-md);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: var(--space-sm);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-primary-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
