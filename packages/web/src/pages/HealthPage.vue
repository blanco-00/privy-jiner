<template>
  <div class="health-page">
    <h1>{{ t('health.title') }}</h1>

    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ t(tab.label) }}
      </button>
    </div>

    <div class="tab-content">
      
      <!-- Water & Exercise Tab -->
      <div v-if="activeTab === 'activity'" class="tab-pane">
        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon">💧</div>
            <div class="stat-value">{{ health.water.today }}ml</div>
            <div class="stat-label">{{ t('health.water') }} ({{ t('health.waterGoal') }}: {{ health.water.goal }}ml)</div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: waterPercent + '%' }"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👟</div>
            <div class="stat-value">{{ health.exercise.duration }}{{ t('health.minutes') }}</div>
            <div class="stat-label">{{ t('health.exercise') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ health.exercise.calories }}</div>
            <div class="stat-label">{{ t('health.calories') }}</div>
          </div>
        </div>

        <div class="card">
          <h2>{{ t('health.logWater') }}</h2>
          <div class="quick-buttons">
            <button v-for="amt in [100, 200, 300, 500]" :key="amt" @click="addWater(amt)" class="btn-water">
              +{{ amt }}ml
            </button>
          </div>
          <form @submit.prevent="addWaterCustom" class="form">
            <input v-model.number="customWater" type="number" placeholder="ml" />
            <button type="submit" class="btn-primary">{{ t('health.addCustom') }}</button>
          </form>
        </div>

        <div class="card">
          <h2>{{ t('health.logExercise') }}</h2>
          <form @submit.prevent="addExercise" class="form">
            <div class="form-row">
              <select v-model="newExercise.type" required>
                <option value="walking">Walking</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="workout">Workout</option>
                <option value="yoga">Yoga</option>
                <option value="other">Other</option>
              </select>
              <input v-model.number="newExercise.duration" type="number" :placeholder="t('health.duration') + ' (min)'" required />
            </div>
            <div class="form-row">
              <input v-model.number="newExercise.calories" type="number" :placeholder="t('health.calories')" />
              <input v-model.number="newExercise.steps" type="number" :placeholder="t('health.steps')" />
            </div>
            <button type="submit" class="btn-primary">{{ t('health.logExercise') }}</button>
          </form>
        </div>

        <div class="card">
          <h2>{{ t('health.recentActivity') }}</h2>
          <div class="activity-list">
            <div v-for="log in waterLogs" :key="log.id" class="activity-item">
              <span>💧</span>
              <span>{{ log.amount }}ml</span>
              <span class="time">{{ formatDate(log.date) }}</span>
            </div>
            <div v-for="log in exerciseLogs" :key="log.id" class="activity-item">
              <span>👟</span>
              <span>{{ log.type }} - {{ log.duration }}{{ t('health.minutes') }}</span>
              <span class="time">{{ formatDate(log.date) }}</span>
            </div>
            <div v-if="waterLogs.length === 0 && exerciseLogs.length === 0" class="empty">
              {{ t('health.noActivity') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Reminders Tab -->
      <div v-if="activeTab === 'reminders'" class="tab-pane">
        <div class="card">
          <h2>{{ t('health.addReminder') }}</h2>
          <form @submit.prevent="createReminder" class="form">
            <div class="form-row">
              <select v-model="newReminder.type" required>
                <option value="water">{{ t('health.water') }}</option>
                <option value="medicine">{{ t('health.medicine') }}</option>
                <option value="exercise">{{ t('health.exercise') }}</option>
                <option value="sleep">{{ t('health.sleep') }}</option>
                <option value="custom">{{ t('health.custom') }}</option>
              </select>
              <input v-model="newReminder.time" type="time" required />
            </div>
            <div class="form-row">
              <input v-model="newReminder.title" type="text" :placeholder="t('health.reminderTitle')" required />
              <select v-model="newReminder.repeat">
                <option value="">{{ t('health.once') }}</option>
                <option value="daily">{{ t('health.daily') }}</option>
                <option value="weekly">{{ t('health.weekly') }}</option>
              </select>
            </div>
            <input v-model="newReminder.message" type="text" :placeholder="t('health.reminderMessage')" />
            <button type="submit" class="btn-primary">{{ t('health.addReminder') }}</button>
          </form>
        </div>

        <div class="card">
          <h2>{{ t('health.reminders') }}</h2>
          <div class="reminder-list">
            <div v-for="reminder in reminders" :key="reminder.id" class="reminder-item" :class="{ inactive: !reminder.is_active }">
              <div class="reminder-info">
                <span class="reminder-icon">{{ getReminderIcon(reminder.type) }}</span>
                <div class="reminder-details">
                  <span class="reminder-title">{{ reminder.title }}</span>
                  <span class="reminder-time">{{ reminder.time }} - {{ reminder.repeat || t('health.once') }}</span>
                </div>
              </div>
              <div class="reminder-actions">
                <button @click="toggleReminder(reminder.id)" :class="['btn-toggle', { active: reminder.is_active }]">
                  {{ reminder.is_active ? 'ON' : 'OFF' }}
                </button>
                <button @click="deleteReminder(reminder.id)" class="btn-delete">✕</button>
              </div>
            </div>
            <div v-if="reminders.length === 0" class="empty">
              {{ t('health.noReminders') }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const tabs = [
  { id: 'activity', label: 'health.activity', icon: '💪' },
  { id: 'reminders', label: 'health.reminders', icon: '⏰' },
];

const activeTab = ref('activity');

interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string | null;
  time: string;
  repeat: string | null;
  is_active: boolean;
}

const health = ref({
  water: { today: 0, goal: 2000 },
  exercise: { duration: 0, calories: 0, steps: 0 },
});

const waterLogs = ref<any[]>([]);
const exerciseLogs = ref<any[]>([]);
const reminders = ref<Reminder[]>([]);
const customWater = ref(0);

const newExercise = reactive({
  type: 'walking',
  duration: 0,
  calories: 0,
  steps: 0,
});

const newReminder = reactive({
  type: 'water',
  title: '',
  message: '',
  time: '09:00',
  repeat: '',
});

const waterPercent = computed(() => {
  return Math.min((health.value.water.today / health.value.water.goal) * 100, 100);
});

onMounted(() => {
  initLocale();
  loadSummary();
  loadLogs();
  loadReminders();
});

async function loadSummary() {
  try {
    const res = await fetch('/api/health/summary');
    health.value = await res.json();
  } catch (e) {
    console.error('Failed to load health');
  }
}

async function loadLogs() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [waterRes, exerciseRes] = await Promise.all([
      fetch(`/api/health/water?date=${today}`),
      fetch(`/api/health/exercise?date=${today}`),
    ]);
    waterLogs.value = await waterRes.json();
    exerciseLogs.value = await exerciseRes.json();
  } catch (e) {
    console.error('Failed to load logs');
  }
}

