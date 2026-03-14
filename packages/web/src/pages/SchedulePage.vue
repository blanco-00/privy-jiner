<template>
  <div class="schedule-page">
    <h1>{{ t('schedule.title') }}</h1>

    <div class="toolbar">
      <button @click="prevMonth" class="btn-nav">◀</button>
      <span class="current-month">{{ currentYear }}-{{ String(currentMonth).padStart(2, '0') }}</span>
      <button @click="nextMonth" class="btn-nav">▶</button>
      <button @click="showAddModal = true" class="btn-primary">{{ t('schedule.addEvent') }}</button>
    </div>

    <div class="calendar">
      <div class="weekdays">
        <span v-for="d in ['日', '一', '二', '三', '四', '五', '六']" :key="d">{{ d }}</span>
      </div>
      <div class="days">
        <div v-for="day in calendarDays" :key="day.date" class="day" :class="{ 'other-month': !day.isCurrentMonth, 'today': day.isToday }" @click="selectDate(day.date)">
          <span class="day-number">{{ day.day }}</span>
          <div class="day-events">
            <div v-for="event in day.events" :key="event.id" class="event" :style="{ background: event.color }" @click.stop="viewEvent(event)">
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>{{ t('schedule.addEvent') }}</h3>
        <form @submit.prevent="saveEvent" class="form">
          <input v-model="form.title" type="text" :placeholder="t('schedule.eventTitle')" required />
          <textarea v-model="form.description" :placeholder="t('schedule.description')" rows="2"></textarea>
          <input v-model="form.start_time" type="datetime-local" required />
          <input v-model="form.end_time" type="datetime-local" />
          <input v-model="form.location" type="text" :placeholder="t('schedule.location')" />
          <select v-model="form.recurrence">
            <option value="">{{ t('schedule.noRepeat') }}</option>
            <option value="daily">{{ t('schedule.daily') }}</option>
            <option value="weekly">{{ t('schedule.weekly') }}</option>
            <option value="monthly">{{ t('schedule.monthly') }}</option>
          </select>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-cancel">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn-primary">{{ t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const schedules = ref<any[]>([]);
const showAddModal = ref(false);

const form = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  recurrence: '',
});

const calendarDays = computed(() => {
  const days: any[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value, 0);
  const startPadding = firstDay.getDay();
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(currentYear.value, currentMonth.value - 1, -i);
    days.push({
      date: d.toISOString().split('T')[0],
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }
  
  const today = new Date().toISOString().split('T')[0];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = schedules.value.filter(s => s.start_time.startsWith(dateStr));
    days.push({
      date: dateStr,
      day: i,
      isCurrentMonth: true,
      isToday: dateStr === today,
      events: dayEvents,
    });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date: d.toISOString().split('T')[0],
      day: i,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }
  
  return days;
});

onMounted(() => {
  initLocale();
  loadSchedules();
});

async function loadSchedules() {
  try {
    const startDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-01`;
    const endDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-31`;
    schedules.value = await (await fetch(`/api/schedules/schedules?startDate=${startDate}&endDate=${endDate}`)).json();
  } catch (e) {
    console.error('Failed to load schedules');
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadSchedules();
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadSchedules();
}

function selectDate(date: string) {
  form.value.start_time = date + 'T09:00';
}

function viewEvent(event: any) {
  alert(`${event.title}\n${event.description || ''}\n${event.location || ''}`);
}

async function saveEvent() {
  try {
    await fetch('/api/schedules/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });
    showAddModal.value = false;
    form.value = { title: '', description: '', start_time: '', end_time: '', location: '', recurrence: '' };
    loadSchedules();
  } catch (e) {
    console.error('Failed to save event');
  }
}
</script>

<style scoped>
.schedule-page {
  padding: var(--space-xl);
}

h1 {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-3xl);
  color: var(--text-primary);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--input-padding);
  margin-bottom: var(--space-lg);
}

.current-month {
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  min-width: 100px;
  text-align: center;
}

.btn-nav {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-base);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
}

.btn-primary {
  margin-left: auto;
  padding: var(--input-padding) var(--space-lg);
  font-size: var(--font-base);
  font-weight: var(--weight-semibold);
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.calendar {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding-md);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.weekdays span {
  text-align: center;
  padding: var(--space-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-semibold);
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
}

.day {
  min-height: 80px;
  padding: var(--space-xs);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.day:hover {
  background: var(--border-primary);
}

.day.other-month {
  opacity: 0.4;
}

.day.today {
  border: 2px solid var(--accent-primary);
}

.day-number {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.day-events {
  margin-top: var(--space-xs);
}

.event {
  font-size: 10px;
  padding: 2px var(--space-xs);
  border-radius: var(--space-xs);
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 400px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--input-padding);
}

.form input, .form textarea, .form select {
  padding: var(--input-padding);
  font-size: var(--font-base);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: var(--input-padding);
  margin-top: var(--input-padding);
}

.btn-cancel {
  flex: 1;
  padding: var(--input-padding);
  font-size: var(--font-base);
  background: var(--border-primary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
