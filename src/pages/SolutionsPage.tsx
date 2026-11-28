import React from 'react';
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { getSolutions } from '../data/solutions';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { solutionsPageText } from '../i18n/text/SolutionsPage';

interface SolutionsPageProps {
  onNavigate: (path: string) => void;
  onOpenContact: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onNavigate, onOpenContact }) => {
  const { locale } = useLanguage();
  const solutions = getSolutions(locale);

  return (
    <div className="page-shell">
      <SeoHead title={solutionsPageText(locale).solutions} description={solutionsPageText(locale).exploreIndustrialVision} canonicalPath="/solutions" />
      <SectionHeader as="h1" badge={solutionsPageText(locale).badge} title={solutionsPageText(locale).workflowsForIndustrial}
                     description={solutionsPageText(locale).exploreMatchingMeasurement} />
      <div className="space-y-8">
        {solutions.map((sol, index) => (
          <section key={sol.id} className="surface-card grid items-start gap-8 p-6 sm:p-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {sol.industry}</p>
              <h2 className="section-title">{sol.title}</h2>
              <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{sol.fullDescription}</p>
              <div className="pt-2">
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{solutionsPageText(locale).recommendedStack}</p>
                <div className="flex flex-wrap gap-2">
                  {sol.recommendedStack.map(item => (
                    <button key={item} type="button" onClick={() => onNavigate(`/products/${item.toLowerCase()}`)} className="tag cursor-pointer transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:hover:border-zinc-500 dark:hover:text-white">
                      <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/90 p-6 dark:border-zinc-800 dark:bg-zinc-950/70 lg:col-span-5">
              <p className="border-b border-zinc-200 pb-3 text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-300">{solutionsPageText(locale).engineeringConsiderations}</p>
              <ul className="space-y-3">
                {sol.keyBenefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onOpenContact} className="btn-secondary w-full">
                {solutionsPageText(locale).inquireAbout}<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
