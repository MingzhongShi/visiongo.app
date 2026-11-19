import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X, User } from 'lucide-react';
import { SiteLink } from './SiteLink';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { navbarText } from '../i18n/text/Navbar';

const PRODUCT_LINKS = [['visionstudio', 'VisionStudio'], ['visionruntime', 'VisionRuntime'], ['visionedge', 'VisionEdge'], ['visioncloud', 'VisionCloud']] as const;

export function Navbar({ currentPath, onOpenContact }: { currentPath: string; onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [products, setProducts] = useState(false);
  const header = useRef<HTMLElement>(null);
  useEffect(() => { setMobile(false); setProducts(false); }, [currentPath, locale]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) { setMobile(false); setProducts(false); } };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  // The current section: white text with an emerald underline.
  const activeLink = 'text-white underline decoration-emerald-400 decoration-2 underline-offset-[10px]';
  const links = [{ path: '/solutions', label: navbarText(locale).solutions }, { path: '/developers', label: navbarText(locale).developers }, { path: '/resources', label: navbarText(locale).resources }];
  return <header ref={header} className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md" onKeyDown={event => { if (event.key === 'Escape') { setMobile(false); setProducts(false); } }}>
    <div className="site-container flex h-16 items-center justify-between gap-4"><SiteLink href="/" className="text-lg font-semibold tracking-wider text-white">VISION<span className="text-emerald-400">GO</span></SiteLink>
      <nav aria-label={navbarText(locale).mainNavigation} className="hidden items-center gap-2 xl:flex">
        <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setProducts(false); }}><button aria-expanded={products} aria-controls="product-navigation" onClick={() => setProducts(value => !value)} className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-zinc-900 ${currentPath.startsWith('/products/') ? activeLink : 'text-zinc-300'}`}>{navbarText(locale).products}<ChevronDown className="h-4 w-4" /></button>{products && <div id="product-navigation" className="absolute left-0 top-full w-60 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl">{PRODUCT_LINKS.map(([product, name]) => <SiteLink key={product} href={`/products/${product}`} onClick={() => setProducts(false)} aria-current={currentPath === `/products/${product}` ? 'page' : undefined} className={`block rounded-lg px-3 py-3 text-sm hover:bg-zinc-800 ${currentPath === `/products/${product}` ? 'text-emerald-300' : 'text-zinc-300'}`}>{name}</SiteLink>)}</div>}</div>
        {links.map(link => <SiteLink key={link.path} href={link.path} aria-current={currentPath === link.path ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm hover:bg-zinc-900 ${currentPath === link.path || currentPath.startsWith(`${link.path}/`) ? activeLink : 'text-zinc-400'}`}>{link.label}</SiteLink>)}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3"><LanguageSwitcher /><SiteLink href="/my" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white sm:inline-flex"><User className="h-4 w-4" />{user ? (navbarText(locale).myAccount) : (navbarText(locale).signIn)}</SiteLink><SiteLink href="/downloads" className="btn-primary btn-sm hidden sm:inline-flex">{navbarText(locale).downloads}</SiteLink><button onClick={() => setMobile(value => !value)} aria-label={navbarText(locale).toggleNavigation} aria-expanded={mobile} aria-controls="mobile-navigation" className="rounded-lg p-3 text-zinc-300 hover:bg-zinc-900 xl:hidden">{mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
    </div>
    {mobile && <nav id="mobile-navigation" aria-label={navbarText(locale).mobileNavigation} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-zinc-800 px-4 py-4 xl:hidden" onClick={event => { if ((event.target as Element).closest('a')) setMobile(false); }}><div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">{PRODUCT_LINKS.map(([product, name]) => <SiteLink key={product} href={`/products/${product}`} className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-900">{name}</SiteLink>)}{links.map(link => <SiteLink key={link.path} href={link.path} className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-900">{link.label}</SiteLink>)}<SiteLink href="/my" className="rounded-lg px-3 py-3 text-sm text-zinc-300">{navbarText(locale).accountSignIn}</SiteLink><SiteLink href="/downloads" className="btn-primary">{navbarText(locale).downloads}</SiteLink><button className="btn-secondary" onClick={() => { setMobile(false); onOpenContact(); }}>{navbarText(locale).contactEngineering}</button></div></nav>}
  </header>;
}
