import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { getSolutions } from '../data/solutions';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { SiteLink } from '../components/SiteLink';
import { useLanguage } from '../i18n/LanguageContext';
import { solutionsPageText } from '../i18n/text/SolutionsPage';

interface SolutionsPageProps {
  onNavigate: (path: string) => void;
  onOpenContact: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onNavigate }) => {
  const { locale } = useLanguage();
  const tx = solutionsPageText(locale);
  const solutions = getSolutions(locale);
  const [filter, setFilter] = useState<'all' | 'task' | 'industry'>('all');
  const visibleSolutions = filter === 'all' ? solutions : solutions.filter(item => item.category === filter);

  return (
    <div className="page-shell">
      <SeoHead title={tx.solutions} description={tx.exploreIndustrialVision} canonicalPath="/solutions" />
      <SectionHeader
        as="h1"
        badge={tx.badge}
        title={tx.workflowsForIndustrial}
        description={tx.exploreMatchingMeasurement}
      />

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={tx.badge}>
        {([
          ['all', tx.filterAll],
          ['task', tx.filterTask],
          ['industry', tx.filterIndustry],
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

      <div className="space-y-8">
        {visibleSolutions.map((sol, index) => (
          <section id={sol.id} key={sol.id} className="surface-card scroll-mt-24 grid items-start gap-8 p-6 sm:p-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {sol.industry}</p>
              <h2 className="section-title">{sol.title}</h2>
              <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{sol.fullDescription}</p>

              {sol.pipeline && sol.pipeline.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{tx.pipelineLabel}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {sol.pipeline.map((step, stepIdx) => (
                      <React.Fragment key={step}>
                        <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{step}</span>
                        {stepIdx < sol.pipeline!.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{tx.recommendedStack}</p>
                <div className="flex flex-wrap gap-2">
                  {sol.recommendedStack.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onNavigate(`/products/${item.toLowerCase()}`)}
                      className="tag cursor-pointer transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:hover:border-zinc-500 dark:hover:text-white"
                    >
                      <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/90 p-6 dark:border-zinc-800 dark:bg-zinc-950/70 lg:col-span-5">
              <p className="border-b border-zinc-200 pb-3 text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-300">{tx.engineeringConsiderations}</p>
              <ul className="space-y-3">
                {sol.keyBenefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <SiteLink href={`/contact?topic=${sol.id}`} className="btn-secondary w-full">
                {tx.inquireAbout}<ArrowRight className="h-4 w-4" />
              </SiteLink>
            </div>
          </section>
        ))}
      </div>

      <section className="surface-card mt-12 flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{tx.ctaHeading}</h2>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{tx.ctaDesc}</p>
        </div>
        <SiteLink href="/contact" className="btn-primary shrink-0">
          {tx.ctaButton}<ArrowRight className="h-4 w-4" />
        </SiteLink>
      </section>
    </div>
  );
};
