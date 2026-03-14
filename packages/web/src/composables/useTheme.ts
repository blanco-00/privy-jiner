import { ref, watch } from 'vue';

export type Theme = 'dark' | 'light' | 'purple' | 'pink' | 'red' | 'orange' | 'cyan' | 'green';

const STORAGE_KEY = 'privy-jiner-theme';

const currentTheme = ref<Theme>('dark');

export function useTheme() {
  const initTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && isValidTheme(saved)) {
      currentTheme.value = saved;
    }
    applyTheme(currentTheme.value);
  };

  const setTheme = (theme: Theme) => {
    if (!isValidTheme(theme)) return;
    currentTheme.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'purple', 'pink', 'red', 'orange', 'cyan', 'green'];
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const isValidTheme = (theme: string): theme is Theme => {
    return ['dark', 'light', 'purple', 'pink', 'red', 'orange', 'cyan', 'green'].includes(theme);
  };

  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
