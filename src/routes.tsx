/**
 * Which page renders at which path. The public paths themselves (titles, SEO,
 * sitemap) are listed in shared/routes.json; this table maps them to components.
 */
import { createContext, lazy, useContext, type ComponentType, type ReactElement } from 'react';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { isPublicPath } from '../shared/routing';
import type { DownloadableProduct } from './types/downloads';

type PageModules = Record<string, Record<string, ComponentType>>;

// Only the prerender script supplies synchronous page modules; they never enter the client bundle.
export const SSRPages = createContext<PageModules | undefined>(undefined);
const browserPages = import.meta.glob<Record<string, ComponentType>>(['./pages/*.tsx', '!./pages/HomePage.tsx', '!./pages/NotFoundPage.tsx']);

/** A page loaded on demand in the browser and synchronously during prerendering. */
function page<P extends object>(file: string, name = file): ComponentType<P> {
  const BrowserPage = lazy(async () => ({ default: (await browserPages[`./pages/${file}.tsx`]())[name] as ComponentType<P> }));
  return function Page(props: P) {
    const serverPages = useContext(SSRPages);
    const Component = serverPages ? serverPages[file][name] as ComponentType<P> : BrowserPage;
    return <Component {...props} />;
  };
}

type Props<T extends (props: never) => unknown> = Parameters<T>[0];
const ProductPage = page<Props<typeof import('./pages/ProductPage').ProductPage>>('ProductPage');
const DownloadsPage = page<Props<typeof import('./pages/DownloadsPage').DownloadsPage>>('DownloadsPage');
const SolutionsPage = page<Props<typeof import('./pages/SolutionsPage').SolutionsPage>>('SolutionsPage');
const DevelopersPage = page<Props<typeof import('./pages/DevelopersPage').DevelopersPage>>('DevelopersPage');
const ResourcesPage = page<{ slug?: string }>('ResourcesPage');
const AboutPage = page<Props<typeof import('./pages/AboutPage').AboutPage>>('AboutPage');
const AccountPage = page<Props<typeof import('./pages/AccountPage').AccountPage>>('AccountPage');
const ContactPage = page<Record<string, never>>('ContactPage');
const PrivacyPolicyPage = page<Record<string, never>>('PrivacyPolicyPage');
const TermsOfUsePage = page<Record<string, never>>('TermsOfUsePage');
const DesktopAuthPage = page<Record<string, never>>('DesktopAuthPage');

export interface RouteContext {
  navigate: (path: string) => void;
  openContact: () => void;
}

const exact = new Map<string, (c: RouteContext) => ReactElement>([
  ['/', c => <HomePage onNavigate={c.navigate} onOpenContact={c.openContact} />],
  ['/solutions', c => <SolutionsPage onNavigate={c.navigate} onOpenContact={c.openContact} />],
  ['/developers', c => <DevelopersPage onNavigate={c.navigate} />],
  ['/resources', () => <ResourcesPage />],
  ['/about', c => <AboutPage onOpenContact={c.openContact} />],
  ['/contact', () => <ContactPage />],
  ['/privacy', () => <PrivacyPolicyPage />],
  ['/terms', () => <TermsOfUsePage />],
  ['/my', c => <AccountPage onNavigate={c.navigate} />],
  ['/account', c => <AccountPage onNavigate={c.navigate} />],
  ['/auth/desktop', () => <DesktopAuthPage />],
]);

/** Public paths with a parameter; `rest` is the path after the prefix. */
const prefixed: Array<[string, (rest: string, c: RouteContext) => ReactElement]> = [
  ['/products/', (slug, c) => <ProductPage slug={slug} onNavigate={c.navigate} onOpenContact={c.openContact} />],
  ['/downloads', (rest, c) => {
    const [, product, version] = rest.split('/');
    return <DownloadsPage initialProduct={product as DownloadableProduct | undefined} initialVersion={version} onNavigate={c.navigate} onOpenContact={c.openContact} />;
  }],
  ['/resources/', slug => <ResourcesPage slug={slug} />],
];

/** The page for a path without its locale prefix. */
export function renderRoute(path: string, context: RouteContext): ReactElement {
  for (const [prefix, render] of prefixed) {
    if (path.startsWith(prefix) && isPublicPath(path)) return render(path.slice(prefix.length), context);
  }
  return exact.get(path)?.(context) ?? <NotFoundPage />;
}
