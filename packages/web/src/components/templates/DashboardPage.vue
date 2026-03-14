<template>
  <div class="dashboard-page">
    <PageHeader :title="title" :subtitle="subtitle" />

    <div class="dashboard-page__content">
      <!-- Stats Section -->
      <div v-if="$slots.stats" class="dashboard-page__stats">
        <slot name="stats" />
      </div>

      <!-- Main Layout: Content + Optional Sidebar -->
      <div class="dashboard-page__main">
        <div class="dashboard-page__body">
          <slot />
        </div>

        <aside v-if="$slots.sidebar" class="dashboard-page__sidebar">
          <slot name="sidebar" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../PageHeader.vue'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.dashboard-page__content {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.dashboard-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

.dashboard-page__main {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  flex: 1;
}

.dashboard-page__main:has(.dashboard-page__sidebar) {
  grid-template-columns: 1fr 320px;
}

.dashboard-page__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.dashboard-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (max-width: 1024px) {
  .dashboard-page__main:has(.dashboard-page__sidebar) {
    grid-template-columns: 1fr;
  }

  .dashboard-page__sidebar {
    order: -1;
  }
}

@media (max-width: 640px) {
  .dashboard-page__stats {
    grid-template-columns: 1fr;
  }
}
</style>
