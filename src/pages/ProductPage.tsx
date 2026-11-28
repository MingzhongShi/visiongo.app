import React from 'react';
import { ArrowLeft, ArrowRight, Shield, Cpu, Sliders, Sparkles, Terminal, FileCode2, Package, Layers } from 'lucide-react';
import { getProduct, getProducts } from '../data/products';
import { SeoHead } from '../components/SeoHead';
import { SiteLink } from '../components/SiteLink';
import { useLanguage } from '../i18n/LanguageContext';
import { productPageText } from '../i18n/text/ProductPage';
import { StudioShowcase } from '../components/StudioShowcase';
import { SafetyControlDiagram } from '../components/SafetyControlDiagram';

interface ProductPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenContact: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onOpenContact }) => {
  const { locale } = useLanguage();
  const product = getProduct(slug, locale);
  const allProducts = getProducts(locale);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Workflow':
      case 'Sliders':
        return <Sliders className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Shield':
      case 'ShieldCheck':
        return <Shield className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Package':
        return <Package className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const ACCENT: Record<string, { tag: string; tile: string }> = {
    visionstudio: { tag: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400', tile: 'border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400' },
    visionruntime: { tag: 'border-cyan-600/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/40 dark:text-cyan-400', tile: 'border-cyan-600/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-400' },
    visionedge: { tag: 'border-violet-600/30 bg-violet-500/10 text-violet-700 dark:border-violet-500/40 dark:text-violet-400', tile: 'border-violet-600/20 bg-violet-500/10 text-violet-700 dark:border-violet-500/30 dark:text-violet-400' },
    visioncloud: { tag: 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/40 dark:text-amber-400', tile: 'border-amber-600/20 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-400' },
  };
  const accent = ACCENT[product.id] || ACCENT.visionstudio;
  const tx = productPageText(locale);
  const specs = [
    [tx.architectureRole, product.architectureRole],
    [tx.deploymentTarget, product.deploymentTarget],
    [tx.networkConnectivity, product.connectivityRequirement],
  ];
  return (
    <div className="page-shell">
      <SeoHead
        title={`${product.name} — ${product.positioning}`}
        description={`${product.name}: ${product.tagline} ${product.summary}`}
        canonicalPath={`/products/${product.slug}`}
      />

      <nav aria-label={tx.breadcrumb} className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
        <SiteLink href="/" className="hover:text-zinc-900 dark:hover:text-zinc-300">{tx.home}</SiteLink>
        <span aria-hidden="true">/</span>
        <SiteLink href="/#products" className="hover:text-zinc-900 dark:hover:text-zinc-300">{tx.products}</SiteLink>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-800 dark:text-zinc-300">{product.name}</span>
      </nav>

      <section className="surface-card tech-grid relative mb-12 grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: product.accentColor }} />
        <div className="space-y-5">
          <span className={`tag ${accent.tag}`}>{product.shortAction} {tx.phaseSuffix}</span>
          <h1 className="page-title">{product.name}</h1>
          <p className="text-xl font-medium text-zinc-700 dark:text-zinc-300 sm:text-2xl">{product.tagline}</p>
          <p className="lead">{product.description}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={onOpenContact} className="btn-primary">{tx.requestTrial(product.name)}<ArrowRight className="h-4 w-4" /></button>
            <SiteLink href="/developers#docs" className="btn-secondary">{tx.readDeveloperDocs}</SiteLink>
          </div>
        </div>
        <dl className="space-y-5 self-center rounded-2xl border border-zinc-200 bg-zinc-50/90 p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-zinc-500">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {product.slug === 'visionstudio' && (
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="section-title">{tx.studioInteractiveHeading}</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{tx.studioInteractiveSubtitle}</p>
          </div>
          <StudioShowcase initialTab="workflow" />
        </section>
      )}

      {product.slug === 'visionruntime' && (
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="section-title">{tx.runtimeConnectivityHeading}</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{tx.runtimeConnectivitySubtitle}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: tx.runtimeCameraGroup, items: ['GenICam', 'GigE Vision', 'USB3 Vision'] },
              { title: tx.runtimePlcGroup, items: ['Siemens S7', 'Mitsubishi SLMP', 'Omron FINS', 'Modbus TCP / RTU', 'EtherNet/IP'] },
              { title: tx.runtimeServiceGroup, items: ['OPC UA', 'MQTT', 'HTTP', 'JSON SDK IPC'] },
            ].map(group => (
              <div key={group.title} className="surface-card p-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{group.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <span key={item} className="tag font-mono text-xs">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(product.slug === 'visionedge' || product.slug === 'visioncloud') && (
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="section-title">{tx.safetyBoundaryHeading}</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{tx.safetyBoundarySubtitle}</p>
          </div>
          <SafetyControlDiagram initialMode={product.slug === 'visionedge' ? 'relay' : 'boundary'} />
        </section>
      )}

      <section className="mb-16">
        <h2 className="section-title mb-8">{tx.keyCapabilitiesEngineering}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {product.keyCapabilities.map(cap => (
            <div key={cap.title} className="surface-card p-7">
              <div className={`icon-tile mb-4 ${accent.tile}`}>{getIcon(cap.icon)}</div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {product.sampleCodeOrConfig && (
        <section className="mb-16">
          <h2 className="section-title mb-4 flex items-center gap-2"><FileCode2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />{tx.specificationConfigurationBlueprint}</h2>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">{tx.sampleDeclarativeManifest}</p>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-400">
              <span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-emerald-400" />{product.sampleCodeOrConfig.filename}</span>
              <span className="text-[10px] uppercase text-zinc-500">{product.sampleCodeOrConfig.language}</span>
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-zinc-300"><code>{product.sampleCodeOrConfig.code}</code></pre>
          </div>
        </section>
      )}

      <nav aria-label={tx.products} className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <SiteLink href="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"><ArrowLeft className="h-4 w-4" />{tx.backToPlatform}</SiteLink>
        <div className="flex flex-wrap items-center gap-2">
          {allProducts.map(p => (
            <SiteLink key={p.id} href={`/products/${p.slug}`} aria-current={p.slug === product.slug ? 'page' : undefined}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${p.slug === product.slug ? 'bg-zinc-200 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'}`}>
              {p.name}
            </SiteLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
