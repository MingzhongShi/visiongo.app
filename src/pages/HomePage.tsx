import { SiteLink } from '../components/SiteLink';
import { ArrowRight, Check, Cpu, Factory, Lock, Network, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { getProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { StudioShowcase } from '../components/StudioShowcase';
import { SafetyControlDiagram } from '../components/SafetyControlDiagram';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { homePageText } from '../i18n/text/HomePage';

export function HomePage({ onNavigate, onOpenContact }: { onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const tx = homePageText(zh);
  const products = getProducts(locale);

  return (
    <div className="text-zinc-900 dark:text-zinc-100">
      <SeoHead title={tx.industrialVisionIntelligence} description={tx.buildAndDebug} canonicalPath="/" />

      {/* 1. Hero + Interactive Studio Showcase */}
      <section className="site-container pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow">VISIONGO / {tx.industrialVisionSoftware}</p>
          <h1 className="page-title">
            {tx.buildDebugAnd}
            <span className="mt-2 block text-emerald-600 dark:text-emerald-400">{tx.industrialVisionWorkflows}</span>
          </h1>
          <p className="lead max-w-2xl">{tx.designInspectionWorkflows}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SiteLink href="/downloads/visionstudio" className="btn-primary">
              {tx.downloadVisionstudio}
              <ArrowRight className="h-4 w-4" />
            </SiteLink>
            <button onClick={onOpenContact} className="btn-secondary">
              {tx.requestADemo}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <SiteLink href="/developers#quickstart" className="hover:text-zinc-950 dark:hover:text-white">{tx.quickstart}</SiteLink>
            <SiteLink href="/downloads#requirements" className="hover:text-zinc-950 dark:hover:text-white">{tx.systemAndInstallation}</SiteLink>
            <SiteLink href="#architecture" className="hover:text-zinc-950 dark:hover:text-white">{tx.deploymentArchitecture}</SiteLink>
          </div>
        </div>

        <div className="mt-10 lg:mt-14">
          <StudioShowcase />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {tx.trustStrip.map(item => (
            <span key={item} className="tag font-mono text-xs">{item}</span>
          ))}
        </div>
      </section>

      {/* 2. Core Platform Architecture */}
      <section id="products" className="section section-band">
        <div className="site-container">
          <div className="mb-8 max-w-2xl">
            <h2 className="section-title">{tx.fromEngineeringTo}</h2>
            <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.theWorkspaceHandles}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {products.slice(0, 2).map(product => (
              <ProductCard key={product.id} product={product} onSelect={slug => onNavigate(`/products/${slug}`)} />
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.slice(2).map(product => (
              <SiteLink key={product.id} href={`/products/${product.slug}`} className="card-link flex items-start justify-between gap-4 p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-950 dark:text-white">{product.name}</span>
                    <span className="tag text-[11px]">{product.positioning}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{product.summary}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Deterministic Rule Vision x Human-in-the-loop AI */}
      <section className="site-container section">
        <div className="mb-10 max-w-3xl space-y-3">
          <p className="eyebrow">{tx.dualCapabilityEyebrow}</p>
          <h2 className="section-title">{tx.dualCapabilityTitle}</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">{tx.dualCapabilitySub}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-card p-6 sm:p-8 space-y-4">
            <div className="icon-tile"><Workflow className="h-5 w-5" /></div>
            <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">{tx.ruleTitle}</h3>
            <ul className="space-y-3">
              {tx.ruleItems.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6 sm:p-8 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-600/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/25 dark:text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">{tx.aiTitle}</h3>
            <ul className="space-y-3">
              {tx.aiItems.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Applications x Industries Matrix */}
      <section className="section section-band">
        <div className="site-container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="eyebrow">{tx.matrixEyebrow}</p>
              <h2 className="section-title">{tx.matrixTitle}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{tx.matrixSub}</p>
            </div>
            <SiteLink href="/solutions" className="text-link">
              {tx.viewSolutions}
              <ArrowRight className="h-4 w-4" />
            </SiteLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tx.tasks.map(task => (
              <div key={task.title} className="surface-card p-5 space-y-2">
                <h3 className="text-base font-semibold text-zinc-950 dark:text-white">{task.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{task.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tx.industries.map(ind => (
              <SiteLink key={ind.name} href={ind.href} className="card-link flex flex-col justify-between gap-3 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <Factory className="h-3.5 w-3.5" />
                    <span>{ind.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{ind.focus}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {tx.viewSolutions}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Industrial Connectivity & Device Ecosystem */}
      <section className="site-container section">
        <div className="mb-8 max-w-3xl space-y-2">
          <p className="eyebrow">{tx.connectivityEyebrow}</p>
          <h2 className="section-title">{tx.connectivityTitle}</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.connectivitySub}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tx.connectivityGroups.map(group => (
            <div key={group.group} className="surface-card space-y-4 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                <Network className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{group.group}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map(item => (
                  <span key={item} className="tag font-mono text-xs">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Deployment, Remote Assist & Security Boundaries */}
      <section id="architecture" className="section section-band">
        <div className="site-container space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title">{tx.clearDeploymentAnd}</h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.productionControlRetains}</p>
          </div>

          <SafetyControlDiagram />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">{tx.trustTitle}</h3>
            <SiteLink href="/about#security" className="text-link">
              {tx.learnSecurityBoundaries}
              <ArrowRight className="h-4 w-4" />
            </SiteLink>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Cpu, title: tx.trustOfflineTitle, text: tx.trustOfflineDesc },
              { icon: Lock, title: tx.trustAiDataTitle, text: tx.trustAiDataDesc },
              { icon: ShieldCheck, title: tx.trustControlTitle, text: tx.trustControlDesc },
            ].map(item => (
              <div key={item.title} className="surface-card p-6">
                <span className="icon-tile mb-5"><item.icon className="h-5 w-5" /></span>
                <h4 className="text-lg font-semibold text-zinc-950 dark:text-white">{item.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Dual-Path Evaluation CTA */}
      <section className="site-container section space-y-5 text-center">
        <h2 className="section-title">{tx.startYourFirst}</h2>
        <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{tx.chooseARelease}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <SiteLink href="/downloads" className="btn-primary">{tx.getTheSoftware}</SiteLink>
          <SiteLink href="/developers#quickstart" className="btn-secondary">{tx.readTheQuickstart}</SiteLink>
          <SiteLink href="/contact" className="btn-secondary">{tx.bookFeasibility}</SiteLink>
        </div>
      </section>
    </div>
  );
}
