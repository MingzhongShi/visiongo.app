import React, { useState } from 'react';
import { Bot, CheckCircle2, Crosshair, Layers, Lock, Ruler, ScanLine, ShieldAlert, Sparkles, Tag, Workflow } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { studioShowcaseText } from '../i18n/text/StudioShowcase';

type TabId = 'workflow' | 'inspection' | 'agent' | 'annotation';

export const StudioShowcase: React.FC<{ initialTab?: TabId; compact?: boolean }> = ({ initialTab = 'workflow', compact = false }) => {
  const { locale } = useLanguage();
  const tx = studioShowcaseText(locale);
  const [tab, setTab] = useState<TabId>(initialTab);
  const [modeIndex, setModeIndex] = useState(0);
  const currentMode = tx.inspectionModes[modeIndex];

  const tabIcons: Record<TabId, React.ReactNode> = {
    workflow: <Workflow className="h-3.5 w-3.5" />,
    inspection: <Crosshair className="h-3.5 w-3.5" />,
    agent: <Bot className="h-3.5 w-3.5" />,
    annotation: <Tag className="h-3.5 w-3.5" />,
  };

  return (
    <div className="surface-card overflow-hidden shadow-xl shadow-zinc-900/10 dark:shadow-2xl dark:shadow-black/30">
      {/* Interactive Tab Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/70 sm:px-4">
        <div role="tablist" aria-label="Studio capabilities" className="flex flex-wrap gap-1.5">
          {tx.tabs.map(item => {
            const id = item.id as TabId;
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-400 dark:text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                {tabIcons[id]}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {tab !== 'workflow' && (
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{tx.schematicBadge}</span>
        )}
      </div>

      {/* Tab 1: Real VisionStudio Screenshot */}
      {tab === 'workflow' && (
        <figure>
          <a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="block overflow-x-auto bg-zinc-950" aria-label={tx.openFullSize}>
            <img
              src="/screenshots/visionstudio-workflow.webp"
              alt={tx.workflowCaption}
              width={1680}
              height={980}
              fetchPriority="high"
              decoding="async"
              className="h-auto w-full min-w-[680px] md:min-w-0"
            />
          </a>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <span>{tx.workflowCaption}</span>
            <a href="/screenshots/visionstudio-workflow.webp" target="_blank" rel="noopener" className="text-link text-xs">
              {tx.openFullSize}
            </a>
          </figcaption>
        </figure>
      )}

      {/* Tab 2: Interactive Inspection Overlay Schematic */}
      {tab === 'inspection' && (
        <figure>
          <div className={`grid gap-6 p-5 sm:p-7 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.35fr_1fr]'}`}>
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {tx.inspectionModes.map((mode, idx) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setModeIndex(idx)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                      idx === modeIndex
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {idx === 0 ? <Crosshair className="h-3 w-3" /> : idx === 1 ? <Ruler className="h-3 w-3" /> : <ScanLine className="h-3 w-3" />}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
              <svg viewBox="0 0 640 320" className="h-auto w-full rounded-lg bg-zinc-900/90" role="img" aria-label={currentMode.label}>
                <defs>
                  <pattern id="vg-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="640" height="320" fill="url(#vg-grid)" />
                {/* Industrial Connector Silhouette */}
                <rect x="90" y="74" width="460" height="172" rx="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                <rect x="112" y="96" width="416" height="128" rx="8" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                {[0, 1, 2, 3, 4, 5].map(col => (
                  <g key={col}>
                    <rect x={148 + col * 62} y="122" width="18" height="30" rx="3" fill="#52525b" />
                    <rect x={148 + col * 62} y="172" width="18" height="30" rx="3" fill="#52525b" />
                  </g>
                ))}
                {/* Mode-specific overlays */}
                {modeIndex === 0 && (
                  <g>
                    <rect x="82" y="66" width="476" height="188" rx="16" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="8 5" />
                    <circle cx="320" cy="160" r="14" fill="none" stroke="#34d399" strokeWidth="2" />
                    <line x1="296" y1="160" x2="344" y2="160" stroke="#34d399" strokeWidth="1.5" />
                    <line x1="320" y1="136" x2="320" y2="184" stroke="#34d399" strokeWidth="1.5" />
                    <rect x="92" y="34" width="196" height="24" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
                    <text x="102" y="50" fill="#a7f3d0" fontSize="11" fontFamily="monospace">MATCH SCORE 0.94 · θ +1.4°</text>
                  </g>
                )}
                {modeIndex === 1 && (
                  <g>
                    <rect x="142" y="114" width="92" height="46" rx="4" fill="rgba(34,211,238,0.08)" stroke="#22d3ee" strokeWidth="1.5" />
                    <line x1="157" y1="112" x2="157" y2="162" stroke="#22d3ee" strokeWidth="1.5" />
                    <line x1="219" y1="112" x2="219" y2="162" stroke="#22d3ee" strokeWidth="1.5" />
                    <line x1="157" y1="98" x2="219" y2="98" stroke="#22d3ee" strokeWidth="2" />
                    <rect x="148" y="64" width="170" height="24" rx="5" fill="#083344" stroke="#22d3ee" strokeWidth="1" />
                    <text x="158" y="80" fill="#a5f3fc" fontSize="11" fontFamily="monospace">PITCH 2.502 mm · OK</text>
                  </g>
                )}
                {modeIndex === 2 && (
                  <g>
                    <rect x="444" y="108" width="66" height="58" rx="6" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="2" />
                    <path d="M 464 128 C 474 120, 488 134, 482 146 C 474 152, 460 144, 464 128 Z" fill="rgba(239,68,68,0.45)" stroke="#f87171" strokeWidth="1.5" />
                    <rect x="378" y="72" width="184" height="24" rx="5" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
                    <text x="388" y="88" fill="#fde68a" fontSize="11" fontFamily="monospace">BLOB AREA 142 px · NG</text>
                  </g>
                )}
              </svg>
            </div>
            <div className="flex flex-col justify-between space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{currentMode.node}</span>
                  <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                    currentMode.status === 'NG'
                      ? 'border-amber-600/35 bg-amber-500/10 text-amber-700 dark:border-amber-500/40 dark:text-amber-300'
                      : 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300'
                  }`}>
                    {currentMode.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{currentMode.metricLabel}</p>
                  <p className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">{currentMode.metricValue}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {currentMode.output}
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Studio → SDK / IPC → VisionRuntime</span>
              </div>
            </div>
          </div>
          <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            {tx.inspectionCaption}
          </figcaption>
        </figure>
      )}

      {/* Tab 3: AI Agent & L1/L2 Trial Schematic */}
      {tab === 'agent' && (
        <figure>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{tx.agentTitle}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                {tx.agentPrompt}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tx.agentSteps.map((item, index) => (
                <div key={item.step} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded border border-emerald-600/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300">
                      {item.step}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">0{index + 1}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-50/70 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/5 dark:text-amber-200">
              <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{tx.agentSafetyNote}</span>
            </div>
          </div>
          <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            {tx.agentCaption}
          </figcaption>
        </figure>
      )}

      {/* Tab 4: Sample Annotation & Model Training Loop */}
      {tab === 'annotation' && (
        <figure>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-3">
              {tx.annotationSteps.map(step => (
                <div key={step.title} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70 space-y-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{step.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div className="flex flex-wrap gap-2">
                {tx.annotationLabels.map((label, idx) => (
                  <span key={label} className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                    idx === 0
                      ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300'
                      : idx === 1
                        ? 'border-amber-600/35 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-300'
                        : 'border-cyan-600/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-300'
                  }`}>
                    {label}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                <ShieldAlert className="h-3.5 w-3.5" />
                /api/desktop/v1 · Tenant-Isolated
              </span>
            </div>
          </div>
          <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            {tx.annotationCaption}
          </figcaption>
        </figure>
      )}
    </div>
  );
};
