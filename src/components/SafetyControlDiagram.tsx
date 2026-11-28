import React, { useState } from 'react';
import { ArrowRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { safetyControlDiagramText } from '../i18n/text/SafetyControlDiagram';

export const SafetyControlDiagram: React.FC<{ initialMode?: 'boundary' | 'relay' }> = ({ initialMode = 'boundary' }) => {
  const { locale } = useLanguage();
  const tx = safetyControlDiagramText(locale);
  const [mode, setMode] = useState<'boundary' | 'relay'>(initialMode);

  const toneBorder: Record<string, string> = {
    emerald: 'border-emerald-600/30 bg-emerald-500/5 dark:border-emerald-500/30',
    violet: 'border-violet-600/30 bg-violet-500/5 dark:border-violet-500/30',
    cyan: 'border-cyan-600/30 bg-cyan-500/5 dark:border-cyan-500/30',
    amber: 'border-dashed border-amber-600/40 bg-amber-50/50 dark:border-amber-500/35 dark:bg-amber-500/5',
  };
  const toneBadge: Record<string, string> = {
    emerald: 'text-emerald-700 dark:text-emerald-400',
    violet: 'text-violet-700 dark:text-violet-400',
    cyan: 'text-cyan-700 dark:text-cyan-400',
    amber: 'text-amber-700 dark:text-amber-400',
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div role="tablist" className="flex flex-wrap gap-1.5">
          {tx.modes.map(item => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(item.id as 'boundary' | 'relay')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                {item.id === 'boundary' ? <ShieldCheck className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <span className="font-mono text-[11px] text-zinc-500">{tx.badge}</span>
      </div>

      {mode === 'boundary' ? (
        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {tx.boundaryNodes.map((node, index) => (
              <div key={node.app} className={`relative rounded-xl border p-4 ${toneBorder[node.tone]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-xs font-semibold ${toneBadge[node.tone]}`}>{node.zone}</span>
                  {index < tx.boundaryNodes.length - 1 && (
                    <ArrowRight className="hidden h-3.5 w-3.5 text-zinc-400 xl:block" />
                  )}
                </div>
                <h4 className="mt-2 text-base font-semibold text-zinc-950 dark:text-white">{node.app}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{node.role}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            <Lock className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{tx.boundaryNote}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {tx.relaySteps.map(step => (
              <div key={step.code} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-2">
                <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{step.code}</span>
                <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">{step.title}</h4>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{tx.relayNote}</span>
          </div>
        </div>
      )}
    </div>
  );
};
