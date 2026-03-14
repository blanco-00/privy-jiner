<template>
  <header class="navbar">
    <div class="navbar__left">
      <button class="navbar__btn navbar__btn--hamburger" @click="$emit('toggle-sidebar')" title="Toggle Sidebar">
        <IconMenu :size="20" />
      </button>
      <Breadcrumb />
    </div>

    <div class="navbar__right">
      <button class="navbar__btn" @click="$emit('toggle-search')" title="Search">
        <IconSearch :size="18" />
      </button>

      <button class="navbar__btn" @click="$emit('toggle-theme')" title="Toggle Theme">
        <IconSun v-if="isDark" :size="18" />
        <IconMoon v-else :size="18" />
      </button>

      <button class="navbar__btn" @click="toggleFullscreen" title="Fullscreen">
        <IconMaximize v-if="!isFullscreen" :size="18" />
        <IconMinimize v-else :size="18" />
      </button>

      <div class="navbar__user" ref="userDropdownRef">
        <button class="navbar__user-btn" @click="showUserMenu = !showUserMenu">
          <div class="navbar__avatar">
            <span>U</span>
          </div>
          <span class="navbar__username">User</span>
          <IconArrowDown :size="14" />
        </button>
        
        <transition name="dropdown">
          <div v-if="showUserMenu" class="navbar__dropdown">
            <div class="navbar__dropdown-header">
              <div class="navbar__avatar navbar__avatar--lg">
                <span>U</span>
              </div>
              <div class="navbar__user-info">
                <span class="navbar__user-name">User</span>
                <span class="navbar__user-email">user@example.com</span>
              </div>
            </div>
            <div class="navbar__dropdown-divider"></div>
            <button class="navbar__dropdown-item" @click="goToProfile">
              <IconUser :size="16" />
              <span>Profile</span>
            </button>
            <button class="navbar__dropdown-item" @click="goToSettings">
              <IconSettings :size="16" />
              <span>Settings</span>
            </button>
            <div class="navbar__dropdown-divider"></div>
            <button class="navbar__dropdown-item navbar__dropdown-item--danger" @click="logout">
              <IconLogout :size="16" />
              <span>Logout</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import IconMenu from './icons/IconMenu.vue'
import IconSearch from './icons/IconSearch.vue'
import IconSun from './icons/IconSun.vue'
import IconMoon from './icons/IconMoon.vue'
import IconMaximize from './icons/IconMaximize.vue'
import IconArrowDown from './icons/IconArrowDown.vue'
import IconUser from './icons/IconUser.vue'
import IconSettings from './icons/IconSettings.vue'
import IconLogout from './icons/IconLogout.vue'
import Breadcrumb from './Breadcrumb.vue'

// IconMinimize component inline
const IconMinimize = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
  </svg>`
}

defineEmits<{
  'toggle-sidebar': []
  'toggle-search': []
  'toggle-theme': []
  'toggle-fullscreen': []
}>()

const router = useRouter()
const showUserMenu = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const isDark = computed(() => {
  if (typeof document === 'undefined') return true
  return document.documentElement.getAttribute('data-theme') !== 'light'
})

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function goToProfile() {
  showUserMenu.value = false
  router.push('/profile')
}

function goToSettings() {
  showUserMenu.value = false
  router.push('/settings')
}

function logout() {
  localStorage.removeItem('privy-jiner-session')
  router.push('/login')
}

function handleClickOutside(e: MouseEvent) {
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  z-index: var(--z-sticky);
  
  /* Glassmorphism - adaptive for all themes */
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-primary);
  transition: var(--theme-transition);
}

[data-theme="light"] .navbar {
  background: rgba(255, 255, 255, 0.85);
  border-bottom-color: #e8e8e8;
}

[data-theme="purple"] .navbar {
  background: rgba(114, 46, 209, 0.8);
}

[data-theme="pink"] .navbar {
  background: rgba(235, 47, 150, 0.8);
}

[data-theme="red"] .navbar {
  background: rgba(245, 34, 45, 0.8);
}

[data-theme="orange"] .navbar {
  background: rgba(250, 84, 28, 0.8);
}

[data-theme="cyan"] .navbar {
  background: rgba(19, 194, 194, 0.8);
}

[data-theme="green"] .navbar {
  background: rgba(82, 196, 26, 0.8);
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.navbar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.navbar__btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.navbar__btn:active {
  transform: scale(0.95);
}

.navbar__btn--hamburger {
  width: 40px;
  height: 40px;
}

/* User Dropdown */
.navbar__user {
  position: relative;
  margin-left: var(--space-sm);
}

.navbar__user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.navbar__user-btn:hover {
  background: var(--bg-tertiary);
}

.navbar__avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--accent-primary);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
}

.navbar__avatar--lg {
  width: 40px;
  height: 40px;
  font-size: var(--font-md);
}

.navbar__username {
  font-size: var(--font-sm);
  color: var(--text-primary);
}

.navbar__dropdown {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  min-width: 220px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.navbar__dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-secondary);
}

.navbar__user-info {
  display: flex;
  flex-direction: column;
}

.navbar__user-name {
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.navbar__user-email {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.navbar__dropdown-divider {
  height: 1px;
  background: var(--border-primary);
}

.navbar__dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.navbar__dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.navbar__dropdown-item--danger:hover {
  background: rgba(232, 84, 84, 0.1);
  color: var(--accent-danger);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .navbar {
    left: 0;
  }
}
</style>
