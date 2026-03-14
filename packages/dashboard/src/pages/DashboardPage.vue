<template>
  <div class="dashboard-page">
    <h1>{{ t('dashboard.title') }}</h1>
    <p class="subtitle">{{ t('dashboard.subtitle') }}</p>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">$0</div>
        <div class="stat-label">{{ t('dashboard.financeBalance') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💧</div>
        <div class="stat-value">0</div>
        <div class="stat-label">{{ t('dashboard.water') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👟</div>
        <div class="stat-value">0</div>
        <div class="stat-label">{{ t('dashboard.steps') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👔</div>
        <div class="stat-value">0</div>
        <div class="stat-label">{{ t('dashboard.clothes') }}</div>
      </div>
    </div>

    <div class="section">
      <h2>{{ t('dashboard.quickActions') }}</h2>
      <div class="actions">
        <button class="action-btn" @click="addRecord('finance')">
          <span class="action-icon">💰</span>
          <span>{{ t('dashboard.addExpense') }}</span>
        </button>
        <button class="action-btn" @click="addRecord('water')">
          <span class="action-icon">💧</span>
          <span>{{ t('dashboard.logWater') }}</span>
        </button>
        <button class="action-btn" @click="addRecord('exercise')">
          <span class="action-icon">👟</span>
          <span>{{ t('dashboard.logExercise') }}</span>
        </button>
        <button class="action-btn" @click="addRecord('outfit')">
          <span class="action-icon">👔</span>
          <span>{{ t('dashboard.logOutfit') }}</span>
        </button>
      </div>
    </div>

    <div class="section">
      <h2>{{ t('dashboard.gettingStarted') }}</h2>
      <div class="guide-cards">
        <div class="guide-card">
          <h3>{{ t('dashboard.guide1Title') }}</h3>
          <p>{{ t('dashboard.guide1Desc') }}</p>
        </div>
        <div class="guide-card">
          <h3>{{ t('dashboard.guide2Title') }}</h3>
          <p>{{ t('dashboard.guide2Desc') }}</p>
        </div>
        <div class="guide-card">
          <h3>{{ t('dashboard.guide3Title') }}</h3>
          <p>{{ t('dashboard.guide3Desc') }}</p>
        </div>
        <div class="guide-card">
          <h3>{{ t('dashboard.guide4Title') }}</h3>
          <p>{{ t('dashboard.guide4Desc') }}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>System Status</h2>
      <div class="status-card">
        <div class="status-item">
          <span class="status-label">Database</span>
          <span class="status-value success">Connected (SQLite)</span>
        </div>
        <div class="status-item">
          <span class="status-label">API Server</span>
          <span class="status-value success">Running</span>
        </div>
        <div class="status-item">
          <span class="status-label">Version</span>
          <span class="status-value">v0.1.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const stats = ref({
  plugins: 0,
  tasks: 0,
  sessions: 0,
});

function addRecord(type: string) {
  alert(`${type} recording coming soon! This feature requires plugin implementation.`);
}

onMounted(async () => {
  initLocale();
  try {
    const res = await fetch('/api/plugins');
    if (res.ok) {
      const data = await res.json();
      stats.value.plugins = data.length || 0;
    }
  } catch (e) {
    console.error('Failed to load stats');
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #f5f5f5;
}

.subtitle {
  margin: 0 0 32px;
  color: #888;
}

h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #888;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #e8a854;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

.section {
  margin-bottom: 40px;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  font-size: 14px;
  font-weight: 600;
  background: #1a1a1a;
  color: #f5f5f5;
  border: 1px solid #333;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #242424;
  border-color: #e8a854;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 24px;
}

.guide-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.guide-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.guide-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #e8a854;
}

.guide-card p {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}

.status-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #333;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #888;
}

.status-value {
  color: #f5f5f5;
}

.status-value.success {
  color: #54e88a;
}
</style>
