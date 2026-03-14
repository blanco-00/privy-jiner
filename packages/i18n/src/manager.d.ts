import { Locale, TranslationKeys } from './translations.js';
export interface I18nOptions {
    defaultLocale?: Locale;
    fallbackLocale?: Locale;
    storageKey?: string;
}
export declare class I18nManager {
    private currentLocale;
    private defaultLocale;
    private fallbackLocale;
    private storageKey;
    private listeners;
    constructor(options?: I18nOptions);
    private detectLocale;
    private getConfigPath;
    private getStoredLocale;
    private getSystemLanguage;
    private isValidLocale;
    setLocale(locale: Locale): void;
    getLocale(): Locale;
    t(key: string, params?: Record<string, string | number>): string;
    onLocaleChange(listener: (locale: Locale) => void): () => void;
    getAvailableLocales(): Locale[];
    getTranslations(): TranslationKeys;
}
export declare const i18n: I18nManager;
//# sourceMappingURL=manager.d.ts.map