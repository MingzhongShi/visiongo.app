import React from 'react';
import { Monitor } from 'lucide-react';
import { Alert, Panel, ui } from './ui';

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
    <Panel icon={<Monitor className="h-4 w-4 text-zinc-400" />} title={zh ? '已登录 VisionStudio 的电脑' : 'Computers signed in to VisionStudio'}
           description={zh ? '电脑丢失或不再使用时，在这里让它退出登录。退出后那台电脑上的 VisionStudio 需要重新登录。'
                           : 'Sign out a computer you lost or no longer use; VisionStudio on it must sign in again.'}
           actions={sessions && sessions.length > 1 && (
             <button type="button" disabled={busy} onClick={() => {
               if (window.confirm(zh ? '让所有电脑上的 VisionStudio 都退出登录？' : 'Sign out VisionStudio on every computer?')) onRevoke({ all: true });
             }} className={ui.danger}>{zh ? '全部退出' : 'Sign out everywhere'}</button>
           )}>
      {error && <Alert tone="error">{error}</Alert>}
      {sessions === null ? (
        <p className={ui.muted}>{zh ? '正在读取…' : 'Loading…'}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-zinc-400">{zh ? '目前没有电脑登录。在 VisionStudio 里用本账号登录后，会出现在这里。' : 'No computer is signed in. Computers appear here after signing in to VisionStudio with this account.'}</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map(session => (
            <li key={session.family_id} className={ui.row}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400"><Monitor className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <div className="truncate text-zinc-100">{session.device_name || (zh ? '未命名的电脑' : 'Unnamed computer')}</div>
                  <div className="text-xs text-zinc-500">
                    {session.tenant_name || session.tenant_id} · {zh ? '最近使用' : 'last used'} {when(session.last_used_at)}
                  </div>
                  <div className="text-xs text-zinc-600">{zh ? '登录于' : 'signed in'} {when(session.signed_in_at)}</div>
                </div>
              </div>
              <button type="button" disabled={busy} onClick={() => onRevoke({ family_id: session.family_id })} className={ui.small}>
                {zh ? '退出登录' : 'Sign out'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};
