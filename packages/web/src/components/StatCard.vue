<template>
  <div class="stat-card" :class="variantClass">
    <div class="stat-icon" v-if="icon">
      <span v-html="icon"></span>
    </div>
    <div class="stat-content">
      <div class="stat-header">
        <span class="stat-value">{{ formattedValue }}</span>
        <span 
          v-if="trend !== undefined" 
          class="stat-trend"
          :class="trendClass"
        >
          {{ formattedTrend }}
        </span>
      </div>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  trend?: number
  icon?: string
}>()

const variantClass = computed(() => {
  if (props.trend === undefined) return 'variant-default'
  if (props.trend > 0) return 'variant-positive'
  if (props.trend < 0) return 'variant-negative'
  return 'variant-default'
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  if (props.trend > 0) return 'trend-up'
  if (props.trend < 0) return 'trend-down'
  return 'trend-neutral'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const formattedTrend = computed(() => {
  if (props.trend === undefined) return ''
  const prefix = props.trend > 0 ? '+' : ''
  return `${prefix}${props.trend.toFixed(1)}%`
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--card-padding-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--card-border-radius);
  transition: all var(--transition-base);
}

.stat-card:hover {
  border-color: var(--border-hover);
  background: var(--bg-tertiary);
}

.stat-card.variant-positive {
  border-left: 3px solid var(--accent-success);
}

.stat-card.variant-negative {
  border-left: 3px solid var(--accent-danger);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.stat-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
  flex: 1;
}

.stat-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.stat-value {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.stat-trend {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.stat-trend.trend-up {
  color: var(--accent-success);
  background: rgba(84, 232, 138, 0.15);
}

.stat-trend.trend-down {
  color: var(--accent-danger);
  background: rgba(232, 84, 84, 0.15);
}

.stat-trend.trend-neutral {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
