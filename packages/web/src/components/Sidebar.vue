<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': mobileOpen }">
    <div class="sidebar-header">
      <SidebarLogo :is-collapsed="isCollapsed" />
      <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? 'Expand' : 'Collapse'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="isCollapsed" d="M9 18l6-6-6-6"/>
          <path v-else d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="group in navGroups" :key="group.name" class="nav-group">
        <div class="nav-group-title" v-if="!isCollapsed">
          <component :is="group.iconComponent" :size="12" class="group-icon" />
          <span>{{ group.name }}</span>
        </div>
        <router-link 
          v-for="item in group.items" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
          :title="isCollapsed ? item.label : ''"
          @click="$emit('nav-click')"
        >
          <span class="nav-icon">
            <component :is="item.iconComponent" :size="18" />
          </span>
          <span class="nav-label" v-if="!isCollapsed">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="lang-select-wrapper" v-if="!isCollapsed">
        <select v-model="locale" @change="switchLocale" class="lang-select">
          <option value="en">EN</option>
          <option value="zh">中文</option>
        </select>
      </div>
      <button class="logout-btn" @click="logout" :title="isCollapsed ? t('app.logout') : ''">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!isCollapsed">{{ t('app.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import {
  IconUser,
  IconContacts,
  IconCalendar,
  IconTasks,
  IconFinance,
  IconHealth,
  IconFashion,
  IconKnowledge,
  IconNews,
  IconChat,
  IconMonitor,
  IconPlugins,
  IconSettings,
  IconLeaf,
  IconCog
} from './icons';

import SidebarLogo from './SidebarLogo.vue';

defineProps<{
  mobileOpen?: boolean
}>()

defineEmits(['nav-click'])

const router = useRouter()
const route = useRoute()
const { t, locale, setLocale, initLocale } = useI18n()

const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

const navGroups = computed(() => [
  {
    name: t('nav.personal'),
    iconComponent: IconUser,
    items: [
      { path: '/profile', label: t('app.profile'), iconComponent: IconUser },
      { path: '/contacts', label: t('app.contacts'), iconComponent: IconContacts },
      { path: '/schedule', label: t('app.schedule'), iconComponent: IconCalendar },
      { path: '/tasks', label: t('app.tasks'), iconComponent: IconTasks },
    ]
  },
  {
    name: t('nav.life'),
    iconComponent: IconLeaf,
    items: [
      { path: '/finance', label: t('app.finance'), iconComponent: IconFinance },
      { path: '/health', label: t('app.health'), iconComponent: IconHealth },
      { path: '/fashion', label: t('app.fashion'), iconComponent: IconFashion },
      { path: '/knowledge', label: t('app.knowledge'), iconComponent: IconKnowledge },
    ]
  },
  {
    name: t('nav.system'),
    iconComponent: IconCog,
    items: [
      { path: '/news', label: t('app.news'), iconComponent: IconNews },
      { path: '/chat', label: t('app.chat'), iconComponent: IconChat },
      { path: '/monitor', label: t('app.monitor'), iconComponent: IconMonitor },
      { path: '/plugins', label: t('app.plugins'), iconComponent: IconPlugins },
      { path: '/settings', label: t('app.settings'), iconComponent: IconSettings },
    ]
  },
])

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
}

function switchLocale() {
  setLocale(locale.value)
}

function logout() {
  localStorage.removeItem('privy-jiner-session')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--z-fixed);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
  max-width: var(--sidebar-collapsed-width);
}

.sidebar > * {
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar.collapsed > * {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  min-height: 60px;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .sidebar-header {
  padding: var(--space-4) var(--space-2);
  justify-content: center;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.sidebar.collapsed .collapse-btn {
  margin-left: 0;
}

.collapse-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.collapse-btn svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .collapse-btn svg {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-3);
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .sidebar-nav {
  padding: var(--space-3) var(--space-1);
}

.nav-group {
  margin-bottom: var(--space-4);
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  margin-bottom: var(--space-1);
}

.nav-group-title .group-icon {
  opacity: 0.7;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  border-left: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-primary);
  transform: scaleY(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(232, 168, 84, 0.12);
  color: var(--accent-primary);
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-item.active .nav-icon {
  animation: icon-pulse 0.3s ease;
}

@keyframes icon-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nav-label {
  font-size: var(--font-sm);
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--border-primary);
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .sidebar-footer {
  padding: var(--space-3) var(--space-1);
}

.lang-select-wrapper {
  margin-bottom: var(--space-3);
}

.lang-select {
  width: 100%;
  padding: var(--space-2);
  font-size: var(--font-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  font-size: var(--font-sm);
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.logout-btn:hover {
  background: rgba(232, 84, 84, 0.1);
  border-color: var(--accent-danger);
  color: var(--accent-danger);
}

.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3) var(--space-2);
  position: relative;
}

.collapsed .nav-item::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  color: var(--text-primary);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-fast), visibility var(--transition-fast);
  z-index: var(--z-tooltip);
  pointer-events: none;
}

.collapsed .nav-item:hover::after {
  opacity: 1;
  visibility: visible;
}

.collapsed .nav-group-title {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    width: 280px;
  }
}
</style>
