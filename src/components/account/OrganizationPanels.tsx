import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Check, Plus, ShieldCheck, Trash2, User, UserPlus, Users } from 'lucide-react';
import { Alert, Panel, api, ui } from './ui';
import { roleLabel, type OrgChoice, type Organization, type OrganizationsState } from './useOrganizations';

interface Member {
  email: string;
  user_id: string | null;
  display_name: string | null;
  role: 'admin' | 'member';
  status: 'invited' | 'active';
}

const typeLabel = (type: string, zh: boolean) => (type === 'personal' ? (zh ? '个人' : 'Personal') : (zh ? '企业' : 'Enterprise'));

/** The organization the organization and credits sections work on; shared so both stay on the same one. */
export const OrganizationPicker: React.FC<{
  zh: boolean;
  orgs: OrganizationsState;
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ zh, orgs, selected, onSelect }) => {
  const mine = orgs.choices.filter(choice => choice.role !== null);
  const others = orgs.choices.filter(choice => choice.role === null);
  if (!orgs.loaded) return <p className={ui.muted}>{zh ? '正在读取组织…' : 'Loading organizations…'}</p>;
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label={zh ? '当前组织' : 'Current organization'} className="grid gap-2 sm:grid-cols-2">
        {mine.map(choice => {
          const active = choice.id === selected;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={active} onClick={() => onSelect(choice.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      active ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-900 text-zinc-400'}`}>
                {choice.type === 'personal' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-100">{choice.name}</span>
                <span className="block text-xs text-zinc-500">{typeLabel(choice.type, zh)} · {roleLabel(choice.role, zh)}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-emerald-300" />}
            </button>
          );
        })}
      </div>
      {others.length > 0 && (
        <label className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-zinc-500" />
          <span>{zh ? '平台管理：查看其他企业组织' : 'Platform admin: other organizations'}</span>
          <select value={others.some(choice => choice.id === selected) ? selected! : ''}
                  onChange={event => event.target.value && onSelect(event.target.value)}
                  className={`${ui.input} flex-1 basis-56`} aria-label={zh ? '其他企业组织' : 'Other organizations'}>
            <option value="">{zh ? `选择组织（共 ${others.length} 个）` : `Choose (${others.length})`}</option>
            {others.map(choice => <option key={choice.id} value={choice.id}>{choice.name}{choice.status === 'suspended' ? (zh ? '（已停用）' : ' (suspended)') : ''}</option>)}
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
    if (!ok) { setError(data.error || (zh ? '无法读取成员' : 'Could not load members')); setMembers([]); return; }
    setMembers(data.members || []);
    setDetail(data.organization || null);
  }, [base, org.admin, zh]);

  useEffect(() => { setMembers([]); setDetail(null); setError(''); setNotice(''); void load(); }, [load]);

  const run = async (action: () => Promise<{ ok: boolean; data: any }>, succeeded?: (data: any) => void) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const { ok, data } = await action();
      if (!ok) setError(data.error || (zh ? '操作失败' : 'Operation failed'));
      await load();
      if (ok) succeeded?.(data);
    } finally { setBusy(false); }
  };

  if (!org.admin) {
    return (
      <Panel icon={<Users className="h-4 w-4 text-zinc-400" />} title={zh ? '成员' : 'Members'}>
        <Alert>
          {zh ? `你是「${org.name}」的成员。成员和数据授权由该组织的管理员管理；需要加人或改权限时请联系管理员。`
              : `You are a member of ${org.name}. Its administrators manage members and data settings; ask them to add people or change roles.`}
        </Alert>
      </Panel>
    );
  }

  const enterprise = org.type === 'enterprise';
  const admins = members.filter(member => member.role === 'admin').length;

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <Panel icon={<Users className="h-4 w-4 text-zinc-400" />} title={zh ? '成员' : 'Members'}
             description={enterprise
               ? (zh ? `共 ${members.length} 人，其中管理员 ${admins} 人。成员用同一账号在 VisionStudio 登录并选择本组织。`
                     : `${members.length} people, ${admins} admins. Members sign in to VisionStudio with the same account and choose this organization.`)
               : (zh ? '个人组织只有你自己，不能添加成员。' : 'A personal organization has only you.')}>
        {!enterprise ? (
          <Alert tone="warning">
            <p>{zh ? '要和同事一起使用，需要一个企业组织。' : 'To work with colleagues you need an enterprise organization.'}</p>
            <p className="text-amber-300/80">
              {platformAdmin
                ? (zh ? '你是平台管理员：到左侧“平台管理 → 组织管理”创建即可。' : 'You are a platform admin: create one under Platform admin → Organizations.')
                : (zh ? '企业组织由 VISIONGO 开通，开通后你会成为它的管理员。' : 'VISIONGO creates enterprise organizations; you become their administrator.')}
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
                  ? (zh ? `${email} 已加入组织。` : `${email} has joined.`)
                  : (zh ? `${email} 还没有账号，已记下邀请：对方用这个邮箱注册后自动加入。本站暂不能发邮件时，请到“平台管理 → 账号管理”为他生成注册验证码或直接创建账号。`
                        : `${email} has no account yet; they join when they sign up with this email.`));
              });
            }}>
              <input type="email" required value={inviteEmail} onChange={event => setInviteEmail(event.target.value)}
                     placeholder={zh ? '同事的邮箱' : 'Colleague’s email'} aria-label={zh ? '成员邮箱' : 'Member email'} className={`${ui.input} flex-1 basis-56`} />
              <select value={inviteRole} onChange={event => setInviteRole(event.target.value as 'member' | 'admin')} className={ui.input} aria-label={zh ? '角色' : 'Role'}>
                <option value="member">{zh ? '成员' : 'Member'}</option>
                <option value="admin">{zh ? '管理员' : 'Admin'}</option>
              </select>
              <button type="submit" disabled={busy} className={ui.primary}>
                <UserPlus className="h-4 w-4" />{zh ? '添加成员' : 'Add member'}
              </button>
            </form>
            <p className={ui.muted}>
              {zh ? '已注册的邮箱立即加入；未注册的显示“待注册”，对方用该邮箱注册或登录后自动加入。被移除的成员在 10 分钟内失去访问权，数据仍归组织所有。'
                  : 'Emails with an account join at once; others join when they sign up with that email. Removed members lose access within 10 minutes; their data stays with the organization.'}
            </p>
            {notice && <Alert tone="success">{notice}</Alert>}
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member.email} className={ui.row}>
                  <div className="min-w-0">
                    <div className="truncate text-zinc-100">{member.display_name || member.email}</div>
                    {member.display_name && <div className="truncate font-mono text-xs text-zinc-500">{member.email}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'invited' && <span className={`${ui.badge} border-amber-500/30 text-amber-300`}>{zh ? '待注册' : 'No account yet'}</span>}
                    <select value={member.role} disabled={busy} aria-label={zh ? `${member.email} 的角色` : `Role of ${member.email}`}
                            onChange={event => void run(() => api(`${base}/members/role`, { email: member.email, role: event.target.value }))}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300">
                      <option value="member">{zh ? '成员' : 'Member'}</option>
                      <option value="admin">{zh ? '管理员' : 'Admin'}</option>
                    </select>
                    <button type="button" disabled={busy} aria-label={zh ? `移除 ${member.email}` : `Remove ${member.email}`}
                            onClick={() => {
                              if (!window.confirm(zh ? `确定将 ${member.email} 移出组织？` : `Remove ${member.email} from the organization?`)) return;
                              void run(() => api(`${base}/members/remove`, { email: member.email }));
                            }}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer">
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
        <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />} title={zh ? 'AI 数据授权' : 'AI data authorization'}
               description={zh ? '决定 VisionCloud 的 AI 功能能否使用本组织的数据。关闭时这些 AI 功能不可用。'
                               : 'Whether VisionCloud’s AI functions may use this organization’s data. When off, those functions are unavailable.'}>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <span className="text-sm text-zinc-100">{zh ? '允许 VisionCloud 使用本组织数据提供 AI 功能' : 'Let VisionCloud use this organization’s data for AI'}</span>
            <input type="checkbox" className="h-5 w-5 shrink-0 accent-emerald-400" checked={detail.ai_data_authorized === 1} disabled={busy}
                   onChange={event => void run(() => api(`${base}/ai-data-authorization`, { authorized: event.target.checked }))} />
          </label>
          {detail.cloud_synced === false && (
            <Alert tone="warning">{zh ? '设置已保存，但 VisionCloud 暂未确认；下次打开本页时会自动重发。'
                                      : 'Saved, but VisionCloud has not confirmed it yet; it is sent again the next time this page opens.'}</Alert>
          )}
          <details className="group text-xs text-zinc-500">
            <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">{zh ? '使用哪些数据、保存多久' : 'What data is used and for how long'}</summary>
            <p className="mt-2 leading-relaxed">
              {zh ? '开启后，VisionCloud 的 AI 功能（流程规划、调参、专家问答、NG 分析、AI 建方案、脚本草稿）会使用本组织提交的问题、工作流结构与参数、变更记录及其结果、对回答的点评来生成建议并持续改进；数据只在本组织内使用，跨组织共享的只有去除名称和自由文本的调参与经验统计。关闭时以上 AI 功能全部不可用，工作流版本照常保存；已从本组织学到的经验卡与技能立即停用，共享出去的统计在 24 小时内删除并留下删除记录。AI 调用明细（提问、回答与变更记录的内容）保留 180 天，之后只保留不含内容的周度统计；用量与计费明细保留 3 年，之后只保留月度汇总；组织可随时要求立即删除全部 AI 数据。数据存放于中国境内的 VisionCloud；工位上 VisionEdge 的图像（回放集、复查图像）只保存在本地，不上传。更改会立即通知 VisionCloud；VisionCloud 暂时无法确认时，也会在成员下次登录或令牌刷新（10 分钟内）后生效。'
                  : 'When on, VisionCloud\'s AI functions (workflow planning, tuning, expert answers, NG analysis, AI solution drafts, script drafts) use the questions, workflow structure and parameters, change records with their results and the ratings of answers this organization submits, to make suggestions and improve them. The data is used within this organization; only tuning and experience statistics without names or free text are shared across organizations. When off, all these AI functions are unavailable; workflow versions are still kept; the experience cards and skills learned from this organization stop being used at once, and its shared statistics are deleted within 24 hours, with a record of the deletion. AI call details (the questions, answers and change records) are kept for 180 days, after that only weekly statistics without content; usage and billing details are kept for 3 years, after that only monthly totals; the organization may ask for all its AI data to be deleted at any time. The data is stored by VisionCloud in mainland China; images on a station\'s VisionEdge (replay sets, review images) stay on that station and are not uploaded. A change is sent to VisionCloud at once; if VisionCloud cannot confirm it yet, it still applies after members sign in again or their token refreshes (within 10 minutes).'}
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
      if (!ok) setError(data.error || (zh ? '操作失败' : 'Operation failed'));
      await orgs.reload();
      if (ok) succeeded?.(data);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      <Panel as="form" icon={<Plus className="h-4 w-4 text-zinc-400" />} title={zh ? '创建企业组织' : 'Create an enterprise organization'}
             description={zh ? '首位管理员可以是任何邮箱；对方还没注册时，注册后自动成为管理员。' : 'The first administrator may be any email; without an account yet they become admin on sign-up.'}
             onSubmit={event => {
               event.preventDefault();
               void run(() => api('/api/orgs', { name, admin_email: adminEmail || myEmail }), data => {
                 setName(''); setAdminEmail('');
                 setNotice(orgs.creditsAvailable
                   ? (zh ? '企业组织已创建。它在 VisionCloud 的额度是 0：请到“额度与用量”按提示开户并充值，否则成员用 AI 会提示额度不足。'
                         : 'Organization created. It has no VisionCloud credits yet: see Credits and usage.')
                   : (zh ? '企业组织已创建。' : 'Organization created.'));
                 if (data.organization?.id) onManage(data.organization.id);
               });
             }}>
        <div className="flex flex-wrap gap-2">
          <input required value={name} onChange={event => setName(event.target.value)} aria-label={zh ? '组织名称' : 'Organization name'}
                 placeholder={zh ? '组织名称，例如公司名' : 'Organization name'} className={`${ui.input} flex-1 basis-56`} />
          <input type="email" value={adminEmail} onChange={event => setAdminEmail(event.target.value)} aria-label={zh ? '首位管理员邮箱' : 'First administrator'}
                 placeholder={zh ? `首位管理员邮箱（留空为你：${myEmail}）` : `First admin (empty: you, ${myEmail})`} className={`${ui.input} flex-1 basis-56`} />
          <button type="submit" disabled={busy} className={ui.primary}><Plus className="h-4 w-4" />{zh ? '创建' : 'Create'}</button>
        </div>
        {notice && <Alert tone="success">{notice}</Alert>}
      </Panel>

      <Panel icon={<Building2 className="h-4 w-4 text-zinc-400" />} title={zh ? '全部企业组织' : 'All enterprise organizations'}
             description={zh ? `共 ${orgs.allOrganizations.length} 个。停用后成员无法登录使用该组织。` : `${orgs.allOrganizations.length} in total. Members of a suspended one cannot use it.`}>
        {orgs.allOrganizations.length === 0 && <p className={ui.muted}>{zh ? '还没有企业组织。' : 'No enterprise organizations yet.'}</p>}
        <ul className="space-y-2">
          {orgs.allOrganizations.map(org => (
            <li key={org.id} className={ui.row}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate text-zinc-100">
                  {org.name}
                  {org.status === 'suspended' && <span className={`${ui.badge} border-red-500/30 text-red-300`}>{zh ? '已停用' : 'Suspended'}</span>}
                </div>
                <div className="truncate font-mono text-xs text-zinc-500">
                  {org.id}{typeof org.member_count === 'number' ? ` · ${zh ? `${org.member_count} 名成员` : `${org.member_count} members`}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onManage(org.id)} className={ui.small}>{zh ? '管理成员' : 'Members'}</button>
                <button type="button" disabled={busy} className={org.status === 'active' ? ui.danger : ui.small} onClick={() => {
                  if (org.status === 'active' && !window.confirm(zh ? `停用后 ${org.name} 的成员将无法登录使用该组织，确定停用？` : `Suspend ${org.name}?`)) return;
                  void run(() => api(`/api/orgs/${encodeURIComponent(org.id)}/status`, { status: org.status === 'active' ? 'suspended' : 'active' }));
                }}>
                  {org.status === 'active' ? (zh ? '停用' : 'Suspend') : (zh ? '恢复' : 'Activate')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};
