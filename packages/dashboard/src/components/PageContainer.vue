<template>
  <div class="page-container">
    <header v-if="$slots.header" class="page-header">
      <slot name="header" />
    </header>
    <main class="page-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    maxWidth?: string
  }>(),
  {
    maxWidth: '900px'
  }
)
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--page-padding);
  max-width: v-bind(props.maxWidth);
  margin: 0 auto;
  width: 100%;
}

.page-header {
  min-height: var(--page-header-height);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--space-lg);
  }
}
</style>
