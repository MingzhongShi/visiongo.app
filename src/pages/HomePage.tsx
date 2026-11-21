import { SiteLink } from '../components/SiteLink';
import { ArrowRight, Cpu, Workflow, ScanLine, Ruler, Shapes, ShieldCheck, Layers, Gauge } from 'lucide-react';
import { getProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { homePageText } from '../i18n/text/HomePage';

export function HomePage({ onNavigate, onOpenContact }: { onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const tx = homePageText(zh);
  const products = getProducts(locale);

  const pillars = [
    { icon: Layers, title: tx.why1Title, desc: tx.why1Desc },
    { icon: Gauge, title: tx.why2Title, desc: tx.why2Desc },
    { icon: ShieldCheck, title: tx.why3Title, desc: tx.why3Desc },
  ];

  return (
    <div className="text-zinc-100">
      <SeoHead title={tx.industrialVisionIntelligence} description={tx.buildAndDebug} canonicalPath="/" />
      <section className="site-container pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow">{tx.industrialVisionSoftware}</p>
          <h1 className="page-title">
            {tx.buildDebugAnd}
            <span className="mt-2 block text-emerald-400">{tx.industrialVisionWorkflows}</span>
          </h1>
          <p className="lead max-w-2xl">{tx.designInspectionWorkflows}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onOpenContact} className="btn-primary">
              {tx.requestADemo}
              <ArrowRight className="h-4 w-4" />
            </button>
            <SiteLink href="/downloads/visionstudio" className="btn-secondary">
              {tx.downloadVisionstudio}
            </SiteLink>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
            <SiteLink href="/pricing" className="hover:text-white">{tx.viewLicensing}</SiteLink>
            <SiteLink href="/solutions" className="hover:text-white">{tx.industrySolutions}</SiteLink>
            <SiteLink href="/developers#quickstart" className="hover:text-white">{tx.quickstart}</SiteLink>
          </div>
        </div>
        <figure className="surface-card mt-12 overflow-hidden shadow-2xl shadow-black/30 lg:mt-16">
          <a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="block overflow-x-auto" aria-label={tx.openFullSize}>
            <img
              src="/screenshots/visionstudio-workflow.webp"
              alt={tx.visionstudioWorkflowEditor}
              width={1680}
              height={980}
              fetchPriority="high"
              decoding="async"
              className="h-auto w-full min-w-[720px] md:min-w-0"
            />
          </a>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 px-4 py-3 text-xs leading-relaxed text-zinc-400">
            <span>{tx.visionstudioWorkflowEditorExample}</span>
            <a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="text-link text-xs">
              {tx.openFullSize}
            </a>
          </figcaption>
        </figure>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <div className="mb-10 max-w-2xl">
            <h2 className="section-title">{tx.whyTitle}</h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{tx.whySubtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(item => (
              <div key={item.title} className="surface-card p-6">
                <span className="icon-tile mb-5">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="site-container section">
        <div className="mb-8 max-w-2xl">
          <h2 className="section-title">{tx.fromEngineeringTo}</h2>
          <p className="mt-3 leading-relaxed text-zinc-400">{tx.theWorkspaceHandles}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {products.slice(0, 2).map(product => (
            <ProductCard key={product.id} product={product} onSelect={slug => onNavigate(`/products/${slug}`)} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-5 text-sm text-zinc-400">
          <span>{tx.extensions}</span>
          {products.slice(2).map(product => (
            <SiteLink key={product.id} href={`/products/${product.slug}`} className="hover:text-white">
              {product.name} <span className="text-zinc-500">— {product.positioning}</span>
            </SiteLink>
          ))}
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <h2 className="section-title mb-8">{tx.organizeWorkflowsAround}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Shapes, title: tx.shapeMatching, text: tx.createATemplate },
              { icon: Ruler, title: tx.measurement, text: tx.combineImageProcessing },
              { icon: ScanLine, title: tx.regionAnalysis, text: tx.buildInspectionWorkflows },
            ].map(item => (
              <div key={item.title} className="surface-card p-6">
                <span className="icon-tile mb-5">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="site-container section">
        <h2 className="section-title">{tx.clearDeploymentAnd}</h2>
        <div className="mt-8 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="surface-card p-6">
            <Workflow className="mb-3 h-6 w-6 text-emerald-400" />
            <h3 className="text-xl font-semibold">VisionStudio</h3>
            <p className="mt-2 text-sm text-zinc-400">{tx.designDebugConfirm}</p>
          </div>
          <div className="text-center text-xs font-medium uppercase tracking-wider text-zinc-500">SDK / IPC</div>
          <div className="surface-card p-6">
            <Cpu className="mb-3 h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-semibold">VisionRuntime</h3>
            <p className="mt-2 text-sm text-zinc-400">{tx.inspectionExecutionDevice}</p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">{tx.productionControlRetains}</p>
        <div className="mt-6 flex flex-wrap gap-6">
          <SiteLink href="/pricing" className="text-link">
            {tx.exploreLicensing}
            <ArrowRight className="h-4 w-4" />
          </SiteLink>
          <SiteLink href="/developers#docs" className="text-link">
            {tx.exploreEngineeringAnd}
            <ArrowRight className="h-4 w-4" />
          </SiteLink>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container space-y-5 text-center">
          <h2 className="section-title">{tx.startYourFirst}</h2>
          <p className="mx-auto max-w-2xl text-zinc-400">{tx.chooseARelease}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onOpenContact} className="btn-primary">
              {tx.requestADemo}
              <ArrowRight className="h-4 w-4" />
            </button>
            <SiteLink href="/downloads" className="btn-secondary">
              {tx.getTheSoftware}
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}
