import { en, zh, Locale, TranslationKeys } from './translations.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const translations: Record<Locale, TranslationKeys> = { en, zh };

export const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'] as const;
export type RTLLocale = typeof RTL_LOCALES[number];

export interface I18nOptions {
  defaultLocale?: Locale;
  fallbackLocale?: Locale;
  storageKey?: string;
}

const isBrowser = typeof window !== 'undefined';

export class I18nManager {
  private currentLocale: Locale;
  private defaultLocale: Locale;
  private fallbackLocale: Locale;
  private storageKey: string;
  private listeners: Array<(locale: Locale) => void> = [];

  constructor(options: I18nOptions = {}) {
    this.defaultLocale = options.defaultLocale || 'en';
    this.fallbackLocale = options.fallbackLocale || 'en';
    this.storageKey = options.storageKey || 'privy-jiner-locale';
    this.currentLocale = this.detectLocale();
  }

  private detectLocale(): Locale {
    const stored = this.getStoredLocale();
    if (stored && this.isValidLocale(stored)) {
      return stored;
    }

    const systemLang = this.getSystemLanguage();
    if (systemLang && this.isValidLocale(systemLang)) {
      return systemLang;
    }

    return this.defaultLocale;
  }

  private getConfigPath(): string {
    return path.join(os.homedir(), '.privy-jiner', 'config', 'locale.json');
  }

  private getStoredLocale(): Locale | null {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored as Locale | null;
      } catch {
        return null;
      }
    } else {
      // Node.js: read from config file
      try {
        const configPath = this.getConfigPath();
        if (fs.existsSync(configPath)) {
          const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          return data.locale as Locale || null;
        }
      } catch {
        // ignore
      }
      return null;
    }
  }

  private getSystemLanguage(): Locale | null {
    if (isBrowser) {
      try {
        const lang = navigator.language || (navigator as { language?: string }).language;
        if (!lang) return null;

        if (lang.startsWith('zh')) return 'zh';
        if (lang.startsWith('en')) return 'en';
      } catch {
        // localStorage/navigator not available
      }
    } else {
      // Node.js: use process.env
      const lang = process.env.LANG || process.env.LC_ALL || '';
      if (lang.startsWith('zh')) return 'zh';
      if (lang.startsWith('en')) return 'en';
    }
    return null;
  }

  private isValidLocale(locale: string): locale is Locale {
    return locale === 'en' || locale === 'zh';
  }

  setLocale(locale: Locale): void {
    if (!this.isValidLocale(locale)) {
      throw new Error(`Invalid locale: ${locale}`);
    }

    this.currentLocale = locale;

    if (isBrowser) {
      try {
        localStorage.setItem(this.storageKey, locale);
      } catch {
        // localStorage not available
      }
    } else {
      // Node.js: save to config file
      try {
        const configPath = this.getConfigPath();
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        const data = { locale };
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      } catch {
        // ignore
      }
    }

    for (const listener of this.listeners) {
      listener(locale);
    }
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: unknown = translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = translations[this.fallbackLocale];
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = (value as Record<string, unknown>)[k2];
          } else {
            return key;
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{${paramKey}}`;
      });
    }

    return value;
  }

  onLocaleChange(listener: (locale: Locale) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getAvailableLocales(): Locale[] {
    return Object.keys(translations) as Locale[];
  }

  getTranslations(): TranslationKeys {
    return translations[this.currentLocale];
  }

  isRTL(): boolean {
    return RTL_LOCALES.includes(this.currentLocale as RTLLocale);
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  getRTLStyle(): string {
    if (this.isRTL()) {
      return 'direction: rtl; text-align: right;';
    }
    return 'direction: ltr; text-align: left;';
  }
}

export const i18n = new I18nManager();
