<template>
  <div class="list-page">
    <PageHeader :title="title" :subtitle="subtitle">
      <slot name="header-actions" />
    </PageHeader>

    <div class="list-page__content">
      <!-- Filters Section -->
      <div v-if="$slots.filters" class="list-page__filters">
        <slot name="filters" />
      </div>

      <!-- Main Content -->
      <Card variant="list" class="list-page__card">
        <template #header v-if="$slots['card-header']">
          <slot name="card-header" />
        </template>
        
        <slot />
        
        <template #footer v-if="$slots.footer">
          <slot name="footer" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../PageHeader.vue'
import Card from '../Card.vue'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.list-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.list-page__content {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.list-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}

.list-page__card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-page__card :deep(.card__body) {
  flex: 1;
  overflow: auto;
}
</style>
