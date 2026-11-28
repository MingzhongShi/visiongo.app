import { SiteLink } from './SiteLink';
import React, { useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';
import { X, Calendar, Download, ShieldCheck, Tag } from 'lucide-react';
import { ProductRelease } from '../types/downloads';
import { SafeMarkdown } from './SafeMarkdown';
import { useLanguage } from '../i18n/LanguageContext';
import { releaseNotesModalText } from '../i18n/text/ReleaseNotesModal';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  release: ProductRelease | null;
  allReleases?: ProductRelease[];
  onSelectRelease?: (release: ProductRelease) => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  productName,
  release,
  allReleases = [],
  onSelectRelease,
}) => {
  const { locale } = useLanguage();

  const dialog = useRef<HTMLDivElement>(null);
  useDialogFocus(isOpen && !!release, dialog, onClose);

  if (!isOpen || !release) return null;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '—';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-sm">
      <div
        ref={dialog}
        role="dialog" aria-modal="true" aria-labelledby="release-title" tabIndex={-1}
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-600/25 dark:text-emerald-400 dark:border-emerald-500/20">
                {release.version}
              </span>
              {release.prerelease && (
                <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-600/25 dark:text-amber-400 dark:border-amber-500/20">
                  Pre-release
                </span>
              )}
              <h3 id="release-title" className="text-lg font-bold text-zinc-950 dark:text-white font-sans">
                {productName} {releaseNotesModalText(locale).releaseNotes}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {formatDate(release.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400/90">
                <ShieldCheck className="w-3.5 h-3.5" />
                {releaseNotesModalText(locale).officialReleaseRepository}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Version Selector (if multiple exist) */}
        {allReleases.length > 1 && onSelectRelease && (
          <div className="px-6 py-2.5 bg-zinc-100/80 border-b border-zinc-200 dark:bg-zinc-950/90 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-zinc-500 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {releaseNotesModalText(locale).version}
            </span>
            {allReleases.map((r) => {
              const isSelected = r.version === release.version;
              return (
                <button
                  key={r.version}
                  onClick={() => onSelectRelease(r)}
                  className={`px-2.5 py-1 rounded transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-600/35 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                  }`}
                >
                  {r.version}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-700 dark:text-zinc-300">
          {/* Markdown Content */}
          <div className="max-w-none text-sm">
            <SafeMarkdown content={release.description || (releaseNotesModalText(locale).noReleaseNotes)} />
          </div>

          {/* Release Assets List */}
          {release.assets.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                {releaseNotesModalText(locale).releasePackagesBinaries}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {release.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-zinc-900 dark:text-zinc-200 truncate">{asset.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                        <span className="uppercase text-zinc-600 dark:text-zinc-400">{asset.platform}</span>
                        <span>•</span>
                        <span>{asset.arch}</span>
                        <span>•</span>
                        <span>{formatBytes(asset.size)}</span>
                      </div>
                    </div>

                    <SiteLink
                      href={asset.downloadUrl}
                      download
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-600/30 dark:text-emerald-400 dark:border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{releaseNotesModalText(locale).download}</span>
                    </SiteLink>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500">
          <span>{releaseNotesModalText(locale).checkPackageSystem}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            {releaseNotesModalText(locale).close}
          </button>
        </div>
      </div>
    </div>
  );
};
