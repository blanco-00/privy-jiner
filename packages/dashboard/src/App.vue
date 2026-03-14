<template>
  <div class="app">
    <Sidebar v-if="isAuthenticated" @nav-click="closeMobileMenu" />
    
    <div v-if="isAuthenticated" class="mobile-header">
      <button class="menu-btn" @click="mobileOpen = !mobileOpen">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <span class="mobile-title">Privy-Jiner</span>
    </div>

    <main class="main" :class="{ 'with-sidebar': isAuthenticated }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <div v-if="mobileOpen && isAuthenticated" class="mobile-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from './composables/useI18n';
import Sidebar from './components/Sidebar.vue';

const router = useRouter();
const isAuthenticated = ref(false);
const mobileOpen = ref(false);
const { initLocale } = useI18n();

onMounted(() => {
  const token = localStorage.getItem('privy-jiner-session');
  isAuthenticated.value = !!token;
  initLocale();
});

function closeMobileMenu() {
  mobileOpen.value = false;
}
</script>

<style>
@import './styles/variables.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  min-height: 100vh;
  transition: margin-left var(--transition-base);
}

.main.with-sidebar {
  margin-left: var(--sidebar-width);
}

@media (max-width: 768px) {
  .main.with-sidebar {
    margin-left: 0;
  }
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  align-items: center;
  padding: 0 var(--space-4);
  gap: var(--space-3);
  z-index: var(--z-sticky);
}

.menu-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.mobile-title {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--accent-primary);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-fixed);
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

a {
  color: inherit;
}

button {
  font-family: inherit;
}
</style>
