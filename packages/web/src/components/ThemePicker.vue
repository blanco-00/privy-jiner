<template>
  <div class="theme-picker">
    <div class="theme-picker__swatches">
      <button
        v-for="themeOption in themes"
        :key="themeOption.id"
        class="theme-picker__swatch"
        :class="{ 'theme-picker__swatch--active': theme === themeOption.id }"
        :style="{ '--swatch-color': themeOption.color }"
        :title="themeOption.label"
        @click="setTheme(themeOption.id)"
      >
        <span class="theme-picker__swatch-inner">
          <span class="theme-picker__swatch-preview"></span>
        </span>
        <svg
          v-if="theme === themeOption.id"
          class="theme-picker__check"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme, type Theme } from '../composables/useTheme'

const { theme, setTheme } = useTheme()

interface ThemeOption {
  id: Theme
  label: string
  color: string
}

const themes = computed<ThemeOption[]>(() => [
  { id: 'dark', label: 'Dark', color: '#0f0f0f' },
  { id: 'light', label: 'Light', color: '#ffffff' },
  { id: 'purple', label: 'Purple', color: '#722ed1' },
  { id: 'pink', label: 'Pink', color: '#eb2f96' },
  { id: 'red', label: 'Red', color: '#f5222d' },
  { id: 'orange', label: 'Orange', color: '#fa541c' },
  { id: 'cyan', label: 'Cyan', color: '#13c2c2' },
  { id: 'green', label: 'Green', color: '#52c41a' },
])
</script>

<style scoped>
.theme-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.theme-picker__swatches {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.theme-picker__swatch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: transparent;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-picker__swatch:hover {
  border-color: var(--border-hover);
  transform: scale(1.05);
}

.theme-picker__swatch--active {
  border-color: var(--swatch-color);
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--swatch-color);
}

.theme-picker__swatch-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.theme-picker__swatch-preview {
  width: 100%;
  height: 100%;
  background: var(--swatch-color);
  border-radius: var(--radius-sm);
}

.theme-picker__swatch--active .theme-picker__swatch-inner {
  opacity: 0.9;
}

.theme-picker__check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-primary);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Light theme needs dark check */
.theme-picker__swatch[data-theme='light'] .theme-picker__check,
.theme-picker__swatch:first-child + .theme-picker__swatch .theme-picker__check {
  color: var(--text-primary);
}
</style>
