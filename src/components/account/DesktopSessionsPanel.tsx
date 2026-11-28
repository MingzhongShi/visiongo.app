import React from 'react';
import { Monitor } from 'lucide-react';
import { Alert, Panel, ui } from './ui';
import { desktopSessionsPanelText } from '../../i18n/text/DesktopSessionsPanel';

export interface DesktopSession {
  family_id: string;
  device_name: string | null;
  tenant_id: string;
  tenant_name: string | null;
  signed_in_at: string;
  last_used_at: string;
}

/** VisionStudio sign-ins of this account (identity 4), each ended separately or all at once. */
export const DesktopSessionsPanel: React.FC<{
  zh: boolean;
  sessions: DesktopSession[] | null;
  error: string;
  busy: boolean;
  onRevoke: (body: { family_id?: string; all?: boolean }) => void;
}> = ({ zh, sessions, error, busy, onRevoke }) => {
  const when = (iso: string) => new Date(iso).toLocaleString(zh ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <Panel icon={<Monitor className="h-4 w-4 text-zinc-400" />} title={desktopSessionsPanelText(zh).computersSignedIn}
           description={desktopSessionsPanelText(zh).signOutA}
           actions={sessions && sessions.length > 1 && (
             <button type="button" disabled={busy} onClick={() => {
               if (window.confirm(desktopSessionsPanelText(zh).signOutVisionstudio)) onRevoke({ all: true });
             }} className={ui.danger}>{desktopSessionsPanelText(zh).signOutEverywhere}</button>
           )}>
      {error && <Alert tone="error">{error}</Alert>}
      {sessions === null ? (
        <p className={ui.muted}>{desktopSessionsPanelText(zh).loading}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{desktopSessionsPanelText(zh).noComputerIs}</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map(session => (
            <li key={session.family_id} className={ui.row}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"><Monitor className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <div className="truncate text-zinc-900 dark:text-zinc-100">{session.device_name || (desktopSessionsPanelText(zh).unnamedComputer)}</div>
                  <div className="text-xs text-zinc-500">
                    {session.tenant_name || session.tenant_id} · {desktopSessionsPanelText(zh).lastUsed} {when(session.last_used_at)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-600">{desktopSessionsPanelText(zh).signedIn} {when(session.signed_in_at)}</div>
                </div>
              </div>
              <button type="button" disabled={busy} onClick={() => onRevoke({ family_id: session.family_id })} className={ui.small}>
                {desktopSessionsPanelText(zh).signOut}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};
