<template>
  <header class="page-header">
    <div class="header-content">
      <div class="header-left">
        <!-- Breadcrumbs -->
        <nav v-if="breadcrumbs?.length || $slots.breadcrumbs" class="breadcrumbs" aria-label="Breadcrumb">
          <slot name="breadcrumbs">
            <ol class="breadcrumb-list">
              <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
                <router-link v-if="crumb.to" :to="crumb.to" class="breadcrumb-link">
                  {{ crumb.label }}
                </router-link>
                <span v-else class="breadcrumb-text">{{ crumb.label }}</span>
                <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
              </li>
            </ol>
          </slot>
        </nav>

        <!-- Title Section -->
        <div class="title-section">
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <!-- Actions Slot -->
      <div v-if="$slots.default" class="header-actions">
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
}>()
</script>

<style scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  min-height: var(--page-header-height);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
  flex: 1;
}

/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: var(--space-xs);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-sm);
  transition: color var(--transition-fast);
}

.breadcrumb-link:hover {
  color: var(--text-primary);
}

.breadcrumb-text {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.breadcrumb-separator {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  margin: 0 var(--space-sm);
  user-select: none;
}

/* Title Section */
.title-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.page-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
}

.page-subtitle {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-md);
  }

  .header-actions {
    justify-content: flex-start;
    margin-top: var(--space-sm);
  }
}
</style>
