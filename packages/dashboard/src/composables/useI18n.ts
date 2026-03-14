import { ref, computed } from 'vue';
import { translations } from '../i18n';

const locale = ref('en');

export function useI18n() {
  const currentLocale = computed(() => locale.value);
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale.value];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const currency = computed(() => locale.value === 'zh' ? '¥' : '$');

  const setLocale = (newLocale: string) => {
    locale.value = newLocale;
    localStorage.setItem('privy-jiner-locale', newLocale);
  };

  const initLocale = () => {
    const saved = localStorage.getItem('privy-jiner-locale');
    if (saved) {
      locale.value = saved;
    }
  };

  return {
    locale: currentLocale,
    t,
    setLocale,
    initLocale,
    currency,
  };
}

export function getCurrencySymbol(): string {
  const saved = localStorage.getItem('privy-jiner-locale');
  return saved === 'zh' ? '¥' : '$';
}
