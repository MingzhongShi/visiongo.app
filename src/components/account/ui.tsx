import React from 'react';

// Shared look of the account page: every panel is a card with a title, an optional one-line
// explanation and optional actions on the right.

export const ui = {
  card: 'rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 space-y-4',
  input: 'min-h-10 min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:outline-none disabled:opacity-60',
  primary: 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60 cursor-pointer',
  secondary: 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer',
  small: 'inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer',
  danger: 'inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer',
  row: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm',
  badge: 'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] leading-none',
  muted: 'text-xs leading-relaxed text-zinc-500',
  cell: 'px-2 py-2 text-left',
};

export const Panel: React.FC<{
  title: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
  as?: 'div' | 'form';
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}> = ({ title, icon, description, actions, children, id, as = 'div', onSubmit }) => {
  const Tag = as as any;
  return (
    <Tag id={id} className={ui.card} onSubmit={onSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">{icon}{title}</h3>
          {description && <p className="text-sm leading-relaxed text-zinc-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </Tag>
  );
};

export const Alert: React.FC<{ tone?: 'error' | 'warning' | 'success' | 'info'; children: React.ReactNode }> = ({ tone = 'info', children }) => {
  const tones = {
    error: 'border-red-800 bg-red-950/40 text-red-200',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
    info: 'border-zinc-800 bg-zinc-950 text-zinc-300',
  };
  return <div role={tone === 'error' ? 'alert' : undefined} className={`space-y-1 rounded-xl border p-3 text-sm leading-relaxed ${tones[tone]}`}>{children}</div>;
};

export async function api(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  const response = await fetch(path, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
}
