<template>
  <div class="tags-view" ref="tagsViewRef">
    <button class="tags-view__scroll-btn tags-view__scroll-btn--left" @click="scroll('left')" :disabled="!canScrollLeft">
      <IconChevronLeft :size="16" />
    </button>
    
    <div class="tags-view__scroll" ref="scrollContainerRef" @wheel.prevent="handleWheel">
      <div
        v-for="(tab, index) in visitedTabs"
        :key="tab.path"
        class="tags-view__tab"
        :class="{ 'tags-view__tab--active': isActive(tab) }"
        @click="selectTab(tab)"
        @contextmenu.prevent="openContextMenu($event, tab, index)"
      >
        <span class="tags-view__tab-title">{{ tab.title }}</span>
        <button
          v-if="index !== 0"
          class="tags-view__tab-close"
          @click.stop="closeTab(tab, index)"
          title="Close"
        >
          <IconX :size="12" />
        </button>
      </div>
    </div>

    <button class="tags-view__scroll-btn tags-view__scroll-btn--right" @click="scroll('right')" :disabled="!canScrollRight">
      <IconChevronRight :size="16" />
    </button>

    <!-- Context Menu -->
    <transition name="fade">
      <div 
        v-if="contextMenu.visible" 
        class="tags-view__context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <button class="context-menu__item" @click="refreshTab">
          <IconRefresh :size="14" />
          <span>Refresh</span>
        </button>
        <button class="context-menu__item" @click="closeCurrentTab" :disabled="contextMenu.index === 0">
          <IconX :size="14" />
          <span>Close</span>
        </button>
        <div class="context-menu__divider"></div>
        <button class="context-menu__item" @click="closeOtherTabs">
          <IconCloseCircle :size="14" />
          <span>Close Others</span>
        </button>
        <button class="context-menu__item" @click="closeAllTabs">
          <IconBan :size="14" />
          <span>Close All</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconX from './icons/IconX.vue'
import IconChevronLeft from './icons/IconChevronLeft.vue'
import IconChevronRight from './icons/IconChevronRight.vue'

// Inline icons for context menu
const IconRefresh = {
  template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>`
}
const IconCloseCircle = {
  template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>`
}
const IconBan = {
  template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>`
}

interface Tab {
  path: string
  title: string
  name?: string
}

const route = useRoute()
const router = useRouter()

const visitedTabs = ref<Tab[]>([
  { path: '/dashboard', title: 'Dashboard' }
])

const tagsViewRef = ref<HTMLElement | null>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null as Tab | null,
  index: 0
})

const scrollState = ref({
  left: false,
  right: false
})

const canScrollLeft = computed(() => scrollState.value.left)
const canScrollRight = computed(() => scrollState.value.right)

function isActive(tab: Tab): boolean {
  return route.path === tab.path
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/contacts': 'Contacts',
    '/schedule': 'Schedule',
    '/tasks': 'Tasks',
    '/finance': 'Finance',
    '/health': 'Health',
    '/fashion': 'Fashion',
    '/knowledge': 'Knowledge',
    '/news': 'News',
    '/chat': 'Chat',
    '/monitor': 'Monitor',
    '/plugins': 'Plugins',
    '/settings': 'Settings'
  }
  return titles[path] || path.split('/').pop() || 'Page'
}

function addTab() {
  const path = route.path
  const exists = visitedTabs.value.some(tab => tab.path === path)
  
  if (!exists && path !== '/login') {
    visitedTabs.value.push({
      path,
      title: getPageTitle(path),
      name: route.name as string | undefined
    })
    scrollToRight()
  }
}

function selectTab(tab: Tab) {
  if (route.path !== tab.path) {
    router.push(tab.path)
  }
}

function closeTab(tab: Tab, index: number) {
  visitedTabs.value.splice(index, 1)
  
  if (isActive(tab)) {
    const newIndex = Math.min(index, visitedTabs.value.length - 1)
    const newTab = visitedTabs.value[newIndex]
    if (newTab) {
      router.push(newTab.path)
    }
  }
  updateScrollState()
}

function scrollToRight() {
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth
      updateScrollState()
    }
  })
}

function scroll(direction: 'left' | 'right') {
  if (!scrollContainerRef.value) return
  
  const container = scrollContainerRef.value
  const scrollAmount = 200
  
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount
  } else {
    container.scrollLeft += scrollAmount
  }
  updateScrollState()
}

function handleWheel(e: WheelEvent) {
  const container = scrollContainerRef.value
  if (!container) return
  
  if (e.deltaY < 0) {
    container.scrollLeft -= 100
  } else {
    container.scrollLeft += 100
  }
  updateScrollState()
}

function updateScrollState() {
  nextTick(() => {
    if (!scrollContainerRef.value) return
    const container = scrollContainerRef.value
    scrollState.value = {
      left: container.scrollLeft > 0,
      right: container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    }
  })
}

function openContextMenu(e: MouseEvent, tab: Tab, index: number) {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    tab,
    index
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

function refreshTab() {
  const tab = contextMenu.value.tab
  if (tab) {
    router.replace('/redirect' + tab.path)
    closeContextMenu()
  }
}

function closeCurrentTab() {
  const { tab, index } = contextMenu.value
  if (tab && index > 0) {
    closeTab(tab, index)
  }
  closeContextMenu()
}

function closeOtherTabs() {
  const { index } = contextMenu.value
  const activeTab = visitedTabs.value[index]
  visitedTabs.value = [visitedTabs.value[0], activeTab]
  router.push(activeTab.path)
  closeContextMenu()
}

function closeAllTabs() {
  visitedTabs.value = [visitedTabs.value[0]]
  router.push('/dashboard')
  closeContextMenu()
}

function handleClickOutside(e: MouseEvent) {
  if (contextMenu.value.visible) {
    closeContextMenu()
  }
}

watch(
  () => route.path,
  () => {
    addTab()
  },
  { immediate: true }
)

onMounted(() => {
  addTab()
  document.addEventListener('click', handleClickOutside)
  updateScrollState()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tags-view {
  position: fixed;
  top: var(--header-height);
  left: var(--sidebar-width);
  right: 0;
  height: var(--tags-view-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  z-index: var(--z-tags-view);
  display: flex;
  align-items: center;
  transition: var(--theme-transition);
}

.tags-view__scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  margin: 0 var(--space-xs);
}

.tags-view__scroll-btn:hover:not(:disabled) {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.tags-view__scroll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tags-view__scroll {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 var(--space-xs);
  gap: var(--space-xs);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex: 1;
}

.tags-view__scroll::-webkit-scrollbar {
  display: none;
}

.tags-view__tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  height: 26px;
  padding: 0 var(--space-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-xs);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.tags-view__tab:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.tags-view__tab--active {
  background: rgba(232, 168, 84, 0.15);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.tags-view__tab--active:hover {
  background: rgba(232, 168, 84, 0.25);
}

.tags-view__tab-title {
  line-height: 1;
}

.tags-view__tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-left: var(--space-xs);
  padding: 0;
}

.tags-view__tab-close:hover {
  background: rgba(232, 84, 84, 0.2);
  color: var(--accent-danger);
}

/* Context Menu */
.tags-view__context-menu {
  position: fixed;
  min-width: 150px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

.context-menu__item {
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

.context-menu__item:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.context-menu__item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu__divider {
  height: 1px;
  background: var(--border-primary);
  margin: var(--space-xs) 0;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .tags-view {
    left: 0;
    top: calc(var(--header-height) + 60px);
  }
  
  .tags-view__scroll-btn {
    display: none;
  }
}
</style>
