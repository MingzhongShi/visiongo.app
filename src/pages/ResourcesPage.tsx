import { useState } from 'react';
import { SiteLink } from '../components/SiteLink';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getResourceArticles } from '../data/resources';
import { SafeMarkdown } from '../components/SafeMarkdown';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { navbarText } from '../i18n/text/Navbar';
import { resourcesPageText } from '../i18n/text/ResourcesPage';

type ResourceFilter = 'all' | 'tutorial' | 'architecture' | 'troubleshooting' | 'checklist';

export function ResourcesPage({ slug }: { slug?: string }) {
  const { locale } = useLanguage();
  const tx = resourcesPageText(locale);
  const articles = getResourceArticles(locale);
  const article = slug ? articles.find(item => item.slug === slug) : undefined;
  const [filter, setFilter] = useState<ResourceFilter>('all');
  const filteredArticles = filter === 'all' ? articles : articles.filter(item => item.category === filter);

  return (
    <div className="page-shell">
      <SeoHead
        title={article?.title || tx.resourcesEngineeringGuides}
        description={article?.summary || tx.readPracticalVisiongo}
        canonicalPath={article ? `/resources/${article.slug}` : '/resources'}
      />
      {article ? (
        <article className="mx-auto max-w-3xl">
          <SiteLink href="/resources" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />{tx.backToResources}
          </SiteLink>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {article.category && (
              <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {tx.categoryLabels[article.category]}
              </span>
            )}
            <span>{article.date} · {article.readTime}</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-zinc-950 dark:text-white sm:text-4xl">{article.title}</h1>
          <p className="mb-8 mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{article.summary}</p>
          <SafeMarkdown headingOffset={0} content={article.contentMarkdown || ''} />
          <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <SiteLink href="/downloads" className="btn-primary">{tx.chooseARelease}<ArrowRight className="h-4 w-4" /></SiteLink>
          </div>
        </article>
      ) : (
        <>
          <SectionHeader as="h1" badge={navbarText(locale).resources} title={tx.engineeringResourcesAnd} description={tx.practicalGuidanceFor} />

          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={navbarText(locale).resources}>
            {([
              ['all', tx.filterAll],
              ['tutorial', tx.filterTutorial],
              ['architecture', tx.filterArchitecture],
              ['troubleshooting', tx.filterTroubleshooting],
              ['checklist', tx.filterChecklist],
            ] as const).map(([key, label]) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(key)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div id="tutorials" className="grid gap-6 sm:grid-cols-2">
            {filteredArticles.map(item => (
              <SiteLink className="card-link group flex flex-col p-6" key={item.slug} href={`/resources/${item.slug}`}>
                <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{item.date} · {item.readTime}</span>
                  {item.category && (
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                      {tx.categoryLabels[item.category]}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-zinc-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{item.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.summary}</p>
                <span className="text-link mt-5">{tx.readGuide}<ArrowRight className="h-4 w-4" /></span>
              </SiteLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
