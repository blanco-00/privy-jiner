<template>
  <div class="notice-center">
    <button class="notice-center__bell" @click="toggleDropdown">
      <IconBell :size="18" />
      <span v-if="unreadCount > 0" class="notice-center__badge">{{ unreadCount }}</span>
    </button>

    <transition name="dropdown">
      <div v-if="showDropdown" class="notice-center__dropdown">
        <div class="notice-center__header">
          <span>Notifications</span>
          <button class="notice-center__mark-all-read" @click="markAllRead">
            Mark all read
          </button>
        </div>
        
        <div class="notice-center__list">
          <div 
            v-for="notice in sortedNotifications" 
            :key="notice.id"
            class="notice-center__item"
            :class="`notice-center__item--${notice.type}`"
            @click="handleNoticeClick(notice)"
          >
            <div class="notice-center__item-icon">
              <IconInfo v-if="notice.type === 'info'" :size="16" />
              <IconCheck v-else-if="notice.type === 'success'" :size="16" />
              <IconAlert v-else-if="notice.type === 'warning'" :size="16" />
              <IconError v-else :size="16" />
            </div>
            <div class="notice-center__item-content">
              <div class="notice-center__item-title">{{ notice.title }}</div>
              <div class="notice-center__item-message">{{ notice.message }}</div>
              <div class="notice-center__item-time">{{ formatTime(notice.time) }}</div>
            </div>
            <button 
              class="notice-center__item-read-btn"
              @click.stop="toggleRead(notice)"
            >
              {{ notice.read ? 'Mark as read' : 'Mark unread' }}
            </button>
          </div>
        </div>
        
        <div v-if="notifications.length === 0" class="notice-center__empty">
          <div class="notice-center__empty-icon">
            <IconBell :size="24" />
          </div>
          <span class="notice-center__empty-text">No notifications</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconBell from './icons/IconBell.vue'
import IconInfo from './icons/IconInfo.vue'
import IconCheck from './icons/IconCheck.vue'
import IconAlert from './icons/IconAlert.vue'
import IconError from './icons/IconError.vue'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: Date
  read: boolean
}

const showDropdown = ref(false)

const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'info',
    title: 'Welcome to Privy-Jiner!',
    message: 'Your personal AI assistant is ready to help you',
    time: new Date(),
    read: false
  },
  {
    id: '2',
    type: 'success',
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully',
    time: new Date(Date.now() - 60000),
    read: true
  },
  {
    id: '3',
    type: 'warning',
    title: 'Weekly Reminder',
    message: "Don't forget to check your tasks!",
    time: new Date(Date.now() - 120000),
    read: false
  },
  {
    id: '4',
    type: 'error',
    title: 'System Alert',
    message: 'An unexpected error occurred',
    time: new Date(Date.now() - 60000),
    read: false
  }
])

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const sortedNotifications = computed(() => {
  return [...notifications.value].sort((a, b) => 
    return new Date(b.time).getTime() - new Date(a.time).getTime()
  )
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleNoticeClick(notice: Notification) {
  notice.read = !notice.read
  notifications.value = [...notifications.value]
}

function toggleRead(notice: Notification) {
  const index = notifications.value.findIndex(n => n.id === notice.id)
  if (index > -1) {
    notifications.value[index] = { ...notifications.value[index], read: !notice.read }
  }
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleTimeString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.notice-center {
  position: relative;
  margin-left: var(--space-sm);
}

.notice-center__bell {
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

.notice-center__bell:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notice-center__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  background: var(--accent-danger);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-center__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 280px;
  max-height: 300px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.notice-center__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-primary);
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
}

.notice-center__mark-all-read {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.notice-center__mark-all-read:hover {
  color: var(--accent-primary);
}

.notice-center__list {
  max-height: 200px;
  overflow-y: auto;
}

.notice-center__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.notice-center__item:hover {
  background: var(--bg-tertiary);
}

.notice-center__item--info .notice-center__item-icon {
  background: rgba(84, 168, 232, 0.1);
  color: var(--accent-info);
}

.notice-center__item--success .notice-center__item-icon {
  background: rgba(84, 232, 138, 0.1);
  color: var(--accent-success);
}

.notice-center__item--warning .notice-center__item-icon {
  background: rgba(232, 168, 84, 0.1);
  color: var(--accent-warning);
}

.notice-center__item--error .notice-center__item-icon {
  background: rgba(232, 84, 84, 0.1);
  color: var(--accent-danger);
}

.notice-center__item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.notice-center__item-content {
  flex: 1;
  min-width: 0;
}

.notice-center__item-title {
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.notice-center__item-message {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  line-height: 1.4;
}

.notice-center__item-time {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.notice-center__item-read-btn {
  font-size: var(--font-xs);
  color: var(--accent-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.notice-center__item-read-btn:hover {
  background: rgba(232, 168, 84, 0.1);
}

.notice-center__empty {
  padding: var(--space-xl);
  text-align: center;
}

.notice-center__empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--space-sm);
}

.notice-center__empty-text {
  color: var(--text-tertiary);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
