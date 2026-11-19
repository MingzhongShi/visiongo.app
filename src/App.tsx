import { Suspense, useCallback, useState, type ComponentType } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { renderRoute, SSRPages } from './routes';
import { useSiteLocation } from './useSiteLocation';
import type { SupportedLocale } from './types/i18n';

interface AppProps { initialPath?: string; initialLocale?: SupportedLocale; ssrPages?: Record<string, Record<string, ComponentType>> }

function AppContent({ initialPath }: AppProps) {
  const { locale } = useLanguage();
  const { path, navigate, followLink } = useSiteLocation(locale, initialPath);
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openContact = useCallback(() => setContactOpen(true), []);
  const zh = locale === 'zh';
  return (
    <div onClick={followLink} className="flex min-h-screen flex-col bg-zinc-950">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-xl focus:bg-zinc-800 focus:p-3 focus:text-white" href="#main-content">{zh ? '跳到正文' : 'Skip to content'}</a>
      <Navbar currentPath={path} onNavigate={navigate} onOpenContact={openContact} />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<div role="status" className="page-shell text-zinc-400">{zh ? '正在加载页面…' : 'Loading page…'}</div>}>
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
  return <SSRPages.Provider value={props.ssrPages}><AuthProvider><LanguageProvider initialLocale={locale}><AppContent {...props} /></LanguageProvider></AuthProvider></SSRPages.Provider>;
}
export default App;
