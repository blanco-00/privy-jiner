<template>
  <div class="app">
    <nav v-if="isAuthenticated" class="nav">
      <div class="nav-brand">Privy-Jiner</div>
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">{{ t('app.dashboard') }}</router-link>
        <router-link to="/profile" class="nav-link">{{ t('app.profile') }}</router-link>
        <router-link to="/contacts" class="nav-link">{{ t('app.contacts') }}</router-link>
        <router-link to="/schedule" class="nav-link">{{ t('app.schedule') }}</router-link>
        <router-link to="/tasks" class="nav-link">{{ t('app.tasks') }}</router-link>
        <router-link to="/finance" class="nav-link">{{ t('app.finance') }}</router-link>
        <router-link to="/health" class="nav-link">{{ t('app.health') }}</router-link>
        <router-link to="/fashion" class="nav-link">{{ t('app.fashion') }}</router-link>
        <router-link to="/knowledge" class="nav-link">{{ t('app.knowledge') }}</router-link>
        <router-link to="/news" class="nav-link">{{ t('app.news') }}</router-link>
        <router-link to="/chat" class="nav-link">{{ t('app.chat') }}</router-link>
        <router-link to="/monitor" class="nav-link">{{ t('app.monitor') }}</router-link>
        <router-link to="/plugins" class="nav-link">{{ t('app.plugins') }}</router-link>
        <router-link to="/settings" class="nav-link">{{ t('app.settings') }}</router-link>
        <select v-model="locale" @change="switchLocale" class="lang-select">
          <option value="en">EN</option>
          <option value="zh">中文</option>
        </select>
        <button @click="logout" class="nav-link logout">{{ t('app.logout') }}</button>
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from './composables/useI18n';

const router = useRouter();
const isAuthenticated = ref(false);
const { t, locale, setLocale, initLocale } = useI18n();

onMounted(() => {
  const token = localStorage.getItem('privy-jiner-session');
  isAuthenticated.value = !!token;
  
  initLocale();
});

function switchLocale() {
  setLocale(locale.value);
}

function logout() {
  localStorage.removeItem('privy-jiner-session');
  isAuthenticated.value = false;
  router.push('/login');
}
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.nav-brand {
  font-size: 18px;
  font-weight: 600;
  color: #e8a854;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: #888;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #f5f5f5;
}

.nav-link.logout:hover {
  color: #e85454;
}

.lang-select {
  padding: 6px 10px;
  font-size: 13px;
  background: #242424;
  color: #f5f5f5;
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
  outline: none;
}

.lang-select:hover {
  border-color: #e8a854;
}

.main {
  flex: 1;
}
</style>
