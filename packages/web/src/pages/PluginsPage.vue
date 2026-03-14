<template>
  <div class="plugins-page">
    <h1>{{ t('plugins.title') }}</h1>
    <div class="plugin-list" v-if="plugins.length > 0">
      <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
        <div class="plugin-header">
          <h3>{{ plugin.name }}</h3>
          <span class="version">v{{ plugin.version }}</span>
        </div>
        <p class="description">{{ plugin.description }}</p>
        <div class="plugin-status" :class="plugin.status">
          {{ plugin.status }}
        </div>
      </div>
    </div>
    <div v-else class="empty">
      <p>{{ t('plugins.noPlugins') }}</p>
      <p class="hint">{{ t('plugins.hint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
}

const plugins = ref<Plugin[]>([]);

onMounted(async () => {
  initLocale();
  try {
    const res = await fetch('/api/plugins');
    if (res.ok) {
      plugins.value = await res.json();
    }
  } catch (e) {
    console.error('Failed to load plugins');
  }
});
</script>

<style scoped>
.plugins-page {
  padding: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 var(--space-xl);
  font-size: var(--font-3xl);
  color: var(--text-primary);
}

.plugin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

.plugin-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding-md);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.plugin-header h3 {
  margin: 0;
  font-size: var(--font-md);
  color: var(--text-primary);
}

.version {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.description {
  margin: 0 0 var(--space-md);
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.plugin-status {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-xs);
  border-radius: var(--radius-sm);
  background: var(--border-primary);
  color: var(--text-secondary);
}

.plugin-status.loaded {
  background: rgba(84, 232, 138, 0.1);
  color: var(--accent-success);
}

.plugin-status.error {
  background: rgba(232, 84, 84, 0.1);
  color: var(--accent-danger);
}

.empty {
  text-align: center;
  padding: calc(var(--space-xl) * 2);
  color: var(--text-secondary);
}

.empty p {
  margin: 0 0 var(--space-sm);
}

.hint {
  font-size: var(--font-base);
  color: var(--text-tertiary);
}
</style>
