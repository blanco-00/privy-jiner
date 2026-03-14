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

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
}

.form-row label {
  color: #888;
  font-size: 14px;
}

input, select, textarea {
  padding: 12px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
}

input:focus, select:focus, textarea:focus {
  border-color: #e8a854;
  outline: none;
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
  margin-top: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.metric-item {
  background: #242424;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.metric-label {
  display: block;
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  color: #e8a854;
  font-size: 20px;
  font-weight: 600;
}

.metric-date {
  display: block;
  color: #666;
  font-size: 11px;
  margin-top: 4px;
}
</style>
