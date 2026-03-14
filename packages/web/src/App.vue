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

    <div v-if="isAuthenticated" class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <Navbar 
        @toggle-sidebar="toggleSidebar"
        @toggle-search="toggleSearch"
        @toggle-theme="toggleTheme"
      />
      <TagsView />
      <main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <main v-else class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <SearchModal v-if="showSearch" @close="showSearch = false" />

    <div v-if="mobileOpen && isAuthenticated" class="mobile-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from './composables/useI18n';
import { useTheme } from './composables/useTheme';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import TagsView from './components/TagsView.vue';
import SearchModal from './components/SearchModal.vue';

const router = useRouter();
const isAuthenticated = ref(true);
const mobileOpen = ref(false);
const showSearch = ref(false);
const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true');
const { initLocale } = useI18n();
const { initTheme, toggleTheme } = useTheme();

onMounted(() => {
  const token = localStorage.getItem('privy-jiner-session');
  isAuthenticated.value = !!token;
  initLocale();
  initTheme();

  // Set initial sidebar state
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
  document.documentElement.dataset.sidebarCollapsed = String(isCollapsed);

  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    showSearch.value = true;
  }
}

function closeMobileMenu() {
  mobileOpen.value = false;
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    sidebarCollapsed.value = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed.value));
    
    // Update data attribute for CSS selectors
    document.documentElement.dataset.sidebarCollapsed = String(sidebarCollapsed.value);
  }
}

function toggleSearch() {
  showSearch.value = !showSearch.value;
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
  transition: var(--theme-transition);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-base);
}

.app-container.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

/* Sidebar collapsed state - adjust navbar and tagsview */
:global([data-sidebar-collapsed="true"]) .navbar,
:global([data-sidebar-collapsed="true"]) .tags-view {
  left: var(--sidebar-collapsed-width);
}

@media (max-width: 768px) {
  .app-container {
    margin-left: 0;
  }
  
  .app-container.sidebar-collapsed {
    margin-left: 0;
  }
}

.main {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.app:not(.with-sidebar) .main {
  margin-left: 0;
}

@media (max-width: 768px) {
  .app-container {
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
  padding: 0 var(--space-lg);
  gap: var(--space-sm);
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
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

a {
  color: inherit;
}

button {
  font-family: inherit;
}
</style>
