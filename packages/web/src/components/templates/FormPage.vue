<template>
  <div class="form-page">
    <PageHeader :title="title" />

    <div class="form-page__content">
      <Card variant="form" class="form-page__card">
        <!-- Form Sections -->
        <slot />

        <!-- Actions Footer -->
        <template #footer v-if="$slots.actions">
          <slot name="actions" />
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
}>()
</script>

<style scoped>
.form-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.form-page__content {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
}

.form-page__card {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .form-page__content {
    padding: var(--space-md);
  }
}
</style>
