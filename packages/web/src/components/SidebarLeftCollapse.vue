<template>
  <button 
    class="sidebar-collapse-btn" 
    :class="{ collapsed: isCollapsed }"
    @click="$emit('toggle')"
    :title="isCollapsed ? 'Expand' : 'Collapse'"
  >
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
      class="collapse-icon"
    >
      <path v-if="isCollapsed" d="M9 18l6-6-6-6"/>
      <path v-else d="M15 18l-6-6 6-6"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isCollapsed?: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.sidebar-collapse-btn {
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
  transition: all 0.2s ease;
}

.sidebar-collapse-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar-collapse-btn.collapsed {
  margin-left: 0;
}

.collapse-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapse-btn.collapsed .collapse-icon {
  transform: rotate(180deg);
}
</style>
