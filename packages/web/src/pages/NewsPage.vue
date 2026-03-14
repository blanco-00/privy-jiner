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
.news-page { padding: var(--space-xl); max-width: 900px; margin: 0 auto; }
h1 { margin: 0 0 var(--space-lg); font-size: var(--font-3xl); color: var(--text-primary); }
h2 { margin: 0 0 var(--space-md); font-size: var(--font-lg); color: var(--text-secondary); }

.stats { display: flex; gap: var(--space-md); margin-bottom: var(--space-lg); }
.stat-card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--card-padding-md); text-align: center; flex: 1; }
.stat-value { font-size: var(--font-4xl); font-weight: var(--weight-bold); color: var(--accent-primary); }
.stat-label { font-size: var(--font-sm); color: var(--text-secondary); }

.card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--card-padding-md); margin-bottom: var(--space-lg); }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: var(--input-padding); }
.form input, .form select, .form textarea { padding: var(--input-padding); background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); color: var(--text-primary); }
.form textarea { grid-column: span 2; }
.btn-primary { padding: var(--input-padding); background: var(--accent-primary); color: var(--bg-primary); border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: var(--weight-semibold); }

.search-bar { margin-bottom: var(--input-padding); }
.search-input, .filter-select { width: 100%; padding: var(--input-padding); background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); color: var(--text-primary); }
.filter-bar { margin-bottom: var(--space-md); }

.article-list { display: flex; flex-direction: column; gap: var(--input-padding); }
.article-card { background: var(--bg-tertiary); padding: var(--space-md); border-radius: var(--radius-md); border-left: 3px solid var(--border-primary); }
.article-card.unread { border-left-color: var(--accent-primary); }
.article-header { display: flex; justify-content: space-between; margin-bottom: var(--space-sm); }
.article-category { font-size: var(--font-xs); color: var(--accent-primary); }
.article-date { font-size: var(--font-xs); color: var(--text-secondary); }
.article-title { font-weight: var(--weight-semibold); color: var(--text-primary); margin-bottom: var(--space-xs); }
.article-content { font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-sm); }
.article-meta { display: flex; justify-content: space-between; font-size: var(--font-xs); color: var(--text-tertiary); }
.article-actions { display: flex; gap: var(--space-sm); }
.btn-read { padding: var(--space-xs) var(--space-sm); background: var(--accent-success); color: var(--bg-primary); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-xs); }
.btn-delete { background: var(--accent-danger); color: white; border: none; border-radius: var(--radius-sm); width: var(--space-lg); height: var(--space-lg); cursor: pointer; }

.empty { text-align: center; padding: var(--space-xl); color: var(--text-tertiary); }
</style>
