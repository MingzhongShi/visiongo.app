import { SiteLink } from './SiteLink';
import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { ProductRelease } from '../types/downloads';
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

export function ReleaseCard({ productName, tagline, releases, loading, error, onRetry, onOpenReleaseNotes }: ReleaseCardProps) {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const [version, setVersion] = useState('');
  const [assetId, setAssetId] = useState('');
  const release = releases.find(item => item.version === version) || releases[0];
  const asset = release?.assets.find(item => item.id === assetId);
  useEffect(() => { setVersion(''); setAssetId(''); }, [releases]);
  return <article className="surface-card flex flex-col gap-5 p-6">
    <header><h2 className="text-xl font-semibold text-white">{productName}</h2><p className="mt-1 text-sm text-zinc-400">{tagline}</p></header>
    {loading ? <p role="status" className="py-8 text-sm text-zinc-400">{releaseCardText(zh).loadingReleases}</p> : error ? <div role="alert" className="space-y-4 py-4"><p className="text-sm text-amber-300">{releaseCardText(zh).releaseServiceIs}</p><button className="btn-secondary" onClick={onRetry}>{releaseCardText(zh).retry}</button></div> : !release ? <div className="space-y-4 py-4"><p className="text-sm text-zinc-400">{releaseCardText(zh).noReleasesAre}</p><SiteLink href="/contact" className="text-sm text-emerald-400">{releaseCardText(zh).askAboutProducts}</SiteLink></div> : <>
      <label className="form-label">{releaseCardText(zh).version}<select className="form-input" value={release.version} onChange={event => { setVersion(event.target.value); setAssetId(''); }}>{releases.map(item => <option key={item.version} value={item.version}>{item.version}{item.prerelease ? (releaseCardText(zh).preview) : ''}</option>)}</select></label>
      <p className="text-xs text-zinc-400">{releaseCardText(zh).published}{release.publishedAt ? new Date(release.publishedAt).toLocaleDateString(zh ? 'zh-CN' : 'en-US') : (releaseCardText(zh).notProvided)}</p>
      {release.assets.length ? <label className="form-label">{releaseCardText(zh).systemArchitectureAnd}<select className="form-input" value={assetId} onChange={event => setAssetId(event.target.value)}><option value="">{releaseCardText(zh).chooseAPackage}</option>{release.assets.map(item => <option value={item.id} key={item.id}>{item.platform} / {item.arch} — {item.name}</option>)}</select></label> : <p className="text-sm text-zinc-400">{releaseCardText(zh).thisReleaseHas}</p>}
      {asset && <div className="space-y-2 rounded-xl bg-zinc-950 p-3 text-xs text-zinc-400"><p className="break-all text-zinc-200">{asset.name}</p><p>{asset.platform} / {asset.arch} · {(asset.size / 1048576).toFixed(1)} MB</p>{asset.digest && <p className="break-all font-mono">{asset.digest}</p>}</div>}
      <div className="mt-auto space-y-3 pt-2">{asset ? <SiteLink className="btn-primary w-full" href={asset.downloadUrl} download><Download className="h-4 w-4" />{releaseCardText(zh).downloadSelectedPackage}</SiteLink> : <button className="btn-primary w-full" disabled>{releaseCardText(zh).selectAPackage}</button>}<button className="btn-secondary w-full" onClick={() => onOpenReleaseNotes(release)}><FileText className="h-4 w-4" />{releaseCardText(zh).releaseNotes}</button><SiteLink href="/developers#quickstart" className="block text-center text-sm text-zinc-400 hover:text-white">{releaseCardText(zh).quickstartAndInstallation}</SiteLink></div>
    </>}
  </article>;
}
