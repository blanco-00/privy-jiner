<template>
  <div class="fashion-page">
    <h1>{{ t('fashion.title') }}</h1>
    
    <div class="tabs">
      <button 
        v-for="tab in ['wardrobe', 'outfits']" 
        :key="tab"
        :class="['tab-btn', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ t('fashion.' + tab) }}
      </button>
    </div>

    <div v-if="currentTab === 'wardrobe'" class="tab-content">
      <div class="card">
        <h2>{{ t('fashion.addItem') }}</h2>
        <form @submit.prevent="addItem" class="form">
          <input v-model="newItem.name" :placeholder="t('fashion.name')" required />
          <select v-model="newItem.category" required>
            <option value="">{{ t('fashion.clothingCategory') }}</option>
            <option value="top">{{ t('fashion.top') }}</option>
            <option value="bottom">{{ t('fashion.bottom') }}</option>
            <option value="dress">{{ t('fashion.dress') }}</option>
            <option value="shoes">{{ t('fashion.shoes') }}</option>
            <option value="accessory">{{ t('fashion.accessory') }}</option>
            <option value="outerwear">{{ t('fashion.outerwear') }}</option>
            <option value="other">{{ t('fashion.other') }}</option>
          </select>
          <input v-model="newItem.color" :placeholder="t('fashion.color')" />
          <input v-model="newItem.brand" :placeholder="t('fashion.brand')" />
          <button type="submit" class="btn-primary">{{ t('fashion.addItem') }}</button>
        </form>
      </div>

      <div class="card">
        <div class="summary">
          <div class="stat">
            <span class="stat-value">{{ summary.total }}</span>
            <span class="stat-label">Total Items</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('fashion.wardrobe') }}</h2>
        <div class="item-grid">
          <div v-for="item in items" :key="item.id" class="item-card">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-category">{{ t('fashion.' + item.category) }}</div>
            <div class="item-actions">
              <button @click="deleteItem(item.id)" class="btn-delete">×</button>
            </div>
          </div>
          <div v-if="items.length === 0" class="empty">
            {{ t('knowledge.noItems') }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'outfits'" class="tab-content">
      <div class="card">
        <h2>{{ t('fashion.randomOutfit') }}</h2>
        <button @click="getRandomOutfit" class="btn-secondary">{{ t('fashion.randomOutfit') }}</button>
        <div v-if="randomOutfit" class="random-result">
          <div v-if="randomOutfit.top">{{ t('fashion.top') }}: {{ randomOutfit.top.name }}</div>
          <div v-if="randomOutfit.bottom">{{ t('fashion.bottom') }}: {{ randomOutfit.bottom.name }}</div>
          <div v-if="randomOutfit.shoes">{{ t('fashion.shoes') }}: {{ randomOutfit.shoes.name }}</div>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('fashion.outfits') }}</h2>
        <div class="outfit-list">
          <div v-for="outfit in outfits" :key="outfit.id" class="outfit-item">
            <span class="outfit-date">{{ outfit.date }}</span>
            <span class="outfit-occasion">{{ outfit.occasion || '-' }}</span>
          </div>
          <div v-if="outfits.length === 0" class="empty">
            {{ t('health.noActivity') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();
const currentTab = ref('wardrobe');

interface FashionItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
}

interface Outfit {
  id: string;
  date: string;
  occasion: string | null;
}

const items = ref<FashionItem[]>([]);
const outfits = ref<Outfit[]>([]);
const summary = ref({ total: 0, byCategory: {} });
const randomOutfit = ref<any>(null);

const newItem = reactive({
  name: '',
  category: '',
  color: '',
  brand: '',
});

onMounted(() => {
  initLocale();
  loadItems();
  loadOutfits();
  loadSummary();
});

async function loadItems() {
  try {
    const res = await fetch('/api/fashion/items');
    items.value = await res.json();
  } catch (e) {
    console.error('Failed to load items');
  }
}

async function loadOutfits() {
  try {
    const res = await fetch('/api/fashion/outfits');
    outfits.value = await res.json();
  } catch (e) {
    console.error('Failed to load outfits');
  }
}

async function loadSummary() {
  try {
    const res = await fetch('/api/fashion/items/summary');
    summary.value = await res.json();
  } catch (e) {
    console.error('Failed to load summary');
  }
}

async function addItem() {
  if (!newItem.name || !newItem.category) return;
  
  try {
    await fetch('/api/fashion/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    newItem.name = '';
    newItem.category = '';
    newItem.color = '';
    newItem.brand = '';
    await loadItems();
    await loadSummary();
  } catch (e) {
    console.error('Failed to add item');
  }
}

async function deleteItem(id: string) {
  try {
    await fetch(`/api/fashion/items/${id}`, { method: 'DELETE' });
    await loadItems();
    await loadSummary();
  } catch (e) {
    console.error('Failed to delete item');
  }
}

async function getRandomOutfit() {
  try {
    const res = await fetch('/api/fashion/outfits/random');
    randomOutfit.value = await res.json();
  } catch (e) {
    console.error('Failed to get random outfit');
  }
}
</script>

<style scoped>
.fashion-page { padding: 32px; max-width: 900px; margin: 0 auto; }
h1 { margin: 0 0 24px; font-size: 28px; color: #f5f5f5; }
h2 { margin: 0 0 16px; font-size: 18px; color: #888; }

.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tab-btn { padding: 10px 20px; background: #242424; color: #888; border: 1px solid #333; border-radius: 8px; cursor: pointer; }
.tab-btn.active { background: #e8a854; color: #0f0f0f; border-color: #e8a854; }

.card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form input, .form select { padding: 12px; background: #242424; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; }
.btn-primary { padding: 12px; background: #e8a854; color: #0f0f0f; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-secondary { padding: 10px 20px; background: #333; color: #f5f5f5; border: none; border-radius: 8px; cursor: pointer; }

.summary { display: flex; gap: 24px; }
.stat { text-align: center; }
.stat-value { display: block; font-size: 32px; font-weight: 700; color: #e8a854; }
.stat-label { font-size: 13px; color: #888; }

.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.item-card { background: #242424; padding: 16px; border-radius: 8px; }
.item-name { font-weight: 600; color: #f5f5f5; margin-bottom: 4px; }
.item-category { font-size: 12px; color: #888; }
.item-actions { margin-top: 8px; }
.btn-delete { background: #e85454; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; }

.random-result { margin-top: 16px; color: #f5f5f5; }

.outfit-list { display: flex; flex-direction: column; gap: 8px; }
.outfit-item { display: flex; justify-content: space-between; padding: 12px; background: #242424; border-radius: 8px; }
.outfit-date, .outfit-occasion { color: #f5f5f5; }

.empty { text-align: center; padding: 32px; color: #666; }
</style>
