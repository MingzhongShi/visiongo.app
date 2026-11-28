import { Suspense, useCallback, useState, type ComponentType } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { renderRoute, SSRPages } from './routes';
import { useSiteLocation } from './useSiteLocation';
import type { SupportedLocale } from './types/i18n';
import { appText } from './i18n/text/App';

interface AppProps { initialPath?: string; initialLocale?: SupportedLocale; ssrPages?: Record<string, Record<string, ComponentType>> }

function AppContent({ initialPath }: AppProps) {
  const { locale } = useLanguage();
  const { path, navigate, followLink } = useSiteLocation(locale, initialPath);
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openContact = useCallback(() => setContactOpen(true), []);
  const zh = locale === 'zh';
  return (
    <div onClick={followLink} className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-xl focus:bg-white focus:p-3 focus:text-zinc-900 focus:shadow-lg dark:focus:bg-zinc-800 dark:focus:text-white" href="#main-content">{appText(zh).skipToContent}</a>
      <Navbar currentPath={path} onNavigate={navigate} onOpenContact={openContact} />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<div role="status" className="page-shell text-zinc-600 dark:text-zinc-400">{appText(zh).loadingPage}</div>}>
          {renderRoute(path, { navigate, openContact })}
        </Suspense>
      </main>
      <Footer onNavigate={navigate} onOpenContact={openContact} />
      <ContactModal isOpen={contactOpen} onClose={closeContact} />
    </div>
  );
}

export function App(props: AppProps) {
  const locale = props.initialLocale || (props.initialPath ? (props.initialPath === '/zh' || props.initialPath.startsWith('/zh/') ? 'zh' : 'en') : undefined);
  return <SSRPages.Provider value={props.ssrPages}><ThemeProvider><AuthProvider><LanguageProvider initialLocale={locale}><AppContent {...props} /></LanguageProvider></AuthProvider></ThemeProvider></SSRPages.Provider>;
}
export default App;
