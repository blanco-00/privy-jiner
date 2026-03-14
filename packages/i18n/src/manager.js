"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.I18nManager = void 0;
const translations_js_1 = require("./translations.js");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const translations = { en: translations_js_1.en, zh: translations_js_1.zh };
const isBrowser = typeof window !== 'undefined';
class I18nManager {
    currentLocale;
    defaultLocale;
    fallbackLocale;
    storageKey;
    listeners = [];
    constructor(options = {}) {
        this.defaultLocale = options.defaultLocale || 'en';
        this.fallbackLocale = options.fallbackLocale || 'en';
        this.storageKey = options.storageKey || 'privy-jiner-locale';
        this.currentLocale = this.detectLocale();
    }
    detectLocale() {
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
    getConfigPath() {
        return path.join(os.homedir(), '.privy-jiner', 'config', 'locale.json');
    }
    getStoredLocale() {
        if (isBrowser) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                return stored;
            }
            catch {
                return null;
            }
        }
        else {
            // Node.js: read from config file
            try {
                const configPath = this.getConfigPath();
                if (fs.existsSync(configPath)) {
                    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    return data.locale || null;
                }
            }
            catch {
                // ignore
            }
            return null;
        }
    }
    getSystemLanguage() {
        if (isBrowser) {
            try {
                const lang = navigator.language || navigator.language;
                if (!lang)
                    return null;
                if (lang.startsWith('zh'))
                    return 'zh';
                if (lang.startsWith('en'))
                    return 'en';
            }
            catch {
                // localStorage/navigator not available
            }
        }
        else {
            // Node.js: use process.env
            const lang = process.env.LANG || process.env.LC_ALL || '';
            if (lang.startsWith('zh'))
                return 'zh';
            if (lang.startsWith('en'))
                return 'en';
        }
        return null;
    }
    isValidLocale(locale) {
        return locale === 'en' || locale === 'zh';
    }
    setLocale(locale) {
        if (!this.isValidLocale(locale)) {
            throw new Error(`Invalid locale: ${locale}`);
        }
        this.currentLocale = locale;
        if (isBrowser) {
            try {
                localStorage.setItem(this.storageKey, locale);
            }
            catch {
                // localStorage not available
            }
        }
        else {
            // Node.js: save to config file
            try {
                const configPath = this.getConfigPath();
                const configDir = path.dirname(configPath);
                if (!fs.existsSync(configDir)) {
                    fs.mkdirSync(configDir, { recursive: true });
                }
                const data = { locale };
                fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
            }
            catch {
                // ignore
            }
        }
        for (const listener of this.listeners) {
            listener(locale);
        }
    }
    getLocale() {
        return this.currentLocale;
    }
    t(key, params) {
        const keys = key.split('.');
        let value = translations[this.currentLocale];
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                value = translations[this.fallbackLocale];
                for (const k2 of keys) {
                    if (value && typeof value === 'object' && k2 in value) {
                        value = value[k2];
                    }
                    else {
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
    onLocaleChange(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    getAvailableLocales() {
        return Object.keys(translations);
    }
    getTranslations() {
        return translations[this.currentLocale];
    }
}
exports.I18nManager = I18nManager;
exports.i18n = new I18nManager();
//# sourceMappingURL=manager.js.map