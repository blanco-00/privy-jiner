<template>
  <div class="news-page">
    <h1>{{ t('news.title') }}</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ unreadCount }}</div>
        <div class="stat-label">{{ t('news.unread') }}</div>
      </div>
    </div>

    <div class="card">
      <h2>{{ t('news.addArticle') }}</h2>
      <form @submit.prevent="addArticle" class="form">
        <input v-model="newArticle.title" :placeholder="t('fashion.name')" required />
        <textarea v-model="newArticle.content" :placeholder="t('news.content')" rows="3"></textarea>
        <select v-model="newArticle.category" required>
          <option value="">Category</option>
          <option value="tech">{{ t('news.tech') }}</option>
          <option value="finance">{{ t('news.finance') }}</option>
          <option value="sports">{{ t('news.sports') }}</option>
          <option value="entertainment">{{ t('news.entertainment') }}</option>
          <option value="world">{{ t('news.world') }}</option>
          <option value="other">{{ t('knowledge.other') }}</option>
        </select>
        <input v-model="newArticle.source" :placeholder="t('news.source')" />
        <input v-model="newArticle.url" :placeholder="t('news.url')" />
        <button type="submit" class="btn-primary">{{ t('news.addArticle') }}</button>
      </form>
    </div>

    <div class="card">
      <div class="search-bar">
        <input v-model="searchQuery" @input="onSearch" :placeholder="t('news.search') + '...'" class="search-input" />
      </div>
      <div class="filter-bar">
        <select v-model="categoryFilter" @change="loadArticles" class="filter-select">
          <option value="">All Categories</option>
          <option value="tech">{{ t('news.tech') }}</option>
          <option value="finance">{{ t('news.finance') }}</option>
          <option value="sports">{{ t('news.sports') }}</option>
          <option value="entertainment">{{ t('news.entertainment') }}</option>
          <option value="world">{{ t('news.world') }}</option>
        </select>
      </div>
      <div class="article-list">
        <div v-for="article in articles" :key="article.id" class="article-card" :class="{ unread: !article.is_read }">
          <div class="article-header">
            <span class="article-category">{{ t('news.' + article.category) }}</span>
            <span class="article-date">{{ article.published_date || article.created_at?.split('T')[0] }}</span>
          </div>
          <div class="article-title">{{ article.title }}</div>
          <div class="article-content">{{ article.content?.substring(0, 100) }}...</div>
          <div class="article-meta">
            <span v-if="article.source">{{ article.source }}</span>
            <div class="article-actions">
              <button v-if="!article.is_read" @click="markRead(article.id)" class="btn-read">{{ t('news.markRead') }}</button>
              <button @click="deleteArticle(article.id)" class="btn-delete">×</button>
            </div>
          </div>
        </div>
        <div v-if="articles.length === 0" class="empty">
          {{ t('news.noArticles') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  category: string;
  source: string | null;
  url: string | null;
  published_date: string | null;
  is_read: boolean;
  created_at: string;
}

const articles = ref<NewsArticle[]>([]);
const unreadCount = ref(0);
const searchQuery = ref('');
const categoryFilter = ref('');

const newArticle = reactive({
  title: '',
  content: '',
  category: '',
  source: '',
  url: '',
});

onMounted(() => {
  initLocale();
  loadArticles();
  loadUnreadCount();
});

async function loadArticles() {
  try {
    let url = '/api/news/articles?';
    if (categoryFilter.value) url += `category=${categoryFilter.value}`;
    const res = await fetch(url);
    articles.value = await res.json();
  } catch (e) {
    console.error('Failed to load articles');
  }
}

async function loadUnreadCount() {
  try {
    const res = await fetch('/api/news/articles/unread-count');
    const data = await res.json();
    unreadCount.value = data.count;
  } catch (e) {
    console.error('Failed to load unread count');
  }
}

async function addArticle() {
  if (!newArticle.title || !newArticle.category) return;
  
  try {
    await fetch('/api/news/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle),
    });
    newArticle.title = '';
    newArticle.content = '';
    newArticle.category = '';
    newArticle.source = '';
    newArticle.url = '';
    await loadArticles();
    await loadUnreadCount();
  } catch (e) {
    console.error('Failed to add article');
  }
}

async function deleteArticle(id: string) {
  try {
    await fetch(`/api/news/articles/${id}`, { method: 'DELETE' });
    await loadArticles();
    await loadUnreadCount();
  } catch (e) {
    console.error('Failed to delete article');
  }
}

async function markRead(id: string) {
  try {
    await fetch(`/api/news/articles/${id}/read`, { method: 'POST' });
    await loadArticles();
    await loadUnreadCount();
  } catch (e) {
    console.error('Failed to mark read');
  }
}

async function onSearch() {
  if (!searchQuery.value) {
    await loadArticles();
    return;
  }
  try {
    const res = await fetch(`/api/news/articles/search?q=${encodeURIComponent(searchQuery.value)}`);
    articles.value = await res.json();
  } catch (e) {
    console.error('Failed to search');
  }
}
</script>

<style scoped>
.news-page { padding: 32px; max-width: 900px; margin: 0 auto; }
h1 { margin: 0 0 24px; font-size: 28px; color: #f5f5f5; }
h2 { margin: 0 0 16px; font-size: 18px; color: #888; }

.stats { display: flex; gap: 16px; margin-bottom: 24px; }
.stat-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center; flex: 1; }
.stat-value { font-size: 32px; font-weight: 700; color: #e8a854; }
.stat-label { font-size: 13px; color: #888; }

.card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form input, .form select, .form textarea { padding: 12px; background: #242424; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; }
.form textarea { grid-column: span 2; }
.btn-primary { padding: 12px; background: #e8a854; color: #0f0f0f; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }

.search-bar { margin-bottom: 12px; }
.search-input, .filter-select { width: 100%; padding: 12px; background: #242424; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; }
.filter-bar { margin-bottom: 16px; }

.article-list { display: flex; flex-direction: column; gap: 12px; }
.article-card { background: #242424; padding: 16px; border-radius: 8px; border-left: 3px solid #333; }
.article-card.unread { border-left-color: #e8a854; }
.article-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.article-category { font-size: 12px; color: #e8a854; }
.article-date { font-size: 12px; color: #888; }
.article-title { font-weight: 600; color: #f5f5f5; margin-bottom: 4px; }
.article-content { font-size: 13px; color: #888; margin-bottom: 8px; }
.article-meta { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
.article-actions { display: flex; gap: 8px; }
.btn-read { padding: 4px 8px; background: #54e88a; color: #0f0f0f; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn-delete { background: #e85454; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; }

.empty { text-align: center; padding: 32px; color: #666; }
</style>
