<template>
  <div class="profile-page">
    <h1>{{ t('profile.title') }}</h1>
    
    <div class="card">
      <h2>{{ t('profile.personalInfo') }}</h2>
      <form @submit.prevent="saveProfile" class="form">
        <div class="form-row">
          <label>{{ t('profile.name') }}</label>
          <input v-model="profile.name" type="text" required />
        </div>
        <div class="form-row">
          <label>{{ t('profile.birthday') }}</label>
          <input v-model="profile.birthday" type="date" />
        </div>
        <div class="form-row">
          <label>{{ t('profile.height') }} (cm)</label>
          <input v-model.number="profile.height" type="number" />
        </div>
        <div class="form-row">
          <label>{{ t('profile.weight') }} (kg)</label>
          <input v-model.number="profile.weight" type="number" />
        </div>
        <div class="form-row">
          <label>{{ t('profile.bloodType') }}</label>
          <select v-model="profile.blood_type">
            <option value="">--</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>
        <div class="form-row">
          <label>{{ t('profile.notes') }}</label>
          <textarea v-model="profile.notes" rows="3"></textarea>
        </div>
        <button type="submit" class="btn-primary">{{ t('profile.save') }}</button>
      </form>
    </div>

    <div class="card">
      <h2>{{ t('profile.healthMetrics') }}</h2>
      <div class="metrics-grid">
        <div v-for="(value, key) in latestMetrics" :key="key" class="metric-item">
          <span class="metric-label">{{ key }}</span>
          <span class="metric-value">{{ value?.value || '-' }}</span>
          <span class="metric-date">{{ value?.recorded_at }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const profile = reactive({
  name: '',
  birthday: '',
  height: null as number | null,
  weight: null as number | null,
  blood_type: '',
  notes: '',
});

const latestMetrics = ref<Record<string, any>>({});

onMounted(() => {
  initLocale();
  loadProfile();
  loadMetrics();
});

async function loadProfile() {
  try {
    const res = await fetch('/api/profile/profile');
    const data = await res.json();
    if (data) {
      profile.name = data.name || '';
      profile.birthday = data.birthday || '';
      profile.height = data.height;
      profile.weight = data.weight;
      profile.blood_type = data.blood_type || '';
      profile.notes = data.notes || '';
    }
  } catch (e) {
    console.error('Failed to load profile');
  }
}

async function loadMetrics() {
  try {
    const res = await fetch('/api/profile/health-metrics?limit=10');
    const data = await res.json();
    const grouped: Record<string, any> = {};
    data.forEach((m: any) => {
      if (!grouped[m.type] || m.recorded_at > grouped[m.type].recorded_at) {
        grouped[m.type] = m;
      }
    });
    latestMetrics.value = grouped;
  } catch (e) {
    console.error('Failed to load metrics');
  }
}

async function saveProfile() {
  try {
    if (profile.name) {
      await fetch('/api/profile', {
        method: profile.name ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } else {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User' }),
      });
    }
  } catch (e) {
    console.error('Failed to save profile');
  }
}
</script>

<style scoped>
.profile-page {
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

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding-md);
  margin-bottom: var(--space-lg);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--input-padding);
  align-items: center;
}

.form-row label {
  color: var(--text-secondary);
  font-size: var(--font-base);
}

input, select, textarea {
  padding: var(--input-padding);
  font-size: var(--font-base);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--input-border-radius);
  color: var(--text-primary);
}

input:focus, select:focus, textarea:focus {
  border-color: var(--border-focus);
  outline: none;
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
  margin-top: var(--input-padding);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--input-padding);
}

.metric-item {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--input-padding);
  text-align: center;
}

.metric-label {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-xs);
  margin-bottom: var(--space-xs);
}

.metric-value {
  display: block;
  color: var(--accent-primary);
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
}

.metric-date {
  display: block;
  color: var(--text-tertiary);
  font-size: var(--font-xs);
  margin-top: var(--space-xs);
}
</style>
