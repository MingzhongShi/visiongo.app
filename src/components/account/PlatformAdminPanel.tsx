import React, { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Mail, PackageCheck, RefreshCw, Search, Upload, UserPlus, Users } from 'lucide-react';
import { Alert, Panel, api, ui } from './ui';
import { platformAdminPanelText } from '../../i18n/text/PlatformAdminPanel';

interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  product: string;
  message: string;
  locale: string;
  source: string;
  created_at: string;
  notification_status: string;
}

interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  auth_provider: string | null;
  has_password: number;
  created_at: string;
  last_login_at: string | null;
}

interface ReleaseRow {
  product: string;
  platform: string;
  channel: string;
  latest: string;
  min_supported: string;
  url: string | null;
  sha256: string | null;
  notes_url: string | null;
  published_at: string | null;
  updated_at?: string;
}

/** What to hand over: a temporary password or a code, shown once. */
interface Handover {
  title: string;
  message: string;
}

const input = `${ui.input} flex-1 basis-48`;
const button = ui.primary;
const smallButton = ui.small;
const badge = ui.badge;


/** Platform administrators: accounts without email delivery, release manifests, and inquiries. */
export const PlatformAdminPanel: React.FC<{ zh: boolean; section: 'accounts' | 'releases' | 'inquiries' }> = ({ zh, section }) => {
  const signInUrl = typeof window !== 'undefined' ? `${window.location.origin}${platformAdminPanelText(zh).my}` : '';
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [emailSignIn, setEmailSignIn] = useState(true);
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [handover, setHandover] = useState<Handover | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [releases, setReleases] = useState<ReleaseRow[]>([]);
  const [release, setRelease] = useState({ product: 'studio', platform: 'windows-x64', channel: 'stable', latest: '',
                                           min_supported: '', url: '', sha256: '', notes_url: '' });
  const [releaseNotice, setReleaseNotice] = useState('');
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);

  const search = useCallback(async (text: string) => {
    const { ok, data } = await api(`/api/admin/users?q=${encodeURIComponent(text)}`);
    if (!ok) { setError(data.error || (platformAdminPanelText(zh).couldNotLoad)); return; }
    setUsers(data.users || []);
    setEmailSignIn(data.email_sign_in !== false);
    setEmailDelivery(!!data.email_delivery);
  }, [zh]);

  const loadReleases = useCallback(async () => {
    const { ok, data } = await api('/api/admin/releases');
    if (ok) setReleases(data.releases || []);
  }, []);

  const loadInquiries = useCallback(async () => {
    const { ok, data } = await api('/api/admin/inquiries');
    if (ok) setInquiries(data.inquiries || []);
  }, []);

  useEffect(() => {
    if (section === 'accounts') void search('');
    else if (section === 'releases') void loadReleases();
    else void loadInquiries();
  }, [section, search, loadReleases, loadInquiries]);

  const act = async (action: () => Promise<{ ok: boolean; data: any }>, done: (data: any) => void) => {
    setBusy(true);
    setError('');
    setCopied(false);
    try {
      const { ok, data } = await action();
      if (!ok) { setError(data.error || (platformAdminPanelText(zh).operationFailed)); return; }
      done(data);
      await search(query);
    } finally {
      setBusy(false);
    }
  };

  const passwordHandover = (email: string, password: string, created: boolean) => setHandover({
    title: created ? (platformAdminPanelText(zh).accountCreated) : (platformAdminPanelText(zh).passwordReset),
    message: platformAdminPanelText(zh).visiongoAccount(email, password, signInUrl),
  });

  const codeHandover = (email: string, code: string, purpose: string) => setHandover({
    title: purpose === 'reset' ? (platformAdminPanelText(zh).passwordResetCode) : (platformAdminPanelText(zh).signUpCode),
    message: platformAdminPanelText(zh).codeHandover(email, code, signInUrl, purpose === 'reset'),
  });

  const copy = async () => {
    if (!handover) return;
    try { await navigator.clipboard.writeText(handover.message); setCopied(true); } catch { setCopied(false); }
  };

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    setReleaseNotice('');
    setBusy(true);
    try {
      const body = { ...release, min_supported: release.min_supported || release.latest };
      const { ok, data } = await api('/api/admin/releases', body);
      if (!ok) { setReleaseNotice(data.error || (platformAdminPanelText(zh).couldNotPublish)); return; }
      setReleaseNotice(platformAdminPanelText(zh).published(body.product, body.latest, body.platform, body.channel));
      await loadReleases();
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof release, placeholder: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <input value={release[key]} onChange={event => setRelease({ ...release, [key]: event.target.value })}
           placeholder={placeholder} aria-label={placeholder} className={input} {...extra} />
  );

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      {section === 'accounts' && (
      <Panel icon={<Users className="h-4 w-4 text-zinc-400" />} title={platformAdminPanelText(zh).accounts}
             description={platformAdminPanelText(zh).findAccountsCreate}>
        {!emailDelivery && emailSignIn && (
          <p className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-200">
            {platformAdminPanelText(zh).thisSiteCannot}
          </p>
        )}
        {!emailSignIn && (
          <p className="text-sm text-zinc-500">
            {platformAdminPanelText(zh).thisSiteSigns}
          </p>
        )}

        {emailSignIn && (
          <form className="flex flex-wrap gap-2" onSubmit={event => {
            event.preventDefault();
            const email = newEmail.trim().toLowerCase();
            void act(() => api('/api/admin/users', { email, display_name: newName }),
                     data => { passwordHandover(email, data.temporary_password, true); setNewEmail(''); setNewName(''); });
          }}>
            <input type="email" required value={newEmail} onChange={event => setNewEmail(event.target.value)}
                   placeholder={platformAdminPanelText(zh).emailOfThe} className={input} />
            <input value={newName} onChange={event => setNewName(event.target.value)}
                   placeholder={platformAdminPanelText(zh).nameOptional} className={input} />
            <button type="submit" disabled={busy} className={button}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>{platformAdminPanelText(zh).createAccount}</span>
            </button>
            <button type="button" disabled={busy} className={button} onClick={() => {
              const email = newEmail.trim().toLowerCase();
              if (!email) { setError(platformAdminPanelText(zh).enterAnEmail); return; }
              void act(() => api('/api/admin/users/code', { email, purpose: 'register' }),
                       data => codeHandover(email, data.code, 'register'));
            }}>
              <KeyRound className="w-3.5 h-3.5" />
              <span>{platformAdminPanelText(zh).issueSignUp}</span>
            </button>
          </form>
        )}

        {handover && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-emerald-300">{handover.title}</span>
              <button type="button" onClick={() => void copy()} className={smallButton}>
                <span className="inline-flex items-center gap-1 text-sm"><Copy className="w-3 h-3" />{copied ? (platformAdminPanelText(zh).copied) : (platformAdminPanelText(zh).copy)}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-sm text-zinc-200 font-mono">{handover.message}</pre>
            <p className="text-[11px] text-zinc-500">
              {platformAdminPanelText(zh).shownOnlyThis}
            </p>
          </div>
        )}

        <form className="flex gap-2" onSubmit={event => { event.preventDefault(); void search(query); }}>
          <input value={query} onChange={event => setQuery(event.target.value)}
                 placeholder={platformAdminPanelText(zh).searchByEmail} className={input} />
          <button type="submit" className={button}><Search className="w-3.5 h-3.5" /><span>{platformAdminPanelText(zh).search}</span></button>
        </form>
        <div className="space-y-2">
          {users.length === 0 && <p className="text-sm text-zinc-500">{platformAdminPanelText(zh).noAccountsFound}</p>}
          {users.map(account => (
            <div key={account.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm">
              <div className="min-w-0">
                <div className="text-zinc-200 truncate">
                  {account.display_name || account.email}
                  {account.role === 'super_admin' && <span className={`${badge} ml-2 border-emerald-500/30 text-emerald-400`}>{platformAdminPanelText(zh).platformAdmin}</span>}
                </div>
                <div className="text-zinc-500 font-mono truncate">
                  {account.email} · {platformAdminPanelText(zh).lastSignIn} {(account.last_login_at || account.created_at).slice(0, 10)}
                </div>
              </div>
              {emailSignIn && (
                <div className="flex items-center gap-2">
                  <button type="button" disabled={busy} className={smallButton} onClick={() => {
                    if (!window.confirm(platformAdminPanelText(zh).resetThe(account.email))) return;
                    void act(() => api('/api/admin/users/reset-password', { email: account.email }),
                             data => passwordHandover(account.email, data.temporary_password, false));
                  }}>{platformAdminPanelText(zh).resetPassword}</button>
                  <button type="button" disabled={busy} className={smallButton} onClick={() => void act(
                    () => api('/api/admin/users/code', { email: account.email, purpose: 'reset' }),
                    data => codeHandover(account.email, data.code, 'reset'))}>
                    {platformAdminPanelText(zh).resetCode}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
      )}

      {section === 'releases' && (
      <Panel icon={<PackageCheck className="h-4 w-4 text-zinc-400" />} title={platformAdminPanelText(zh).softwareReleases}
             description={platformAdminPanelText(zh).visionstudioAndVisionedge}>
        <div className="space-y-2">
          {releases.length === 0 && <p className="text-sm text-amber-300">{platformAdminPanelText(zh).nothingPublishedYet}</p>}
          {releases.map(row => (
            <button type="button" key={`${row.product}-${row.platform}-${row.channel}`}
                    onClick={() => setRelease({ product: row.product, platform: row.platform, channel: row.channel, latest: row.latest,
                                                min_supported: row.min_supported, url: row.url || '', sha256: row.sha256 || '', notes_url: row.notes_url || '' })}
                    className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm hover:border-zinc-700 cursor-pointer">
              <div className="text-zinc-200 font-mono">{row.product} · {row.platform} · {row.channel}</div>
              <div className="text-zinc-500 font-mono break-all">
                {platformAdminPanelText(zh).latest} {row.latest} · {platformAdminPanelText(zh).min} {row.min_supported}{row.url ? ` · ${row.url}` : ''}
              </div>
            </button>
          ))}
        </div>
        <form className="space-y-2" onSubmit={publish}>
          <div className="flex flex-wrap gap-2">
            <select value={release.product} onChange={event => setRelease({ ...release, product: event.target.value })} className={input} aria-label={platformAdminPanelText(zh).product}>
              <option value="studio">studio</option>
              <option value="edge">edge</option>
              <option value="runtime">runtime</option>
            </select>
            {field('platform', platformAdminPanelText(zh).platformEG, { required: true, list: 'release-platforms' })}
            <datalist id="release-platforms"><option value="windows-x64" /><option value="linux-x64" /></datalist>
            {field('channel', platformAdminPanelText(zh).channelEG, { required: true })}
          </div>
          <div className="flex flex-wrap gap-2">
            {field('latest', platformAdminPanelText(zh).latestEG, { required: true })}
            {field('min_supported', platformAdminPanelText(zh).minimumSupportedEmpty)}
          </div>
          <div className="flex flex-wrap gap-2">
            {field('url', platformAdminPanelText(zh).installerUrlHttps)}
            {field('sha256', platformAdminPanelText(zh).installerSha256)}
            {field('notes_url', platformAdminPanelText(zh).releaseNotesUrl)}
          </div>
          {releaseNotice && <p className="text-sm text-zinc-300">{releaseNotice}</p>}
          <button type="submit" disabled={busy} className={button}>
            <Upload className="w-3.5 h-3.5" />
            <span>{platformAdminPanelText(zh).publish}</span>
          </button>
        </form>
      </Panel>
      )}

      {section === 'inquiries' && (
      <Panel icon={<Mail className="h-4 w-4 text-zinc-400" />} title={platformAdminPanelText(zh).inquiriesTitle}
             description={platformAdminPanelText(zh).inquiriesDesc}
             actions={<button type="button" onClick={() => void loadInquiries()} className={ui.secondary}><RefreshCw className="h-3.5 w-3.5" />{platformAdminPanelText(zh).refresh}</button>}>
        <div className="space-y-3">
          {inquiries.length === 0 && <p className="text-sm text-zinc-500">{platformAdminPanelText(zh).noInquiriesYet}</p>}
          {inquiries.map(item => (
            <div key={item.id} className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{item.name}</span>
                  {item.company && <span className="text-xs text-zinc-400">· {item.company}</span>}
                  <a href={`mailto:${item.email}`} className="font-mono text-xs text-emerald-400 hover:underline">{item.email}</a>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`${badge} ${item.notification_status === 'sent' ? 'border-emerald-500/30 text-emerald-400' : item.notification_status === 'failed' ? 'border-amber-500/30 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}>
                    {item.notification_status === 'sent' ? platformAdminPanelText(zh).inquiryStatusSent : item.notification_status === 'failed' ? platformAdminPanelText(zh).inquiryStatusFailed : platformAdminPanelText(zh).inquiryStatusPending}
                  </span>
                  <span className="font-mono text-zinc-500">{item.created_at.slice(0, 16).replace('T', ' ')}</span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{item.message}</p>
              <div className="flex flex-wrap gap-3 font-mono text-[11px] text-zinc-500">
                <span>{item.product}</span>
                {item.source && <span>{item.source}</span>}
                <span>{item.id}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      )}
    </div>
  );
};
