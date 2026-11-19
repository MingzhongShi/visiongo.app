import React from 'react';
import { ArrowLeft, ArrowRight, Shield, Cpu, Sliders, Sparkles, Terminal, FileCode2, Package, Layers } from 'lucide-react';
import { getProduct, getProducts } from '../data/products';
import { SeoHead } from '../components/SeoHead';
import { SiteLink } from '../components/SiteLink';
import { useLanguage } from '../i18n/LanguageContext';
import { productPageText } from '../i18n/text/ProductPage';

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
        <SiteLink href="/" className="hover:text-zinc-300">{tx.home}</SiteLink>
        <span aria-hidden="true">/</span>
        <SiteLink href="/#products" className="hover:text-zinc-300">{tx.products}</SiteLink>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-300">{product.name}</span>
      </nav>

      <section className="surface-card tech-grid relative mb-12 grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: product.accentColor }} />
        <div className="space-y-5">
          <span className="tag" style={{ color: product.accentColor, borderColor: `${product.accentColor}40` }}>{product.shortAction} {tx.phaseSuffix}</span>
          <h1 className="page-title">{product.name}</h1>
          <p className="text-xl font-medium text-zinc-300 sm:text-2xl">{product.tagline}</p>
          <p className="lead">{product.description}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={onOpenContact} className="btn-primary">{tx.requestTrial(product.name)}<ArrowRight className="h-4 w-4" /></button>
            <SiteLink href="/developers#docs" className="btn-secondary">{tx.readDeveloperDocs}</SiteLink>
          </div>
        </div>
        <dl className="space-y-5 self-center rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-zinc-500">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {product.slug === 'visionstudio' && (
        <figure className="surface-card mb-16 overflow-hidden">
          <a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="block overflow-x-auto">
            <img src="/screenshots/visionstudio-workflow.webp" alt={tx.screenshotAlt} width={1680} height={980} loading="lazy" decoding="async" className="h-auto w-full min-w-[720px] md:min-w-0" />
          </a>
          <figcaption className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-400">{tx.screenshotCaption}</figcaption>
        </figure>
      )}

      <section className="mb-16">
        <h2 className="section-title mb-8">{tx.keyCapabilitiesEngineering}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {product.keyCapabilities.map(cap => (
            <div key={cap.title} className="surface-card p-7">
              <div className="icon-tile mb-4" style={{ color: product.accentColor, borderColor: `${product.accentColor}30`, backgroundColor: `${product.accentColor}15` }}>{getIcon(cap.icon)}</div>
              <h3 className="text-lg font-semibold text-white">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {product.sampleCodeOrConfig && (
        <section className="mb-16">
          <h2 className="section-title mb-4 flex items-center gap-2"><FileCode2 className="h-5 w-5 text-emerald-400" />{tx.specificationConfigurationBlueprint}</h2>
          <p className="mb-6 text-sm text-zinc-400">{tx.sampleDeclarativeManifest}</p>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-400">
              <span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-emerald-400" />{product.sampleCodeOrConfig.filename}</span>
              <span className="text-[10px] uppercase text-zinc-500">{product.sampleCodeOrConfig.language}</span>
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-zinc-300"><code>{product.sampleCodeOrConfig.code}</code></pre>
          </div>
        </section>
      )}

      <nav aria-label={tx.products} className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-10">
        <SiteLink href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />{tx.backToPlatform}</SiteLink>
        <div className="flex flex-wrap items-center gap-2">
          {allProducts.map(p => (
            <SiteLink key={p.id} href={`/products/${p.slug}`} aria-current={p.slug === product.slug ? 'page' : undefined}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${p.slug === product.slug ? 'bg-zinc-800 font-medium text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}>
              {p.name}
            </SiteLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
