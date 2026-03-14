# Translation Guide

This guide explains how to add new language support to Privy-Jiner.

## Overview

Privy-Jiner uses i18next for internationalization. Translations are stored in `packages/i18n/src/translations.ts`.

## Adding a New Language

### Step 1: Add Translation Keys

Edit `packages/i18n/src/translations.ts` and add a new object for your language:

```typescript
export const fr = {
  common: {
    appName: 'Privy-Jiner',
    loading: 'Chargement...',
    // ... other keys
  },
  nav: {
    dashboard: 'Tableau de bord',
    // ... other keys
  },
  // ... other categories
};
```

### Step 2: Update Type Definitions

Add your locale to the Locale type:

```typescript
export type Locale = 'en' | 'zh' | 'fr';
```

### Step 3: Update I18nManager

Update the `I18nManager` class to support your language in:

- `detectLocale()` - Add language detection for your locale
- `getSystemLanguage()` - Add system language detection

### Step 4: Rebuild

```bash
npm run build
```

## Translation Key Structure

Keys are organized by functional area:

- `common` - Common UI elements (buttons, labels)
- `nav` - Navigation items
- `dashboard` - Dashboard-related text
- `finance` - Finance module
- `health` - Health module
- `fashion` - Fashion module
- `knowledge` - Knowledge module
- `news` - News module
- `settings` - Settings page
- `plugins` - Plugin management
- `errors` - Error messages

## Best Practices

1. **Keep keys consistent** - Use the same key structure across all languages
2. **Use interpolation** - For dynamic values, use `{key}` syntax: `Hello, {name}!`
3. **Test thoroughly** - Verify all UI elements render correctly
4. **Consider RTL** - For right-to-left languages, additional CSS may be needed
5. **Fallback locale** - Always provide a fallback for missing translations

## Example: Adding French Support

```typescript
// In translations.ts
export const fr = {
  common: {
    appName: 'Privy-Jiner',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    // ...
  },
  // ...
};

// In manager.ts
private isValidLocale(locale: string): locale is Locale {
  return locale === 'en' || locale === 'zh' || locale === 'fr';
}
```

## Running with Different Locales

### CLI

```bash
LANG=fr npm run dev
```

### Configuration

Set default locale in `~/.privy-jiner/config.json`:

```json
{
  "i18n": {
    "defaultLocale": "fr",
    "fallbackLocale": "en"
  }
}
```

## Notes

- The i18n system automatically detects browser language in web mode
- In Node.js mode, it uses system environment variables (LANG, LC_ALL)
- Locale preference is persisted in `~/.privy-jiner/config/locale.json` (Node.js) or localStorage (browser)
