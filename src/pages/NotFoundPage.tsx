import { SiteLink } from '../components/SiteLink';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { notFoundPageText } from '../i18n/text/NotFoundPage';

export function NotFoundPage() {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  return <div className="page-shell py-40 text-center"><SeoHead title="404 — Page not found" description={notFoundPageText(zh).thisPageDoes} noindex /><p className="text-sm text-zinc-500 dark:text-zinc-400">404</p><h1 className="my-6 text-4xl font-semibold text-zinc-950 dark:text-white">{notFoundPageText(zh).pageNotFound}</h1><SiteLink href="/" className="btn-primary">{notFoundPageText(zh).backToHome}</SiteLink></div>;
}
