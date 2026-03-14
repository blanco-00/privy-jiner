<template>
  <div class="sidebar-logo" :class="{ collapsed: isCollapsed }">
    <IconBolt :size="24" class="logo-icon" />
    <Transition name="fade">
      <span v-if="!isCollapsed" class="logo-text">Privy-Jiner</span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { IconBolt } from './icons'

defineProps<{
  isCollapsed?: boolean
}>()
</script>

<style scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-logo.collapsed {
  justify-content: center;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.logo-text {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--accent-primary);
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
