import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Check, Plus, ShieldCheck, Trash2, User, UserPlus, Users } from 'lucide-react';
import { Alert, Panel, api, ui } from './ui';
import { roleLabel, type OrgChoice, type Organization, type OrganizationsState } from './useOrganizations';
import { organizationPanelsText } from '../../i18n/text/OrganizationPanels';

interface Member {
  email: string;
  user_id: string | null;
  display_name: string | null;
  role: 'admin' | 'member';
  status: 'invited' | 'active';
}

const typeLabel = (type: string, zh: boolean) => (type === 'personal' ? (organizationPanelsText(zh).personal) : (organizationPanelsText(zh).enterprise));

/** The organization the organization and credits sections work on; shared so both stay on the same one. */
export const OrganizationPicker: React.FC<{
  zh: boolean;
  orgs: OrganizationsState;
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ zh, orgs, selected, onSelect }) => {
  const mine = orgs.choices.filter(choice => choice.role !== null);
  const others = orgs.choices.filter(choice => choice.role === null);
  if (!orgs.loaded) return <p className={ui.muted}>{organizationPanelsText(zh).loadingOrganizations}</p>;
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label={organizationPanelsText(zh).currentOrganization} className="grid gap-2 sm:grid-cols-2">
        {mine.map(choice => {
          const active = choice.id === selected;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={active} onClick={() => onSelect(choice.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      active ? 'border-emerald-600/40 bg-emerald-500/10 dark:border-emerald-500/50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-200/70 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'}`}>
                {choice.type === 'personal' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{choice.name}</span>
                <span className="block text-xs text-zinc-500">{typeLabel(choice.type, zh)} · {roleLabel(choice.role, zh)}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />}
            </button>
          );
        })}
      </div>
      {others.length > 0 && (
        <label className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-zinc-500" />
          <span>{organizationPanelsText(zh).platformAdminOther}</span>
          <select value={others.some(choice => choice.id === selected) ? selected! : ''}
                  onChange={event => event.target.value && onSelect(event.target.value)}
                  className={`${ui.input} flex-1 basis-56`} aria-label={organizationPanelsText(zh).otherOrganizations}>
            <option value="">{organizationPanelsText(zh).chooseOfCount(others.length)}</option>
            {others.map(choice => <option key={choice.id} value={choice.id}>{choice.name}{choice.status === 'suspended' ? (organizationPanelsText(zh).suspendedSuffix) : ''}</option>)}
          </select>
        </label>
      )}
    </div>
  );
};

/** Members and data authorization of one organization (organization section). */
export const OrganizationDetail: React.FC<{ zh: boolean; org: OrgChoice; platformAdmin: boolean }> = ({ zh, org, platformAdmin }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [detail, setDetail] = useState<Organization | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const base = `/api/orgs/${encodeURIComponent(org.id)}`;

  const load = useCallback(async () => {
    if (!org.admin) return;
    const { ok, data } = await api(`${base}/members`);
    if (!ok) { setError(data.error || (organizationPanelsText(zh).couldNotLoad)); setMembers([]); return; }
    setMembers(data.members || []);
    setDetail(data.organization || null);
  }, [base, org.admin, zh]);

  useEffect(() => { setMembers([]); setDetail(null); setError(''); setNotice(''); void load(); }, [load]);

  const run = async (action: () => Promise<{ ok: boolean; data: any }>, succeeded?: (data: any) => void) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const { ok, data } = await action();
      if (!ok) setError(data.error || (organizationPanelsText(zh).operationFailed));
      await load();
      if (ok) succeeded?.(data);
    } finally { setBusy(false); }
  };

  if (!org.admin) {
    return (
      <Panel icon={<Users className="h-4 w-4 text-zinc-400" />} title={organizationPanelsText(zh).members}>
        <Alert>
          {organizationPanelsText(zh).youAre(org.name)}
        </Alert>
      </Panel>
    );
  }

  const enterprise = org.type === 'enterprise';
  const admins = members.filter(member => member.role === 'admin').length;

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <Panel icon={<Users className="h-4 w-4 text-zinc-400" />} title={organizationPanelsText(zh).members}
             description={enterprise
               ? (organizationPanelsText(zh).peopleAdmins(members.length, admins))
               : (organizationPanelsText(zh).aPersonalOrganization)}>
        {!enterprise ? (
          <Alert tone="warning">
            <p>{organizationPanelsText(zh).toWorkWith}</p>
            <p className="text-amber-700 dark:text-amber-300/80">
              {platformAdmin
                ? (organizationPanelsText(zh).youAreA)
                : (organizationPanelsText(zh).visiongoCreatesEnterprise)}
            </p>
          </Alert>
        ) : (
          <>
            <form className="flex flex-wrap gap-2" onSubmit={event => {
              event.preventDefault();
              const email = inviteEmail.trim();
              void run(() => api(`${base}/members`, { email, role: inviteRole }), data => {
                setInviteEmail('');
                setNotice(data.member?.status === 'active'
                  ? (organizationPanelsText(zh).hasJoined(email))
                  : (organizationPanelsText(zh).hasNo(email)));
              });
            }}>
              <input type="email" required value={inviteEmail} onChange={event => setInviteEmail(event.target.value)}
                     placeholder={organizationPanelsText(zh).colleagueSEmail} aria-label={organizationPanelsText(zh).memberEmail} className={`${ui.input} flex-1 basis-56`} />
              <select value={inviteRole} onChange={event => setInviteRole(event.target.value as 'member' | 'admin')} className={ui.input} aria-label={organizationPanelsText(zh).role}>
                <option value="member">{organizationPanelsText(zh).member}</option>
                <option value="admin">{organizationPanelsText(zh).admin}</option>
              </select>
              <button type="submit" disabled={busy} className={ui.primary}>
                <UserPlus className="h-4 w-4" />{organizationPanelsText(zh).addMember}
              </button>
            </form>
            <p className={ui.muted}>
              {organizationPanelsText(zh).emailsWithAn}
            </p>
            {notice && <Alert tone="success">{notice}</Alert>}
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member.email} className={ui.row}>
                  <div className="min-w-0">
                    <div className="truncate text-zinc-900 dark:text-zinc-100">{member.display_name || member.email}</div>
                    {member.display_name && <div className="truncate font-mono text-xs text-zinc-500">{member.email}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'invited' && <span className={`${ui.badge} border-amber-500/40 text-amber-700 dark:border-amber-500/30 dark:text-amber-300`}>{organizationPanelsText(zh).noAccountYet}</span>}
                    <select value={member.role} disabled={busy} aria-label={organizationPanelsText(zh).roleOf(member.email)}
                            onChange={event => void run(() => api(`${base}/members/role`, { email: member.email, role: event.target.value }))}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <option value="member">{organizationPanelsText(zh).member}</option>
                      <option value="admin">{organizationPanelsText(zh).admin}</option>
                    </select>
                    <button type="button" disabled={busy} aria-label={organizationPanelsText(zh).remove(member.email)}
                            onClick={() => {
                              if (!window.confirm(organizationPanelsText(zh).removeFrom(member.email))) return;
                              void run(() => api(`${base}/members/remove`, { email: member.email }));
                            }}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-700 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      {detail && (
        <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />} title={organizationPanelsText(zh).aiDataAuthorization}
               description={organizationPanelsText(zh).whetherVisioncloudS}>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-sm text-zinc-900 dark:text-zinc-100">{organizationPanelsText(zh).letVisioncloudUse}</span>
            <input type="checkbox" className="h-5 w-5 shrink-0 accent-emerald-600 dark:accent-emerald-400" checked={detail.ai_data_authorized === 1} disabled={busy}
                   onChange={event => void run(() => api(`${base}/ai-data-authorization`, { authorized: event.target.checked }))} />
          </label>
          {detail.cloud_synced === false && (
            <Alert tone="warning">{organizationPanelsText(zh).savedButVisioncloud}</Alert>
          )}
          <details className="group text-xs text-zinc-500">
            <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">{organizationPanelsText(zh).whatDataIs}</summary>
            <p className="mt-2 leading-relaxed">
              {organizationPanelsText(zh).whenOnVisionclouds}
            </p>
          </details>
        </Panel>
      )}
    </div>
  );
};

/** Platform administrators: create enterprise organizations and suspend or restore them. */
export const PlatformOrganizationsPanel: React.FC<{
  zh: boolean;
  myEmail: string;
  orgs: OrganizationsState;
  onManage: (id: string) => void;
}> = ({ zh, myEmail, orgs, onManage }) => {
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<{ ok: boolean; data: any }>, succeeded?: (data: any) => void) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const { ok, data } = await action();
      if (!ok) setError(data.error || (organizationPanelsText(zh).operationFailed));
      await orgs.reload();
      if (ok) succeeded?.(data);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      <Panel as="form" icon={<Plus className="h-4 w-4 text-zinc-400" />} title={organizationPanelsText(zh).createAnEnterprise}
             description={organizationPanelsText(zh).theFirstAdministrator}
             onSubmit={event => {
               event.preventDefault();
               void run(() => api('/api/orgs', { name, admin_email: adminEmail || myEmail }), data => {
                 setName(''); setAdminEmail('');
                 setNotice(orgs.creditsAvailable
                   ? (organizationPanelsText(zh).organizationCreatedIt)
                   : (organizationPanelsText(zh).organizationCreated));
                 if (data.organization?.id) onManage(data.organization.id);
               });
             }}>
        <div className="flex flex-wrap gap-2">
          <input required value={name} onChange={event => setName(event.target.value)} aria-label={organizationPanelsText(zh).organizationName}
                 placeholder={organizationPanelsText(zh).organizationNamePlaceholder} className={`${ui.input} flex-1 basis-56`} />
          <input type="email" value={adminEmail} onChange={event => setAdminEmail(event.target.value)} aria-label={organizationPanelsText(zh).firstAdministrator}
                 placeholder={organizationPanelsText(zh).firstAdmin(myEmail)} className={`${ui.input} flex-1 basis-56`} />
          <button type="submit" disabled={busy} className={ui.primary}><Plus className="h-4 w-4" />{organizationPanelsText(zh).create}</button>
        </div>
        {notice && <Alert tone="success">{notice}</Alert>}
      </Panel>

      <Panel icon={<Building2 className="h-4 w-4 text-zinc-400" />} title={organizationPanelsText(zh).allEnterpriseOrganizations}
             description={organizationPanelsText(zh).inTotal(orgs.allOrganizations.length)}>
        {orgs.allOrganizations.length === 0 && <p className={ui.muted}>{organizationPanelsText(zh).noEnterpriseOrganizations}</p>}
        <ul className="space-y-2">
          {orgs.allOrganizations.map(org => (
            <li key={org.id} className={ui.row}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate text-zinc-900 dark:text-zinc-100">
                  {org.name}
                  {org.status === 'suspended' && <span className={`${ui.badge} border-red-500/40 text-red-700 dark:border-red-500/30 dark:text-red-300`}>{organizationPanelsText(zh).suspendedBadge}</span>}
                </div>
                <div className="truncate font-mono text-xs text-zinc-500">
                  {org.id}{typeof org.member_count === 'number' ? ` · ${organizationPanelsText(zh).memberCount(org.member_count)}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onManage(org.id)} className={ui.small}>{organizationPanelsText(zh).manageMembers}</button>
                <button type="button" disabled={busy} className={org.status === 'active' ? ui.danger : ui.small} onClick={() => {
                  if (org.status === 'active' && !window.confirm(organizationPanelsText(zh).confirmSuspend(org.name))) return;
                  void run(() => api(`/api/orgs/${encodeURIComponent(org.id)}/status`, { status: org.status === 'active' ? 'suspended' : 'active' }));
                }}>
                  {org.status === 'active' ? (organizationPanelsText(zh).suspend) : (organizationPanelsText(zh).activate)}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};
