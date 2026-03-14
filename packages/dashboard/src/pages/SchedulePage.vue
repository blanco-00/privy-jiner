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
  padding: 32px;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.current-month {
  font-size: 20px;
  font-weight: 600;
  color: #f5f5f5;
  min-width: 100px;
  text-align: center;
}

.btn-nav {
  padding: 8px 16px;
  font-size: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
  cursor: pointer;
}

.btn-primary {
  margin-left: auto;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  background: #e8a854;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.calendar {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekdays span {
  text-align: center;
  padding: 8px;
  color: #888;
  font-weight: 600;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  min-height: 80px;
  padding: 4px;
  background: #242424;
  border-radius: 8px;
  cursor: pointer;
}

.day:hover {
  background: #333;
}

.day.other-month {
  opacity: 0.4;
}

.day.today {
  border: 2px solid #e8a854;
}

.day-number {
  font-size: 12px;
  color: #888;
}

.day-events {
  margin-top: 4px;
}

.event {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
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
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form input, .form textarea, .form select {
  padding: 12px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  background: #333;
  color: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
