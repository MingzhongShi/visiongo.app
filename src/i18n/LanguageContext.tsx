import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { localizedPath } from '../../shared/routing';
import { SUPPORTED_LANGUAGES, type SupportedLocale, type LanguageInfo } from '../types/i18n';

interface LanguageContextType { locale: SupportedLocale; setLocale: (locale: SupportedLocale) => void; languages: LanguageInfo[] }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const browserLocale = (): SupportedLocale => window.location.pathname === '/zh' || window.location.pathname.startsWith('/zh/') || new URLSearchParams(window.location.search).get('lang') === 'zh' ? 'zh' : 'en';

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: SupportedLocale }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => initialLocale || (typeof window !== 'undefined' ? browserLocale() : 'en'));
  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next);
    try { localStorage.setItem('visiongo_locale', next); } catch { /* Storage may be unavailable in privacy mode. */ }
    // The server reads this to keep an explicit choice over the edition's default language.
    document.cookie = `visiongo_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState({}, '', localizedPath(current, next));
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  useEffect(() => {
    const update = () => setLocaleState(browserLocale());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  useEffect(() => { document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'; }, [locale]);
  return <LanguageContext.Provider value={{ locale, setLocale, languages: SUPPORTED_LANGUAGES }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
