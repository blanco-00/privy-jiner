<template>
  <div class="monitor-page">
    <h1>{{ t('monitor.title') }}</h1>

    <div class="stats-grid">
      <div class="card">
        <h2>{{ t('monitor.database') }}</h2>
        <div class="stat-row">
          <span>{{ t('monitor.size') }}</span>
          <span class="value">{{ formatBytes(stats.database?.size || 0) }}</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.tables') }}</span>
          <span class="value">{{ stats.database?.tableCount || 0 }}</span>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('monitor.system') }}</h2>
        <div class="stat-row">
          <span>{{ t('monitor.cpu') }}</span>
          <span class="value">{{ stats.system?.cpu?.usage || 0 }}% ({{ stats.system?.cpu?.cores || 0 }} cores)</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.memory') }}</span>
          <span class="value">{{ formatBytes(stats.system?.memory?.used || 0) }} / {{ formatBytes(stats.system?.memory?.total || 0) }} ({{ stats.system?.memory?.percent || 0 }}%)</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.disk') }}</span>
          <span class="value">{{ formatBytes(stats.system?.disk?.used || 0) }} / {{ formatBytes(stats.system?.disk?.total || 0) }} ({{ stats.system?.disk?.percent || 0 }}%)</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.uptime') }}</span>
          <span class="value">{{ formatUptime(stats.system?.uptime || 0) }}</span>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('monitor.api') }}</h2>
        <div class="stat-row">
          <span>{{ t('monitor.totalRequests') }}</span>
          <span class="value">{{ stats.api?.totalRequests || 0 }}</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.avgResponseTime') }}</span>
          <span class="value">{{ stats.api?.avgResponseTime || 0 }}ms</span>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('monitor.aiUsage') }}</h2>
        <div class="stat-row">
          <span>{{ t('monitor.totalCalls') }}</span>
          <span class="value">{{ aiUsage?.totalCalls || 0 }}</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.totalTokens') }}</span>
          <span class="value">{{ aiUsage?.totalTokens || 0 }}</span>
        </div>
        <div class="stat-row">
          <span>{{ t('monitor.totalCost') }}</span>
          <span class="value">${{ (aiUsage?.totalCost || 0).toFixed(4) }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>{{ t('monitor.databaseTables') }}</h2>
      <div class="table-list">
        <div v-for="table in stats.database?.tables || []" :key="table.name" class="table-item">
          <span class="table-name">{{ table.name }}</span>
          <span class="table-count">{{ table.count }} rows</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const stats = ref<any>({});
const aiUsage = ref<any>({});

onMounted(() => {
  initLocale();
  loadStats();
});

async function loadStats() {
  try {
    stats.value = await (await fetch('/api/monitoring/monitoring/all')).json();
    aiUsage.value = await (await fetch('/api/ai/ai/usage?days=7')).json();
  } catch (e) {
    console.error('Failed to load stats');
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
</script>

<style scoped>
.monitor-page {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

h2 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #888;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #242424;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row span:first-child {
  color: #888;
  font-size: 13px;
}

.stat-row .value {
  color: #e8a854;
  font-size: 13px;
  font-weight: 500;
}

.table-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.table-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #242424;
  border-radius: 6px;
}

.table-name {
  color: #f5f5f5;
  font-size: 13px;
}

.table-count {
  color: #888;
  font-size: 12px;
}
</style>
