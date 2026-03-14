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
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 32px;
  font-size: 28px;
  color: #f5f5f5;
}

.plugin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.plugin-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plugin-header h3 {
  margin: 0;
  font-size: 16px;
  color: #f5f5f5;
}

.version {
  font-size: 12px;
  color: #888;
}

.description {
  margin: 0 0 16px;
  font-size: 14px;
  color: #888;
}

.plugin-status {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  background: #333;
  color: #888;
}

.plugin-status.loaded {
  background: rgba(84, 232, 138, 0.1);
  color: #54e88a;
}

.plugin-status.error {
  background: rgba(232, 84, 84, 0.1);
  color: #e85454;
}

.empty {
  text-align: center;
  padding: 64px;
  color: #888;
}

.empty p {
  margin: 0 0 8px;
}

.hint {
  font-size: 14px;
  color: #666;
}
</style>
