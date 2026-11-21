import { ArrowRight, CheckCircle2, Coins, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { SeoHead } from '../components/SeoHead';
import { SiteLink } from '../components/SiteLink';
import { useLanguage } from '../i18n/LanguageContext';
import { pricingPageText } from '../i18n/text/PricingPage';

export function PricingPage({ onOpenContact }: { onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const tx = pricingPageText(locale);

  return (
    <div className="page-shell">
      <SeoHead title={tx.seoTitle} description={tx.seoDescription} canonicalPath="/pricing" />
      <SectionHeader as="h1" badge={tx.badge} title={tx.title} description={tx.description} />

      <div className="grid gap-6 lg:grid-cols-3">
        {tx.tiers.map(tier => (
          <section
            key={tier.name}
            className={`surface-card relative flex flex-col justify-between p-7 sm:p-8 ${
              tier.highlighted ? 'border-emerald-500/50 bg-zinc-900/80 shadow-xl shadow-emerald-950/20' : ''
            }`}
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-white">{tier.name}</h2>
                {tier.badge && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {tier.badge}
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-emerald-400">{tier.priceLabel}</p>
              <p className="mt-2 text-xs text-zinc-400">{tier.audience}</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">{tier.summary}</p>
              <ul className="mt-6 space-y-3 border-t border-zinc-800 pt-6">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-2">
              {tier.action === 'download' ? (
                <SiteLink href="/downloads" className="btn-secondary w-full">
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </SiteLink>
              ) : (
                <button
                  type="button"
                  onClick={onOpenContact}
                  className={`${tier.highlighted ? 'btn-primary' : 'btn-secondary'} w-full`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="surface-card mt-12 grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-300">
            <Coins className="h-4 w-4" />
            <span>VisionCloud</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">{tx.cloudTitle}</h2>
          <p className="text-sm font-medium text-zinc-300">{tx.cloudSubtitle}</p>
          <p className="text-sm leading-relaxed text-zinc-400">{tx.cloudDescription}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <SiteLink href="/my" className="btn-secondary justify-center">
            {tx.cloudCta}
          </SiteLink>
          <button type="button" onClick={onOpenContact} className="btn-primary justify-center">
            {tx.cloudCtaContact}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-4xl">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>{tx.faqTitle}</span>
        </h2>
        <div className="grid gap-4">
          {tx.faqs.map(item => (
            <div key={item.q} className="surface-card p-6">
              <h3 className="text-base font-semibold text-white">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
