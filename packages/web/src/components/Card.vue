<template>
  <div class="card" :class="`card--${variant}`">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    
    <div class="card__body">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
type CardVariant = 'stat' | 'content' | 'form' | 'list'

withDefaults(defineProps<{
  variant?: CardVariant
}>(), {
  variant: 'content'
})
</script>

<style scoped>
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--card-border-radius);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.card:hover {
  border-color: var(--border-hover);
}

.card__header {
  padding: var(--card-padding-md);
  border-bottom: 1px solid var(--border-primary);
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.card__body {
  padding: var(--card-padding-md);
  color: var(--text-primary);
}

.card__footer {
  padding: var(--card-padding-md);
  border-top: 1px solid var(--border-primary);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* Variant: stat - Compact, centered, icon + value */
.card--stat {
  text-align: center;
}

.card--stat .card__header {
  display: none;
}

.card--stat .card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--card-padding-sm);
  gap: var(--space-xs);
}

.card--stat .card__footer {
  text-align: center;
  padding: var(--space-xs) var(--card-padding-sm);
}

/* Variant: content - Standard padding, header + body */
.card--content .card__body {
  padding: var(--card-padding-md);
}

/* Variant: form - Larger padding, section grouping */
.card--form {
  border-radius: var(--radius-lg);
}

.card--form .card__header {
  padding: var(--card-padding-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.card--form .card__body {
  padding: var(--card-padding-lg);
}

.card--form .card__footer {
  padding: var(--card-padding-lg);
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}

/* Variant: list - Minimal padding for list items */
.card--list {
  border-radius: var(--radius-md);
}

.card--list .card__header {
  padding: var(--space-sm) var(--card-padding-sm);
  font-size: var(--font-sm);
}

.card--list .card__body {
  padding: 0;
}

.card--list .card__footer {
  padding: var(--space-sm) var(--card-padding-sm);
}
</style>
