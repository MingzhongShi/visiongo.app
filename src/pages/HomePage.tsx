import { SiteLink } from '../components/SiteLink';
import { ArrowRight, Cpu, Workflow, ScanLine, Ruler, Shapes } from 'lucide-react';
import { getProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useLanguage } from '../i18n/LanguageContext';
import { homePageText } from '../i18n/text/HomePage';

export function HomePage({ onNavigate, onOpenContact }: { onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const products = getProducts(locale);
  return <div className="text-zinc-100">
    <SeoHead title={homePageText(zh).industrialVisionIntelligence} description={homePageText(zh).buildAndDebug} canonicalPath="/" />
    <section className="site-container pb-16 pt-32 lg:pb-24 lg:pt-40">
      <div className="max-w-3xl space-y-6">
        <p className="eyebrow">VISIONGO / {homePageText(zh).industrialVisionSoftware}</p>
        <h1 className="page-title">{homePageText(zh).buildDebugAnd}<span className="mt-2 block text-emerald-400">{homePageText(zh).industrialVisionWorkflows}</span></h1>
        <p className="lead max-w-2xl">{homePageText(zh).designInspectionWorkflows}</p>
        <div className="flex flex-col gap-3 sm:flex-row"><SiteLink href="/downloads/visionstudio" className="btn-primary">{homePageText(zh).downloadVisionstudio}<ArrowRight className="h-4 w-4" /></SiteLink><button onClick={onOpenContact} className="btn-secondary">{homePageText(zh).requestADemo}</button></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400"><SiteLink href="/developers#quickstart" className="hover:text-white">{homePageText(zh).quickstart}</SiteLink><SiteLink href="/downloads#requirements" className="hover:text-white">{homePageText(zh).systemAndInstallation}</SiteLink><SiteLink href="#architecture" className="hover:text-white">{homePageText(zh).deploymentArchitecture}</SiteLink></div>
      </div>
      <figure className="surface-card mt-12 overflow-hidden shadow-2xl shadow-black/30 lg:mt-16"><a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="block overflow-x-auto" aria-label={homePageText(zh).openFullSize}><img src="/screenshots/visionstudio-workflow.webp" alt={homePageText(zh).visionstudioWorkflowEditor} width={1680} height={980} fetchPriority="high" decoding="async" className="h-auto w-full min-w-[720px] md:min-w-0" /></a><figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 px-4 py-3 text-xs leading-relaxed text-zinc-400"><span>{homePageText(zh).visionstudioWorkflowEditorExample}</span><a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="text-link text-xs">{homePageText(zh).openFullSize}</a></figcaption></figure>
    </section>
    <section id="products" className="section section-band"><div className="site-container">
      <div className="mb-8 max-w-2xl"><h2 className="section-title">{homePageText(zh).fromEngineeringTo}</h2><p className="mt-3 leading-relaxed text-zinc-400">{homePageText(zh).theWorkspaceHandles}</p></div>
      <div className="grid gap-6 md:grid-cols-2">{products.slice(0, 2).map(product => <ProductCard key={product.id} product={product} onSelect={slug => onNavigate(`/products/${slug}`)} />)}</div>
      <div className="mt-6 flex flex-wrap gap-5 text-sm text-zinc-400"><span>{homePageText(zh).extensions}</span>{products.slice(2).map(product => <SiteLink key={product.id} href={`/products/${product.slug}`} className="hover:text-white">{product.name} <span className="text-zinc-500">— {product.positioning}</span></SiteLink>)}</div>
    </div></section>
    <section className="site-container section"><h2 className="section-title mb-8">{homePageText(zh).organizeWorkflowsAround}</h2><div className="grid gap-6 md:grid-cols-3">{[
      { icon: Shapes, title: homePageText(zh).shapeMatching, text: homePageText(zh).createATemplate },
      { icon: Ruler, title: homePageText(zh).measurement, text: homePageText(zh).combineImageProcessing },
      { icon: ScanLine, title: homePageText(zh).regionAnalysis, text: homePageText(zh).buildInspectionWorkflows },
    ].map(item => <div key={item.title} className="surface-card p-6"><span className="icon-tile mb-5"><item.icon className="h-5 w-5" /></span><h3 className="text-lg font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.text}</p></div>)}</div></section>
    <section id="architecture" className="section section-band"><div className="site-container"><h2 className="section-title">{homePageText(zh).clearDeploymentAnd}</h2><div className="mt-8 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]"><div className="surface-card p-6"><Workflow className="mb-3 h-6 w-6 text-emerald-400" /><h3 className="text-xl font-semibold">VisionStudio</h3><p className="mt-2 text-sm text-zinc-400">{homePageText(zh).designDebugConfirm}</p></div><div className="text-center text-sm text-zinc-400">SDK / IPC</div><div className="surface-card p-6"><Cpu className="mb-3 h-6 w-6 text-cyan-400" /><h3 className="text-xl font-semibold">VisionRuntime</h3><p className="mt-2 text-sm text-zinc-400">{homePageText(zh).inspectionExecutionDevice}</p></div></div><p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">{homePageText(zh).productionControlRetains}</p><SiteLink href="/developers#docs" className="text-link mt-6">{homePageText(zh).exploreEngineeringAnd}<ArrowRight className="h-4 w-4" /></SiteLink></div></section>
    <section className="site-container section space-y-5 text-center"><h2 className="section-title">{homePageText(zh).startYourFirst}</h2><p className="text-zinc-400">{homePageText(zh).chooseARelease}</p><div className="flex flex-wrap justify-center gap-3"><SiteLink href="/downloads" className="btn-primary">{homePageText(zh).getTheSoftware}</SiteLink><SiteLink href="/developers#quickstart" className="btn-secondary">{homePageText(zh).readTheQuickstart}</SiteLink></div></section>
  </div>;
}
