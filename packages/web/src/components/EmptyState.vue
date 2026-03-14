<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon">
        <span v-if="icon" class="icon-emoji">{{ icon }}</span>
      </slot>
    </div>
    
    <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    
    <button
      v-if="actionLabel"
      class="empty-state__action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
  min-height: 200px;
}

.empty-state__icon {
  margin-bottom: var(--space-md);
  color: var(--text-tertiary);
}

.icon-emoji {
  font-size: 48px;
  line-height: 1;
}

.empty-state__title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-sm);
}

.empty-state__description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-lg);
  max-width: 320px;
  line-height: var(--line-height-normal);
}

.empty-state__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  height: var(--btn-height-md);
  padding: 0 var(--btn-padding-x-md);
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--bg-primary);
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.empty-state__action:hover {
  background: var(--accent-primary-hover);
}

.empty-state__action:active {
  transform: scale(0.98);
}

.empty-state__action:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
</style>
