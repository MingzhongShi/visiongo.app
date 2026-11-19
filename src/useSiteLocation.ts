import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { localizedPath, stripLocalePath } from '../shared/routing';
import type { SupportedLocale } from './types/i18n';

const locationPath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

/**
 * Client-side navigation: the current location, navigate() with the locale prefix,
 * back/forward, scrolling to #anchors of lazily loaded pages, and same-site link clicks.
 */
export function useSiteLocation(locale: SupportedLocale, initialPath?: string) {
  const [location, setLocation] = useState(() => initialPath || (typeof window !== 'undefined' ? locationPath() : '/'));
  const path = stripLocalePath(location.split(/[?#]/)[0]);

  useEffect(() => {
    const update = () => setLocation(locationPath());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  const navigate = useCallback((target: string) => {
    const next = localizedPath(target, locale);
    if (next === locationPath()) return;
    window.history.pushState({}, '', next);
    setLocation(next);
    if (!new URL(next, window.location.origin).hash) window.scrollTo(0, 0);
  }, [locale]);

  useEffect(() => {
    const hash = new URL(location, window.location.origin).hash.slice(1);
    if (!hash) return;
    // A lazy-loaded route may not have committed when this effect runs.
    let stopped = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const scroll = () => {
      if (stopped) return;
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      else if (++tries < 30) timer = setTimeout(scroll, 50);
    };
    scroll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [location]);

  /** Click handler for the page shell: same-site links navigate without a reload. */
  const followLink = useCallback((event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  }, [navigate]);

  return { path, navigate, followLink };
}
