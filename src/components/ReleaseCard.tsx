import { SiteLink } from './SiteLink';
import { useEffect, useState } from 'react';
import { Check, Copy, Download, FileText } from 'lucide-react';
import type { ProductRelease, ReleaseAsset } from '../types/downloads';
import { useLanguage } from '../i18n/LanguageContext';
import { releaseCardText } from '../i18n/text/ReleaseCard';

interface ReleaseCardProps {
  productId: 'visionstudio' | 'visionruntime' | 'visionedge';
  productName: string;
  tagline: string;
  accentColor: string;
  releases: ProductRelease[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onOpenReleaseNotes: (release: ProductRelease) => void;
}

function detectClientPlatform(): { platform: ReleaseAsset['platform'] | null; arch: ReleaseAsset['arch'] | null } {
  if (typeof navigator === 'undefined') return { platform: null, arch: null };
  const ua = navigator.userAgent.toLowerCase();
  const navPlatform = ((navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '').toLowerCase();
  const platform: ReleaseAsset['platform'] | null =
    /win/.test(navPlatform) || /windows/.test(ua) ? 'windows'
      : /mac/.test(navPlatform) || /mac os x/.test(ua) ? 'macos'
        : /linux/.test(navPlatform) || /linux/.test(ua) ? 'linux' : null;
  const arch: ReleaseAsset['arch'] | null =
    /arm64|aarch64/.test(ua) ? 'arm64'
      : /x86_64|x64|win64|wow64|amd64/.test(ua) ? 'x64' : null;
  return { platform, arch };
}

function pickRecommendedAsset(assets: ReleaseAsset[]): ReleaseAsset | undefined {
  const { platform, arch } = detectClientPlatform();
  if (!platform) return undefined;
  if (arch) {
    const exact = assets.find(item => item.platform === platform && (item.arch === arch || item.arch === 'universal'));
    if (exact) return exact;
  }
  const samePlatform = assets.filter(item => item.platform === platform);
  return samePlatform.length === 1 && !arch ? samePlatform[0] : undefined;
}

export function ReleaseCard({ productName, tagline, releases, loading, error, onRetry, onOpenReleaseNotes }: ReleaseCardProps) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const [version, setVersion] = useState('');
  const [assetId, setAssetId] = useState('');
  const [autoMatched, setAutoMatched] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);
  const release = releases.find(item => item.version === version) || releases[0];
  const asset = release?.assets.find(item => item.id === assetId);
  useEffect(() => { setVersion(''); setAssetId(''); setAutoMatched(false); setCopiedDigest(false); }, [releases]);
  useEffect(() => {
    if (!release || assetId) return;
    const recommended = pickRecommendedAsset(release.assets);
    if (recommended) {
      setAssetId(recommended.id);
      setAutoMatched(true);
    }
  }, [release, assetId]);
  const copyDigest = async (digest: string) => {
    try {
      await navigator.clipboard.writeText(digest.replace(/^sha256:/, ''));
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    } catch { setCopiedDigest(false); }
  };
  return <article className="surface-card flex flex-col gap-5 p-6">
    <header><h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{productName}</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tagline}</p></header>
    {loading ? <p role="status" className="py-8 text-sm text-zinc-500 dark:text-zinc-400">{releaseCardText(zh).loadingReleases}</p> : error ? <div role="alert" className="space-y-4 py-4"><p className="text-sm text-amber-700 dark:text-amber-300">{releaseCardText(zh).releaseServiceIs}</p><button className="btn-secondary" onClick={onRetry}>{releaseCardText(zh).retry}</button></div> : !release ? <div className="space-y-4 py-4"><p className="text-sm text-zinc-600 dark:text-zinc-400">{releaseCardText(zh).noReleasesAre}</p><SiteLink href="/contact" className="text-link text-sm">{releaseCardText(zh).askAboutProducts}</SiteLink></div> : <>
      <label className="form-label">{releaseCardText(zh).version}<select className="form-input" value={release.version} onChange={event => { setVersion(event.target.value); setAssetId(''); setAutoMatched(false); setCopiedDigest(false); }}>{releases.map(item => <option key={item.version} value={item.version}>{item.version}{item.prerelease ? (releaseCardText(zh).preview) : ''}</option>)}</select></label>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{releaseCardText(zh).published}{release.publishedAt ? new Date(release.publishedAt).toLocaleDateString(zh ? 'zh-CN' : 'en-US') : (releaseCardText(zh).notProvided)}</p>
      {release.assets.length ? <label className="form-label">{releaseCardText(zh).systemArchitectureAnd}<select className="form-input" value={assetId} onChange={event => { setAssetId(event.target.value); setAutoMatched(false); setCopiedDigest(false); }}><option value="">{releaseCardText(zh).chooseAPackage}</option>{release.assets.map(item => <option value={item.id} key={item.id}>{item.platform} / {item.arch} — {item.name}</option>)}</select></label> : <p className="text-sm text-zinc-600 dark:text-zinc-400">{releaseCardText(zh).thisReleaseHas}</p>}
      {asset && <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="break-all font-medium text-zinc-900 dark:text-zinc-200">{asset.name}</p>
          {autoMatched && <span className="rounded border border-emerald-600/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300">{releaseCardText(zh).matchedDevice}</span>}
        </div>
        <p>{asset.platform} / {asset.arch} · {(asset.size / 1048576).toFixed(1)} MB</p>
        {asset.digest && <div className="flex items-start justify-between gap-2 pt-1">
          <p className="break-all font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{asset.digest}</p>
          <button type="button" onClick={() => void copyDigest(asset.digest!)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-200/70 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer">
            {copiedDigest ? <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedDigest ? releaseCardText(zh).copiedSha256 : releaseCardText(zh).copySha256}</span>
          </button>
        </div>}
      </div>}
      <div className="mt-auto space-y-3 pt-2">{asset ? <SiteLink className="btn-primary w-full" href={asset.downloadUrl} download><Download className="h-4 w-4" />{releaseCardText(zh).downloadSelectedPackage}</SiteLink> : <button className="btn-primary w-full" disabled>{releaseCardText(zh).selectAPackage}</button>}<button className="btn-secondary w-full" onClick={() => onOpenReleaseNotes(release)}><FileText className="h-4 w-4" />{releaseCardText(zh).releaseNotes}</button><SiteLink href="/developers#quickstart" className="block text-center text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">{releaseCardText(zh).quickstartAndInstallation}</SiteLink></div>
    </>}
  </article>;
}
