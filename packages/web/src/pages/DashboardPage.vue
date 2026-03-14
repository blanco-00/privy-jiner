<template>
  <div class="dashboard-page">
    <PageHeader
      :title="t('dashboard.title')"
      :subtitle="t('dashboard.subtitle')"
    />
    
    <div class="stats">
      <StatCard
        :label="t('dashboard.financeBalance')"
        value="$0"
        icon="💰"
      />
      <StatCard
        :label="t('dashboard.water')"
        value="0"
        icon="💧"
      />
      <StatCard
        :label="t('dashboard.steps')"
        value="0"
        icon="👟"
      />
      <StatCard
        :label="t('dashboard.clothes')"
        value="0"
        icon="👔"
      />
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
        <Card variant="content">
          <h3>{{ t('dashboard.guide1Title') }}</h3>
          <p>{{ t('dashboard.guide1Desc') }}</p>
        </Card>
        <Card variant="content">
          <h3>{{ t('dashboard.guide2Title') }}</h3>
          <p>{{ t('dashboard.guide2Desc') }}</p>
        </Card>
        <Card variant="content">
          <h3>{{ t('dashboard.guide3Title') }}</h3>
          <p>{{ t('dashboard.guide3Desc') }}</p>
        </Card>
        <Card variant="content">
          <h3>{{ t('dashboard.guide4Title') }}</h3>
          <p>{{ t('dashboard.guide4Desc') }}</p>
        </Card>
      </div>
    </div>

    <div class="section">
      <h2>System Status</h2>
      <Card variant="content">
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
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/Card.vue';
import StatCard from '../components/StatCard.vue';

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
  padding: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin: 0 0 var(--space-4);
  font-size: var(--font-lg);
  color: var(--text-secondary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-10);
}

.section {
  margin-bottom: var(--space-10);
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5);
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-icon {
  font-size: var(--font-xl);
}

.guide-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.guide-cards h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-md);
  color: var(--accent-primary);
}

.guide-cards p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-primary);
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: var(--text-secondary);
}

.status-value {
  color: var(--text-primary);
}

.status-value.success {
  color: var(--accent-success);
}
</style>
