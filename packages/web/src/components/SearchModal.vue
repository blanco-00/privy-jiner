<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="search-modal-overlay"
        @click.self="handleClose"
        @keydown.esc="handleClose"
      >
        <div class="search-modal">
          <div class="search-modal__input-wrapper">
            <svg
              class="search-modal__icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              class="search-modal__input"
              placeholder="Search..."
              @keydown.esc="handleClose"
            />
            <kbd class="search-modal__kbd">ESC</kbd>
          </div>

          <div class="search-modal__results">
            <div v-if="searchQuery.length === 0" class="search-modal__empty">
              <p class="search-modal__empty-text">Start typing to search</p>
            </div>
            <div v-else-if="filteredPages.length === 0" class="search-modal__empty">
              <p class="search-modal__empty-text">No results found</p>
            </div>
            <div v-else class="search-modal__list">
              <button
                v-for="(page, index) in filteredPages"
                :key="page.path"
                class="search-modal__item"
                :class="{ 'search-modal__item--selected': index === selectedIndex }"
                @click="selectPage(page)"
                @mouseenter="selectedIndex = index"
              >
                <span class="search-modal__item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9 6 3"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  </svg>
                </span>
                <span class="search-modal__item-title" v-html="highlightMatch(page.title)"></span>
                <span class="search-modal__item-path">{{ page.path }}</span>
              </button>
            </div>
          </div>

          <div class="search-modal__footer">
            <div class="search-modal__footer-hint">
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </div>
            <div class="search-modal__footer-hint">
              <kbd>Enter</kbd> to select
            </div>
            <div class="search-modal__footer-hint">
              <kbd>⌘</kbd><kbd>K</kbd> to close
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const isOpen = ref(false)
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

const router = useRouter()

const emit = defineEmits<{
  close: []
}>()

const pages = [
  { path: '/dashboard', title: 'Dashboard', icon: 'home' },
  { path: '/profile', title: 'Profile', icon: 'user' },
  { path: '/contacts', title: 'Contacts', icon: 'users' },
  { path: '/schedule', title: 'Schedule', icon: 'calendar' },
  { path: '/tasks', title: 'Tasks', icon: 'check-square' },
  { path: '/finance', title: 'Finance', icon: 'dollar-sign' },
  { path: '/health', title: 'Health', icon: 'heart' },
  { path: '/fashion', title: 'Fashion', icon: 'shirt' },
  { path: '/knowledge', title: 'Knowledge', icon: 'book' },
  { path: '/news', title: 'News', icon: 'newspaper' },
  { path: '/chat', title: 'Chat', icon: 'message' },
  { path: '/monitor', title: 'Monitor', icon: 'activity' },
  { path: '/plugins', title: 'Plugins', icon: 'puzzle' },
  { path: '/settings', title: 'Settings', icon: 'settings' }
]

const filteredPages = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  
  // Fuzzy search scoring
  const results = pages.map(page => {
    const titleLower = page.title.toLowerCase()
    const pathLower = page.path.toLowerCase()
    
    let score = 0
    
    // Exact match (highest score)
    if (titleLower === query || pathLower === query) {
      score = 100
    }
    // Starts with query
    else if (titleLower.startsWith(query) || pathLower.startsWith(query)) {
      score = 80
    }
    // Contains exact word
    else if (titleLower.includes(` ${query}`) || pathLower.includes(`/${query}`)) {
      score = 60
    }
    // Fuzzy match - each character must appear in order
    else if (fuzzyMatch(titleLower, query) || fuzzyMatch(pathLower, query)) {
      score = 40 + fuzzyScore(titleLower, query) + fuzzyScore(pathLower, query)
    }
    // Simple contains
    else if (titleLower.includes(query) || pathLower.includes(query)) {
      score = 20
    }
    
    return { page, score }
  })
  
  // Sort by score and filter non-matches
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.page)
})

// Fuzzy matching helper - checks if all chars appear in order
function fuzzyMatch(text: string, query: string): boolean {
  let queryIndex = 0
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++
    }
  }
  return queryIndex === query.length
}

// Calculate fuzzy score based on consecutive matches
function fuzzyScore(text: string, query: string): number {
  let score = 0
  let queryIndex = 0
  let consecutive = 0
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      consecutive++
      score += consecutive
      queryIndex++
    } else {
      consecutive = 0
    }
  }
  
  return queryIndex === query.length ? score : 0
}

watch(filteredPages, () => {
  selectedIndex.value = 0
})

function open() {
  isOpen.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
}

function handleClose() {
  isOpen.value = false
  emit('close')
}

function selectPage(page: typeof pages[0]) {
  router.push(page.path)
  handleClose()
}

function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      handleClose()
    } else {
      open()
    }
    return
  }
  
  if (!isOpen.value) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedIndex.value < filteredPages.value.length - 1) {
      selectedIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const page = filteredPages.value[selectedIndex.value]
    if (page) {
      selectPage(page)
    }
  }
}

function highlightMatch(text: string): string {
  if (!searchQuery.value) return text
  const query = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

watch(isOpen, (open) => {
  if (open) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 50)
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

defineExpose({ open, close: handleClose })
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: var(--z-search-modal);
}

.search-modal {
  width: 100%;
  max-width: 560px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.search-modal__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-primary);
}

.search-modal__icon {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.search-modal__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.search-modal__input::placeholder {
  color: var(--text-tertiary);
}

.search-modal__kbd {
  flex-shrink: 0;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-xs);
  font-family: var(--font-family);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.search-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.search-modal__footer-hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.search-modal__footer-hint kbd {
  padding: 2px 6px;
  font-size: var(--font-xs);
  font-family: var(--font-family);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.search-modal__result {
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.search-modal__result.selected,
.search-modal__result--selected {
  background: var(--bg-tertiary);
}

.search-modal__result-icon {
  width: 20px;
  height: 15px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-modal__result-content {
  flex: 1;
  min-width: 0;
}

.search-modal__result-title {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.search-modal__result-path {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.search-modal__result mark {
  display: inline-block;
  font-size: var(--font-xs);
  color: var(--accent-primary);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  margin-left: var(--space-sm);
}

.search-modal__highlight {
  background: rgba(232, 168, 84, 0.2);
  color: var(--accent-primary);
  padding: 0 2px;
  border-radius: 2px;
}

.search-modal__result-item {
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.search-modal__result-item:hover {
  background: var(--bg-tertiary);
}

.search-modal__result-item.selected {
  background: var(--bg-elevated);
  border-color: var(--accent-primary);
}

.search-modal__result-item: {
  margin-left: var(--space-sm);
}

.search-modal__result-item-title {
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.search-modal__result-item-path {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}
</style>

/* Transitions */
.modal-enter-active {
  animation: modal-enter 0.2s ease;
}

.modal-leave-active {
  animation: modal-leave 0.15s ease;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-leave {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
}
</style>
