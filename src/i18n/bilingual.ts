import type { SupportedLocale } from '../types/i18n';

/**
 * The text of one component in both languages. The Chinese text must have the same
 * keys as the English. Call the result with the locale, or with true for Chinese.
 */
export function bilingual<T>(text: { en: T; zh: NoInfer<T> }): (lang: SupportedLocale | boolean) => T {
  return lang => (lang === true || lang === 'zh' ? text.zh : text.en);
}
