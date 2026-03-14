<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V6c0-1.1.9-2 2-2" />
    <line x1="10" y1="6" x2="16" y2="6" />
    <line x1="10" y1="10" x2="16" y2="10" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<style scoped>
svg {
  display: block;
  flex-shrink: 0;
}
</style>
