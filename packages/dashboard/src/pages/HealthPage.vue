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
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #888;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 16px;
  font-size: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #242424;
  color: #f5f5f5;
}

.tab.active {
  background: #e8a854;
  color: #0f0f0f;
  border-color: #e8a854;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 24px;
  font-weight: 700;
  color: #e8a854;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

.progress-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  margin-top: 12px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #54a8e8, #54e88a);
  transition: width 0.3s;
}

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.btn-water {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  background: #242424;
  color: #54a8e8;
  border: 1px solid #333;
  border-radius: 8px;
  cursor: pointer;
}

.btn-water:hover {
  background: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

input, select {
  padding: 12px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
  outline: none;
}

input:focus, select:focus {
  border-color: #e8a854;
}

.btn-primary {
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  background: #e8a854;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.activity-list, .reminder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #242424;
  border-radius: 8px;
}

.time {
  margin-left: auto;
  color: #666;
  font-size: 13px;
}

/* Reminder Styles */
.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #242424;
  border-radius: 8px;
  border-left: 3px solid #e8a854;
}

.reminder-item.inactive {
  opacity: 0.5;
  border-left-color: #666;
}

.reminder-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reminder-icon {
  font-size: 24px;
}

.reminder-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reminder-title {
  color: #f5f5f5;
  font-size: 14px;
  font-weight: 500;
}

.reminder-time {
  color: #888;
  font-size: 12px;
}

.reminder-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-toggle {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: #54e88a;
  color: #0f0f0f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-toggle.active {
  background: #54e88a;
}

.btn-toggle:not(.active) {
  background: #666;
  color: #f5f5f5;
}

.btn-delete {
  width: 28px;
  height: 28px;
  font-size: 14px;
  background: transparent;
  color: #e85454;
  border: 1px solid #e85454;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  text-align: center;
  padding: 32px;
  color: #666;
}
</style>
