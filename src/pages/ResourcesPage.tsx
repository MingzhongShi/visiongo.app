import { SiteLink } from '../components/SiteLink';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getResourceArticles } from '../data/resources';
import { SafeMarkdown } from '../components/SafeMarkdown';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { navbarText } from '../i18n/text/Navbar';
import { resourcesPageText } from '../i18n/text/ResourcesPage';

export function ResourcesPage({ slug }: { slug?: string }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const articles = getResourceArticles(locale);
  const article = slug ? articles.find(item => item.slug === slug) : undefined;
  return <div className="page-shell">
    <SeoHead title={article?.title || (resourcesPageText(zh).resourcesEngineeringGuides)} description={article?.summary || (resourcesPageText(zh).readPracticalVisiongo)} canonicalPath={article ? `/resources/${article.slug}` : '/resources'} />
    {article ? <article className="mx-auto max-w-3xl"><SiteLink href="/resources" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />{resourcesPageText(zh).backToResources}</SiteLink><p className="mb-3 text-xs text-zinc-400">{article.date} · {article.readTime}</p><h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{article.title}</h1><p className="mb-8 mt-4 leading-relaxed text-zinc-400">{article.summary}</p><SafeMarkdown headingOffset={0} content={article.contentMarkdown || ''} /><div className="mt-10 border-t border-zinc-800 pt-6"><SiteLink href="/downloads" className="btn-primary">{resourcesPageText(zh).chooseARelease}<ArrowRight className="h-4 w-4" /></SiteLink></div></article> : <>
      <SectionHeader as="h1" badge={navbarText(zh).resources} title={resourcesPageText(zh).engineeringResourcesAnd} description={resourcesPageText(zh).practicalGuidanceFor} />
      <div id="tutorials" className="grid gap-6 sm:grid-cols-2">{articles.map(item => <SiteLink className="card-link group flex flex-col p-6" key={item.slug} href={`/resources/${item.slug}`}><p className="text-xs text-zinc-400">{item.date} · {item.readTime}</p><h2 className="mt-3 text-xl font-semibold text-white group-hover:text-emerald-300">{item.title}</h2><p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{item.summary}</p><span className="text-link mt-5">{resourcesPageText(zh).readGuide}<ArrowRight className="h-4 w-4" /></span></SiteLink>)}</div>
    </>}
  </div>;
}
