import React from 'react';

// Shared look of the account page: every panel is a card with a title, an optional one-line
// explanation and optional actions on the right.

export const ui = {
  card: 'surface-card space-y-4 p-5 sm:p-6',
  input: 'min-h-10 min-w-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600/60 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500/60',
  primary: 'btn-primary btn-sm',
  secondary: 'btn-secondary btn-sm',
  small: 'inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 cursor-pointer dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800',
  danger: 'inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer dark:text-red-300',
  row: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950',
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
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-950 dark:text-white">{icon}{title}</h3>
          {description && <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </Tag>
  );
};

export const Alert: React.FC<{ tone?: 'error' | 'warning' | 'success' | 'info'; children: React.ReactNode }> = ({ tone = 'info', children }) => {
  const tones = {
    error: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
    warning: 'border-amber-500/40 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-200',
    success: 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200',
    info: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300',
  };
  return <div role={tone === 'error' ? 'alert' : undefined} className={`space-y-1 rounded-xl border p-3 text-sm leading-relaxed ${tones[tone]}`}>{children}</div>;
};

export { api } from '../../lib/api';
