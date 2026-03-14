<template>
  <div class="tasks-page">
    <h1>{{ t('tasks.title') }}</h1>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">{{ t('tasks.total') }}</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">{{ t('tasks.pending') }}</div>
      </div>
      <div class="stat-card progress">
        <div class="stat-value">{{ stats.in_progress }}</div>
        <div class="stat-label">{{ t('tasks.inProgress') }}</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">{{ t('tasks.completed') }}</div>
      </div>
      <div class="stat-card overdue">
        <div class="stat-value">{{ stats.overdue }}</div>
        <div class="stat-label">{{ t('tasks.overdue') }}</div>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="filterStatus" @change="loadTasks" class="filter-select">
        <option value="">{{ t('tasks.allStatus') }}</option>
        <option value="pending">{{ t('tasks.pending') }}</option>
        <option value="in_progress">{{ t('tasks.inProgress') }}</option>
        <option value="completed">{{ t('tasks.completed') }}</option>
      </select>
      <select v-model="filterPriority" @change="loadTasks" class="filter-select">
        <option value="">{{ t('tasks.allPriority') }}</option>
        <option value="urgent">{{ t('tasks.urgent') }}</option>
        <option value="high">{{ t('tasks.high') }}</option>
        <option value="medium">{{ t('tasks.medium') }}</option>
        <option value="low">{{ t('tasks.low') }}</option>
      </select>
      <button @click="showAddModal = true" class="btn-primary">{{ t('tasks.addTask') }}</button>
    </div>

    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-item" :class="{ completed: task.status === 'completed', overdue: isOverdue(task) }">
        <div class="task-check">
          <input type="checkbox" :checked="task.status === 'completed'" @change="toggleComplete(task)" />
        </div>
        <div class="task-content">
          <span class="task-title">{{ task.title }}</span>
          <span class="task-meta">
            <span class="priority-badge" :class="task.priority">{{ t('tasks.' + task.priority) }}</span>
            <span v-if="task.due_date" class="due-date">{{ task.due_date }}</span>
          </span>
        </div>
        <div class="task-actions">
          <button @click="editTask(task)" class="btn-small">✏️</button>
          <button @click="deleteTask(task.id)" class="btn-delete">✕</button>
        </div>
      </div>
      <div v-if="tasks.length === 0" class="empty">{{ t('tasks.noTasks') }}</div>
    </div>

    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>{{ editingTask ? t('tasks.editTask') : t('tasks.addTask') }}</h3>
        <form @submit.prevent="saveTask" class="form">
          <input v-model="form.title" type="text" :placeholder="t('tasks.taskTitle')" required />
          <textarea v-model="form.description" :placeholder="t('tasks.description')" rows="2"></textarea>
          <div class="form-row">
            <select v-model="form.priority">
              <option value="low">{{ t('tasks.low') }}</option>
              <option value="medium">{{ t('tasks.medium') }}</option>
              <option value="high">{{ t('tasks.high') }}</option>
              <option value="urgent">{{ t('tasks.urgent') }}</option>
            </select>
            <input v-model="form.due_date" type="date" />
          </div>
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
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const tasks = ref<any[]>([]);
const stats = ref({ total: 0, pending: 0, in_progress: 0, completed: 0, overdue: 0 });
const filterStatus = ref('');
const filterPriority = ref('');
const showAddModal = ref(false);
const editingTask = ref<any>(null);

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
});

onMounted(() => {
  initLocale();
  loadTasks();
  loadStats();
});

async function loadTasks() {
  try {
    let url = '/api/tasks/tasks?';
    if (filterStatus.value) url += `status=${filterStatus.value}&`;
    if (filterPriority.value) url += `priority=${filterPriority.value}`;
    tasks.value = await (await fetch(url)).json();
  } catch (e) {
    console.error('Failed to load tasks');
  }
}

async function loadStats() {
  try {
    stats.value = await (await fetch('/api/tasks/tasks/stats')).json();
  } catch (e) {
    console.error('Failed to load stats');
  }
}

function isOverdue(task: any): boolean {
  if (!task.due_date || task.status === 'completed') return false;
  return task.due_date < new Date().toISOString().split('T')[0];
}

function editTask(task: any) {
  editingTask.value = task;
  form.title = task.title;
  form.description = task.description || '';
  form.priority = task.priority;
  form.due_date = task.due_date || '';
  showAddModal.value = true;
}

async function saveTask() {
  try {
    if (editingTask.value) {
      await fetch(`/api/tasks/tasks/${editingTask.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/tasks/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    showAddModal.value = false;
    editingTask.value = null;
    Object.assign(form, { title: '', description: '', priority: 'medium', due_date: '' });
    loadTasks();
    loadStats();
  } catch (e) {
    console.error('Failed to save task');
  }
}

async function toggleComplete(task: any) {
  try {
    if (task.status === 'completed') {
      await fetch(`/api/tasks/tasks/${task.id}/reopen`, { method: 'POST' });
    } else {
      await fetch(`/api/tasks/tasks/${task.id}/complete`, { method: 'POST' });
    }
    loadTasks();
    loadStats();
  } catch (e) {
    console.error('Failed to toggle task');
  }
}

async function deleteTask(id: string) {
  if (!confirm('Delete this task?')) return;
  try {
    await fetch(`/api/tasks/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
    loadStats();
  } catch (e) {
    console.error('Failed to delete task');
  }
}
</script>

<style scoped>
.tasks-page {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #e8a854;
}

.stat-card.overdue .stat-value { color: #e85454; }
.stat-card.completed .stat-value { color: #54e88a; }

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-select {
  padding: 10px 16px;
  font-size: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.overdue {
  border-left: 3px solid #e85454;
}

.task-check input {
  width: 20px;
  height: 20px;
}

.task-content {
  flex: 1;
}

.task-title {
  display: block;
  color: #f5f5f5;
  font-size: 15px;
}

.task-item.completed .task-title {
  text-decoration: line-through;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #333;
  color: #888;
}

.priority-badge.urgent { background: #e85454; color: #fff; }
.priority-badge.high { background: #e8a854; color: #000; }
.priority-badge.medium { background: #54a8e8; color: #fff; }

.due-date {
  font-size: 12px;
  color: #666;
}

.task-item.overdue .due-date {
  color: #e85454;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.btn-small, .btn-delete {
  padding: 6px 10px;
  font-size: 12px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
}

.btn-delete {
  color: #e85454;
  border-color: #e85454;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.empty {
  text-align: center;
  padding: 48px;
  color: #666;
}
</style>
