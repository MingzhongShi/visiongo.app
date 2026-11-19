import { SiteLink } from '../components/SiteLink';
import { api } from '../lib/api';
import { useEffect, useState } from 'react';
import { ReleaseCard } from '../components/ReleaseCard';
import { ReleaseNotesModal } from '../components/ReleaseNotesModal';
import { SeoHead } from '../components/SeoHead';
import { SectionHeader } from '../components/SectionHeader';
import type { ProductRelease, DownloadableProduct } from '../types/downloads';
import { useLanguage } from '../i18n/LanguageContext';
import { downloadsPageText } from '../i18n/text/DownloadsPage';

const PRODUCTS = ['visionstudio', 'visionruntime', 'visionedge'] as const;
const emptyReleases = (): Record<DownloadableProduct, ProductRelease[]> => ({ visionstudio: [], visionruntime: [], visionedge: [] });
const names = { visionstudio: 'VisionStudio', visionruntime: 'VisionRuntime', visionedge: 'VisionEdge' };

export function DownloadsPage({ initialProduct, initialVersion }: { initialProduct?: DownloadableProduct; initialVersion?: string; onNavigate: (path: string) => void; onOpenContact: () => void }) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const [releases, setReleases] = useState(emptyReleases);
  const [errors, setErrors] = useState<Partial<Record<DownloadableProduct, string>>>({});
  const [loading, setLoading] = useState(true);
  const [includePrereleases, setIncludePrereleases] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<{ product: DownloadableProduct; release: ProductRelease } | null>(null);
  const [missingVersion, setMissingVersion] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErrors({});
    setSelected(null);
    setMissingVersion(false);
    void (async () => {
      try {
        const { ok, data } = await api(`/api/releases?includePrereleases=${includePrereleases}`, undefined, { signal: controller.signal });
        if (!ok) throw new Error('Release service unavailable');
        if (!data.releases || PRODUCTS.some(product => !Array.isArray(data.releases[product]))) throw new Error('Invalid releases response');
        if (controller.signal.aborted) return;
        setReleases(data.releases);
        setErrors(data.errors || {});
      } catch {
        if (controller.signal.aborted) return;
        setReleases(emptyReleases());
        setErrors(Object.fromEntries(PRODUCTS.map(product => [product, 'unavailable'])));
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [includePrereleases, attempt]);
  useEffect(() => {
    if (loading || !initialProduct || errors[initialProduct] || !initialVersion) return;
    const match = releases[initialProduct].find(item => item.version.toLowerCase() === initialVersion.toLowerCase());
    setMissingVersion(!match);
    if (match) setSelected({ product: initialProduct, release: match });
  }, [initialProduct, initialVersion, releases, loading, errors]);
  return <div className="page-shell">
    <SeoHead title={downloadsPageText(zh).downloadsSoftwareReleases} description={downloadsPageText(zh).choosePublishedVisiongo} canonicalPath="/downloads" />
    <SectionHeader as="h1" badge="VISIONGO" title={downloadsPageText(zh).downloadAndStart} description={downloadsPageText(zh).noSignIn} />
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><label className="flex min-h-11 items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={includePrereleases} onChange={event => setIncludePrereleases(event.target.checked)} />{downloadsPageText(zh).includePreviewReleases}</label><SiteLink href="/developers#quickstart" className="text-sm text-emerald-400">{downloadsPageText(zh).firstTimeRead}</SiteLink></div>
    {initialProduct && !initialVersion && <p role="status" className="mb-6 text-sm text-zinc-400">{downloadsPageText(zh).youAreLooking} {names[initialProduct]}。{downloadsPageText(zh).chooseItsPackage}</p>}
    {missingVersion && <p role="alert" className="mb-6 rounded-xl border border-amber-500/30 p-4 text-sm text-amber-300">{downloadsPageText(zh).theLinkedVersion}</p>}
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{PRODUCTS.map(product => <ReleaseCard key={product} productId={product} productName={names[product]} tagline={product === 'visionstudio' ? (downloadsPageText(zh).engineeringWorkspace) : product === 'visionruntime' ? (downloadsPageText(zh).localExecutionRuntime) : (downloadsPageText(zh).edgeGateway)} accentColor="#34d399" releases={releases[product]} loading={loading} error={errors[product]} onRetry={() => setAttempt(value => value + 1)} onOpenReleaseNotes={release => setSelected({ product, release })} />)}</div>
    <section id="requirements" className="surface-card mt-10 space-y-4 p-6 sm:p-8"><h2 className="text-xl font-semibold text-white">{downloadsPageText(zh).installationAndCompatibility}</h2><p className="text-sm leading-relaxed text-zinc-400">{downloadsPageText(zh).supportedOperatingSystems}</p><p className="text-sm text-zinc-400">{downloadsPageText(zh).connectivityRequirementsDepend}</p><div className="flex flex-wrap gap-5 text-sm"><SiteLink href="/developers#quickstart" className="text-emerald-400">{downloadsPageText(zh).installationAndFirst}</SiteLink><SiteLink href="/contact" className="text-emerald-400">{downloadsPageText(zh).askAboutVersion}</SiteLink></div></section>
    <ReleaseNotesModal isOpen={!!selected} onClose={() => setSelected(null)} productName={selected ? names[selected.product] : ''} release={selected?.release || null} allReleases={selected ? releases[selected.product] : []} onSelectRelease={release => setSelected(previous => previous ? { ...previous, release } : null)} />
  </div>;
}
