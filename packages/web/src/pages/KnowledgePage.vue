<template>
  <div class="knowledge-page">
    <h1>{{ t('knowledge.title') }}</h1>
    
    <div class="card">
      <h2>{{ t('knowledge.randomKnowledge') }}</h2>
      <button @click="getRandom" class="btn-secondary">{{ t('knowledge.randomKnowledge') }}</button>
      <div v-if="randomItem" class="random-card">
        <div class="random-title">{{ randomItem.title }}</div>
        <div class="random-content">{{ randomItem.content }}</div>
        <div class="random-meta">{{ t('knowledge.' + randomItem.category) }} · {{ randomItem.source || '-' }}</div>
      </div>
    </div>

    <div class="card">
      <h2>{{ t('knowledge.addItem') }}</h2>
      <form @submit.prevent="addItem" class="form">
        <input v-model="newItem.title" :placeholder="t('fashion.name')" required />
        <textarea v-model="newItem.content" :placeholder="t('knowledge.content')" required rows="3"></textarea>
        <select v-model="newItem.category" required>
          <option value="">Category</option>
          <option value="history">{{ t('knowledge.history') }}</option>
          <option value="science">{{ t('knowledge.science') }}</option>
          <option value="life">{{ t('knowledge.life') }}</option>
          <option value="health">{{ t('health.title') }}</option>
          <option value="other">{{ t('knowledge.other') }}</option>
        </select>
        <input v-model="newItem.source" :placeholder="t('knowledge.source')" />
        <button type="submit" class="btn-primary">{{ t('knowledge.addItem') }}</button>
      </form>
    </div>

    <div class="card">
      <div class="search-bar">
        <input v-model="searchQuery" @input="onSearch" :placeholder="t('knowledge.search') + '...'" class="search-input" />
      </div>
      <div class="item-list">
        <div v-for="item in items" :key="item.id" class="item-card">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-content">{{ item.content.substring(0, 100) }}...</div>
          <div class="item-meta">
            <span class="item-category">{{ t('knowledge.' + item.category) }}</span>
            <button @click="deleteItem(item.id)" class="btn-delete">×</button>
          </div>
        </div>
        <div v-if="items.length === 0" class="empty">
          {{ t('knowledge.noItems') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string | null;
}

const items = ref<KnowledgeItem[]>([]);
const randomItem = ref<KnowledgeItem | null>(null);
const searchQuery = ref('');

const newItem = reactive({
  title: '',
  content: '',
  category: '',
  source: '',
});

onMounted(() => {
  initLocale();
  loadItems();
});

async function loadItems() {
  try {
    const res = await fetch('/api/knowledge/items');
    items.value = await res.json();
  } catch (e) {
    console.error('Failed to load items');
  }
}

async function addItem() {
  if (!newItem.title || !newItem.content || !newItem.category) return;
  
  try {
    await fetch('/api/knowledge/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    newItem.title = '';
    newItem.content = '';
    newItem.category = '';
    newItem.source = '';
    await loadItems();
  } catch (e) {
    console.error('Failed to add item');
  }
}

async function deleteItem(id: string) {
  try {
    await fetch(`/api/knowledge/items/${id}`, { method: 'DELETE' });
    await loadItems();
  } catch (e) {
    console.error('Failed to delete item');
  }
}

async function getRandom() {
  try {
    const res = await fetch('/api/knowledge/items/random');
    randomItem.value = await res.json();
  } catch (e) {
    console.error('Failed to get random');
  }
}

async function onSearch() {
  if (!searchQuery.value) {
    await loadItems();
    return;
  }
  try {
    const res = await fetch(`/api/knowledge/items/search?q=${encodeURIComponent(searchQuery.value)}`);
    items.value = await res.json();
  } catch (e) {
    console.error('Failed to search');
  }
}
</script>

<style scoped>
.knowledge-page { padding: var(--space-xl); max-width: 900px; margin: 0 auto; }
h1 { margin: 0 0 var(--space-lg); font-size: var(--font-3xl); color: var(--text-primary); }
h2 { margin: 0 0 var(--space-md); font-size: var(--font-lg); color: var(--text-secondary); }

.card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--card-padding-md); margin-bottom: var(--space-lg); }
.form { display: flex; flex-direction: column; gap: var(--input-padding); }
.form input, .form select, .form textarea { padding: var(--input-padding); background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); color: var(--text-primary); }
.btn-primary { padding: var(--input-padding); background: var(--accent-primary); color: var(--bg-primary); border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: var(--weight-semibold); }
.btn-secondary { padding: 10px var(--card-padding-md); background: var(--border-primary); color: var(--text-primary); border: none; border-radius: var(--radius-md); cursor: pointer; }
.btn-delete { background: var(--accent-danger); color: white; border: none; border-radius: var(--radius-sm); width: var(--space-lg); height: var(--space-lg); cursor: pointer; }

.random-card { margin-top: var(--space-md); background: var(--bg-tertiary); padding: var(--card-padding-md); border-radius: var(--radius-md); }
.random-title { font-size: var(--font-lg); font-weight: var(--weight-semibold); color: var(--accent-primary); margin-bottom: var(--space-sm); }
.random-content { color: var(--text-primary); margin-bottom: var(--space-sm); }
.random-meta { font-size: var(--font-xs); color: var(--text-secondary); }

.search-bar { margin-bottom: var(--space-md); }
.search-input { width: 100%; padding: var(--input-padding); background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); color: var(--text-primary); }

.item-list { display: flex; flex-direction: column; gap: var(--input-padding); }
.item-card { background: var(--bg-tertiary); padding: var(--space-md); border-radius: var(--radius-md); }
.item-title { font-weight: var(--weight-semibold); color: var(--text-primary); margin-bottom: var(--space-xs); }
.item-content { font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-sm); }
.item-meta { display: flex; justify-content: space-between; align-items: center; }
.item-category { font-size: var(--font-xs); color: var(--accent-primary); }

.empty { text-align: center; padding: var(--space-xl); color: var(--text-tertiary); }
</style>
