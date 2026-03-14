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
.knowledge-page { padding: 32px; max-width: 900px; margin: 0 auto; }
h1 { margin: 0 0 24px; font-size: 28px; color: #f5f5f5; }
h2 { margin: 0 0 16px; font-size: 18px; color: #888; }

.card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.form { display: flex; flex-direction: column; gap: 12px; }
.form input, .form select, .form textarea { padding: 12px; background: #242424; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; }
.btn-primary { padding: 12px; background: #e8a854; color: #0f0f0f; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-secondary { padding: 10px 20px; background: #333; color: #f5f5f5; border: none; border-radius: 8px; cursor: pointer; }
.btn-delete { background: #e85454; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; }

.random-card { margin-top: 16px; background: #242424; padding: 20px; border-radius: 8px; }
.random-title { font-size: 18px; font-weight: 600; color: #e8a854; margin-bottom: 8px; }
.random-content { color: #f5f5f5; margin-bottom: 8px; }
.random-meta { font-size: 12px; color: #888; }

.search-bar { margin-bottom: 16px; }
.search-input { width: 100%; padding: 12px; background: #242424; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; }

.item-list { display: flex; flex-direction: column; gap: 12px; }
.item-card { background: #242424; padding: 16px; border-radius: 8px; }
.item-title { font-weight: 600; color: #f5f5f5; margin-bottom: 4px; }
.item-content { font-size: 13px; color: #888; margin-bottom: 8px; }
.item-meta { display: flex; justify-content: space-between; align-items: center; }
.item-category { font-size: 12px; color: #e8a854; }

.empty { text-align: center; padding: 32px; color: #666; }
</style>