async function loadReminders() {
  try {
    const res = await fetch('/api/health/reminders');
    reminders.value = await res.json();
  } catch (e) {
    console.error('Failed to load reminders');
  }
}

async function addWater(amount: number) {
  try {
    await fetch('/api/health/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    await loadSummary();
    await loadLogs();
  } catch (e) {
    console.error('Failed to add water');
  }
}

async function addWaterCustom() {
  if (!customWater.value) return;
  await addWater(customWater.value);
  customWater.value = 0;
}

async function addExercise() {
  if (!newExercise.duration) return;

  try {
    await fetch('/api/health/exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise),
    });
    
    newExercise.duration = 0;
    newExercise.calories = 0;
    newExercise.steps = 0;
    await loadSummary();
    await loadLogs();
  } catch (e) {
    console.error('Failed to add exercise');
  }
}

async function createReminder() {
  if (!newReminder.title || !newReminder.time) return;

  try {
    await fetch('/api/health/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReminder),
    });
    
    newReminder.title = '';
    newReminder.message = '';
    await loadReminders();
  } catch (e) {
    console.error('Failed to create reminder');
  }
}

async function toggleReminder(id: string) {
  try {
    await fetch(`/api/health/reminders/${id}/toggle`, { method: 'POST' });
    await loadReminders();
  } catch (e) {
    console.error('Failed to toggle reminder');
  }
}

async function deleteReminder(id: string) {
  try {
    await fetch(`/api/health/reminders/${id}`, { method: 'DELETE' });
    await loadReminders();
  } catch (e) {
    console.error('Failed to delete reminder');
  }
}

function formatDate(date: string): string {
  return date?.split('-').slice(1).join('/') || '';
}

function getReminderIcon(type: string): string {
  const icons: Record<string, string> = {
    water: '💧',
    medicine: '💊',
    exercise: '👟',
    sleep: '😴',
    custom: '🔔',
  };
  return icons[type] || '🔔';
}
</script>

<style scoped>
.health-page {
  padding: var(--space-xl);
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-3xl);
  color: var(--text-primary);
}

h2 {
  margin: 0 0 var(--space-md);
  font-size: var(--font-lg);
  color: var(--text-secondary);
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.tab {
  padding: 10px var(--space-md);
  font-size: var(--font-base);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab.active {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding-md);
  text-align: center;
}

.stat-icon {
  font-size: var(--font-2xl);
  margin-bottom: var(--space-sm);
}

.stat-value {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: var(--accent-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.progress-bar {
  height: var(--space-sm);
  background: var(--border-primary);
  border-radius: var(--radius-sm);
  margin-top: var(--space-md);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-info), var(--accent-success));
  transition: width var(--transition-slow);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding-md);
  margin-bottom: var(--space-lg);
}

.quick-buttons {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.btn-water {
  flex: 1;
  padding: var(--input-padding);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  background: var(--bg-tertiary);
  color: var(--accent-info);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn-water:hover {
  background: var(--border-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--input-padding);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--input-padding);
}

input, select {
  padding: var(--input-padding);
  font-size: var(--font-base);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--input-border-radius);
  color: var(--text-primary);
  outline: none;
}

input:focus, select:focus {
  border-color: var(--border-focus);
}

.btn-primary {
  padding: var(--input-padding);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.activity-list, .reminder-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--input-padding);
  padding: var(--input-padding);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.time {
  margin-left: auto;
  color: var(--text-tertiary);
  font-size: var(--font-sm);
}

/* Reminder Styles */
.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-primary);
}

.reminder-item.inactive {
  opacity: 0.5;
  border-left-color: var(--text-tertiary);
}

.reminder-info {
  display: flex;
  align-items: center;
  gap: var(--input-padding);
}

.reminder-icon {
  font-size: var(--font-2xl);
}

.reminder-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.reminder-title {
  color: var(--text-primary);
  font-size: var(--font-base);
  font-weight: var(--weight-medium);
}

.reminder-time {
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

.reminder-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.btn-toggle {
  padding: 6px var(--input-padding);
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  background: var(--accent-success);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-toggle.active {
  background: var(--accent-success);
}

.btn-toggle:not(.active) {
  background: var(--text-tertiary);
  color: var(--text-primary);
}

.btn-delete {
  width: 28px;
  height: 28px;
  font-size: var(--font-base);
  background: transparent;
  color: var(--accent-danger);
  border: 1px solid var(--accent-danger);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-tertiary);
}
</style>
