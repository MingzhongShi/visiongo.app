import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Coins,
  Download,
  LayoutDashboard,
  LogOut,
  Monitor,
  Package,
  PackageCheck,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { AuthCard } from '../components/AuthCard';
import { ChangePasswordPanel } from '../components/account/ChangePasswordPanel';
import { CreditsPanel } from '../components/account/CreditsPanel';
import { DesktopSessionsPanel, type DesktopSession } from '../components/account/DesktopSessionsPanel';
import { OrganizationDetail, OrganizationPicker, PlatformOrganizationsPanel } from '../components/account/OrganizationPanels';
import { PlatformAdminPanel } from '../components/account/PlatformAdminPanel';
import { Alert, Panel, ui } from '../components/account/ui';
import { roleLabel, useOrganizations, type OrgChoice } from '../components/account/useOrganizations';
import { useAuth, type AuthUser } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

interface UserDownloadRecord {
  id: string;
  userId: string;
  product: string;
  version: string;
  assetName: string;
  downloadedAt: string;
}

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

type SectionId = 'overview' | 'security' | 'devices' | 'organization' | 'credits' | 'downloads'
  | 'admin-accounts' | 'admin-organizations' | 'admin-releases';

interface NavItem { id: SectionId; label: string; hint: string; icon: React.ElementType }
interface NavGroup { label: string; items: NavItem[] }

const SECTIONS: SectionId[] = ['overview', 'security', 'devices', 'organization', 'credits', 'downloads',
  'admin-accounts', 'admin-organizations', 'admin-releases'];
const ORG_KEY = 'visiongo_account_org';

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.slice(1) as SectionId;
  return SECTIONS.includes(hash) ? hash : 'overview';
};

const formatDate = (iso: string, zh: boolean) => {
  try {
    return new Date(iso).toLocaleDateString(zh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const Avatar: React.FC<{ user: AuthUser; size?: string }> = ({ user, size = 'h-14 w-14 text-xl' }) => (
  user.avatarUrl
    ? <img src={user.avatarUrl} alt="" className={`${size} shrink-0 rounded-2xl border border-zinc-700 object-cover`} />
    : <div className={`${size} flex shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 font-semibold text-emerald-300`}>
        {(user.displayName || user.email)[0].toUpperCase()}
      </div>
);

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading, logout } = useAuth();
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const authParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const authNotice = authParams.has('auth_error') || authParams.has('auth_notice');

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 pt-24 font-sans text-zinc-100">
      <SeoHead
        noindex
        title={zh ? '我的账户 — VISIONGO' : 'My account — VISIONGO'}
        description={zh ? '管理 VISIONGO 账号、已登录的电脑、组织成员、云端额度与软件下载。'
                        : 'Manage your VISIONGO account, signed-in computers, organization members, cloud credits and downloads.'}
        canonicalPath="/my"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {authNotice && !user && (
          <div className="mx-auto mb-6 max-w-xl">
            <Alert tone="warning">{zh ? '第三方登录未完成或暂不可用。请重新登录，或选择其他可用的登录方式。'
                                      : 'Third-party sign-in did not complete or is unavailable. Please retry or choose another available sign-in method.'}</Alert>
          </div>
        )}
        {authLoading ? (
          <div role="status" className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500" />
            <span className="sr-only">{zh ? '正在加载' : 'Loading'}</span>
          </div>
        ) : !user ? (
          <SignIn zh={zh} />
        ) : (
          <Account zh={zh} user={user} logout={logout} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};

const SignIn: React.FC<{ zh: boolean }> = ({ zh }) => (
  <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-2xl sm:p-12">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-emerald-400">
      <User className="h-7 w-7" />
    </div>
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-white">{zh ? '登录 VISIONGO 账户' : 'Sign in to your VISIONGO account'}</h1>
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-400">
        {zh ? '同一个账号用于本网站和 VisionStudio。登录后可管理组织与成员、云端额度、已登录的电脑和软件下载。'
            : 'One account for this site and VisionStudio. Sign in to manage organizations and members, cloud credits, signed-in computers and downloads.'}
      </p>
    </div>
    <div className="pt-2"><AuthCard /></div>
  </div>
);

const Account: React.FC<{ zh: boolean; user: AuthUser; logout: () => Promise<void>; onNavigate: (path: string) => void }> = ({ zh, user, logout, onNavigate }) => {
  const platformAdmin = user.role === 'super_admin';
  const [section, setSection] = useState<SectionId>(sectionFromHash);
  const orgs = useOrganizations(zh);

  // The organization the organization and credits sections work on; remembered per browser.
  const [orgId, setOrgId] = useState<string | null>(() => {
    try { return window.localStorage.getItem(ORG_KEY); } catch { return null; }
  });
  useEffect(() => {
    if (!orgs.loaded || !orgs.choices.length) return;
    if (orgId && orgs.choices.some(choice => choice.id === orgId)) return;
    // Default: an enterprise organization the user administers, then any enterprise one, then personal.
    const preferred = orgs.choices.find(choice => choice.role && choice.type === 'enterprise' && choice.admin)
      ?? orgs.choices.find(choice => choice.role && choice.type === 'enterprise')
      ?? orgs.choices[0];
    setOrgId(preferred.id);
  }, [orgs.loaded, orgs.choices, orgId]);
  const selectOrg = useCallback((id: string) => {
    setOrgId(id);
    try { window.localStorage.setItem(ORG_KEY, id); } catch { /* per-browser convenience only */ }
  }, []);
  const org = orgs.choices.find(choice => choice.id === orgId) ?? null;

  // Signed-in computers: shown in the overview and in their own section.
  const [sessions, setSessions] = useState<DesktopSession[] | null>(null);
  const [sessionsError, setSessionsError] = useState('');
  const [sessionsBusy, setSessionsBusy] = useState(false);
  const loadSessions = useCallback(() => {
    fetch('/api/account/desktop-sessions')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(data => { setSessions(data.sessions || []); setSessionsError(''); })
      .catch(() => { setSessions([]); setSessionsError(zh ? '无法读取已登录的电脑。' : 'Could not load the signed-in computers.'); });
  }, [zh]);
  useEffect(loadSessions, [loadSessions]);
  const revoke = async (body: { family_id?: string; all?: boolean }) => {
    setSessionsBusy(true);
    setSessionsError('');
    try {
      const res = await fetch('/api/account/desktop-sessions/revoke', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSessionsError(zh ? '退出登录失败，请重试。' : 'Signing out failed. Please retry.');
    } finally {
      setSessionsBusy(false);
      loadSessions();
    }
  };

  const [downloads, setDownloads] = useState<UserDownloadRecord[] | null>(null);
  useEffect(() => {
    fetch('/api/user/downloads')
      .then(res => (res.ok ? res.json() : { downloads: [] }))
      .then(data => setDownloads(data.downloads || []))
      .catch(() => setDownloads([]));
  }, []);

  const groups: NavGroup[] = useMemo(() => {
    const list: NavGroup[] = [
      { label: zh ? '个人' : 'You', items: [
        { id: 'overview', label: zh ? '概览' : 'Overview', hint: zh ? '账户一览与常用入口' : 'Everything at a glance', icon: LayoutDashboard },
        { id: 'security', label: zh ? '账号与安全' : 'Sign-in & security', hint: zh ? '个人资料、密码、退出登录' : 'Profile, password, sign out', icon: UserCog },
        { id: 'devices', label: zh ? '已登录的电脑' : 'Signed-in computers', hint: zh ? 'VisionStudio 登录管理' : 'VisionStudio sign-ins', icon: Monitor },
      ] },
      { label: zh ? '组织' : 'Organization', items: [
        { id: 'organization', label: zh ? '组织与成员' : 'Organization & members', hint: zh ? '切换组织、添加成员、AI 数据授权' : 'Switch, add members, AI data', icon: Users },
        { id: 'credits', label: zh ? '额度与用量' : 'Credits & usage', hint: zh ? '余额、用量、充值消费流水' : 'Balance, usage, ledger', icon: Coins },
      ] },
      { label: zh ? '软件' : 'Software', items: [
        { id: 'downloads', label: zh ? '下载与授权' : 'Downloads & licensing', hint: zh ? '安装包、下载记录、商用授权' : 'Installers, history, licensing', icon: Download },
      ] },
    ];
    if (platformAdmin) list.push({ label: zh ? '平台管理' : 'Platform admin', items: [
      { id: 'admin-accounts', label: zh ? '账号管理' : 'Accounts', hint: zh ? '建账号、重置密码、验证码' : 'Create, reset, codes', icon: UserCog },
      { id: 'admin-organizations', label: zh ? '组织管理' : 'Organizations', hint: zh ? '创建、停用企业组织' : 'Create, suspend', icon: Building2 },
      { id: 'admin-releases', label: zh ? '版本发布' : 'Releases', hint: zh ? '桌面软件更新记录' : 'Desktop update records', icon: PackageCheck },
    ] });
    return list;
  }, [zh, platformAdmin]);
  const items = groups.flatMap(group => group.items);
  const current = items.find(item => item.id === section) ?? items[0];

  const go = useCallback((id: SectionId) => {
    setSection(id);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${id === 'overview' ? '' : `#${id}`}`);
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const follow = () => setSection(sectionFromHash());
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, []);

  // On phones the tab strip scrolls sideways: keep the current tab visible.
  useEffect(() => {
    const link = document.querySelector<HTMLElement>('nav[data-account-nav] a[aria-current="page"]');
    const strip = link?.closest('nav');
    if (!link || !strip || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollLeft = link.offsetLeft - (strip.clientWidth - link.offsetWidth) / 2;
  }, [section]);

  const manageOrg = (id: string) => { selectOrg(id); go('organization'); };
  const name = user.displayName || user.email.split('@')[0];

  return (
    <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8">
      {/* Navigation: a sidebar on wide screens, a scrolling tab strip on phones. */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 hidden items-center gap-3 lg:flex">
          <Avatar user={user} size="h-10 w-10 text-base" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{name}</div>
            <div className="truncate text-xs text-zinc-500">{user.email}</div>
          </div>
        </div>
        <nav data-account-nav aria-label={zh ? '账户导航' : 'Account navigation'}
             className="relative -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800 px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:mb-0 lg:block lg:space-y-5 lg:overflow-visible lg:border-0 lg:px-0 lg:pb-0">
          {groups.map(group => (
            <div key={group.label} className="contents lg:block">
              <div className="hidden px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 lg:block">{group.label}</div>
              <ul className="contents lg:block lg:space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = item.id === current.id;
                  return (
                    <li key={item.id} className="shrink-0">
                      <a href={`#${item.id}`} aria-current={active ? 'page' : undefined}
                         onClick={event => { event.preventDefault(); go(item.id); }}
                         className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                           active ? 'bg-emerald-500/10 font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30'
                                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <button type="button" onClick={() => void logout()}
                className="mt-6 hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-white cursor-pointer lg:flex">
          <LogOut className="h-4 w-4" />{zh ? '退出登录' : 'Sign out'}
        </button>
      </aside>

      <section aria-labelledby="account-section-title" className="min-w-0 space-y-6">
        <header className="space-y-1">
          <h1 id="account-section-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{current.label}</h1>
          <p className="text-sm text-zinc-400">{current.hint}</p>
        </header>

        {current.id === 'overview' && (
          <Overview zh={zh} user={user} name={name} org={org} orgs={orgs} sessions={sessions} downloads={downloads} go={go} />
        )}

        {current.id === 'security' && (
          <>
            <Panel icon={<User className="h-4 w-4 text-zinc-400" />} title={zh ? '个人资料' : 'Profile'}
                   actions={<button type="button" onClick={() => void logout()} className={ui.secondary}><LogOut className="h-4 w-4" />{zh ? '退出登录' : 'Sign out'}</button>}>
              <div className="flex items-center gap-4">
                <Avatar user={user} />
                <dl className="grid min-w-0 gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                  <dt className="text-zinc-500">{zh ? '名称' : 'Name'}</dt><dd className="truncate text-zinc-100">{name}</dd>
                  <dt className="text-zinc-500">{zh ? '邮箱' : 'Email'}</dt><dd className="truncate font-mono text-zinc-100">{user.email}</dd>
                  <dt className="text-zinc-500">{zh ? '注册时间' : 'Member since'}</dt><dd className="text-zinc-100">{formatDate(user.createdAt, zh)}</dd>
                  <dt className="text-zinc-500">{zh ? '账号 ID' : 'Account ID'}</dt><dd className="truncate font-mono text-xs text-zinc-400">{user.id}</dd>
                </dl>
              </div>
            </Panel>
            <ChangePasswordPanel zh={zh} />
            <Panel icon={<Monitor className="h-4 w-4 text-zinc-400" />} title={zh ? '已登录的电脑' : 'Signed-in computers'}
                   description={zh ? `当前有 ${sessions?.length ?? 0} 台电脑登录了 VisionStudio。` : `${sessions?.length ?? 0} computers are signed in to VisionStudio.`}
                   actions={<button type="button" onClick={() => go('devices')} className={ui.secondary}>{zh ? '管理' : 'Manage'}<ChevronRight className="h-4 w-4" /></button>} />
          </>
        )}

        {current.id === 'devices' && (
          <DesktopSessionsPanel zh={zh} sessions={sessions} error={sessionsError} busy={sessionsBusy} onRevoke={body => void revoke(body)} />
        )}

        {(current.id === 'organization' || current.id === 'credits') && (
          <>
            {orgs.error && <Alert tone="error">{orgs.error}</Alert>}
            <Panel icon={<Building2 className="h-4 w-4 text-zinc-400" />} title={zh ? '当前组织' : 'Current organization'}
                   description={zh ? '下面的内容都针对所选组织。在 VisionStudio 登录时也要选择组织；训练数据、模型和云端额度按组织隔离。'
                                   : 'Everything below applies to the chosen organization. VisionStudio asks for one at sign-in; data, models and credits are kept per organization.'}>
              <OrganizationPicker zh={zh} orgs={orgs} selected={orgId} onSelect={selectOrg} />
            </Panel>
            {org && current.id === 'organization' && <OrganizationDetail key={org.id} zh={zh} org={org} platformAdmin={orgs.platformAdmin} />}
            {org && current.id === 'credits' && (orgs.creditsAvailable
              ? <CreditsPanel key={org.id} zh={zh} organization={org} cloudAdminUrl={orgs.cloudAdminUrl} />
              : <Alert>{zh ? '本站尚未开通云端服务，暂无额度与用量。' : 'Cloud services are not available on this site yet.'}</Alert>)}
          </>
        )}

        {current.id === 'downloads' && <Downloads zh={zh} downloads={downloads} onNavigate={onNavigate} />}

        {platformAdmin && current.id === 'admin-accounts' && <PlatformAdminPanel zh={zh} section="accounts" />}
        {platformAdmin && current.id === 'admin-organizations' && (
          <PlatformOrganizationsPanel zh={zh} myEmail={user.email} orgs={orgs} onManage={manageOrg} />
        )}
        {platformAdmin && current.id === 'admin-releases' && <PlatformAdminPanel zh={zh} section="releases" />}

        <button type="button" onClick={() => void logout()} className={`${ui.secondary} w-full lg:hidden`}>
          <LogOut className="h-4 w-4" />{zh ? '退出登录' : 'Sign out'}
        </button>
      </section>
    </div>
  );
};

const Overview: React.FC<{
  zh: boolean;
  user: AuthUser;
  name: string;
  org: OrgChoice | null;
  orgs: ReturnType<typeof useOrganizations>;
  sessions: DesktopSession[] | null;
  downloads: UserDownloadRecord[] | null;
  go: (id: SectionId) => void;
}> = ({ zh, user, name, org, orgs, sessions, downloads, go }) => {
  const tile = (id: SectionId, Icon: React.ElementType, title: string, value: string, detail: string) => (
    <button key={id} type="button" onClick={() => go(id)}
            className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer">
      <span className="flex items-center justify-between text-sm text-zinc-400">
        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{title}</span>
        <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-300" />
      </span>
      <span className="truncate text-xl font-semibold text-white">{value}</span>
      <span className="text-xs leading-relaxed text-zinc-500">{detail}</span>
    </button>
  );
  const mine = orgs.choices.filter(choice => choice.role !== null);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold text-white">{zh ? `你好，${name}` : `Hello, ${name}`}</div>
          <div className="truncate font-mono text-sm text-zinc-400">{user.email}</div>
          <div className="text-xs text-zinc-500">{zh ? '注册于' : 'Member since'} {formatDate(user.createdAt, zh)}</div>
        </div>
        <button type="button" onClick={() => go('security')} className={ui.secondary}>{zh ? '账号与安全' : 'Sign-in & security'}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tile('organization', Users, zh ? '组织与成员' : 'Organization & members',
              org ? org.name : (orgs.loaded ? (zh ? '暂无组织' : 'No organization') : '…'),
              org ? `${org.type === 'personal' ? (zh ? '个人组织' : 'Personal') : (zh ? '企业组织' : 'Enterprise')} · ${roleLabel(org.role, zh)}${mine.length > 1 ? (zh ? ` · 共 ${mine.length} 个组织` : ` · ${mine.length} organizations`) : ''}`
                  : (zh ? '查看所在组织、添加同事' : 'See your organizations, add colleagues'))}
        {tile('credits', Coins, zh ? '额度与用量' : 'Credits & usage',
              orgs.creditsAvailable ? (zh ? '查看余额' : 'View balance') : (zh ? '暂未开通' : 'Not available'),
              orgs.creditsAvailable ? (zh ? 'VisionCloud AI 功能的余额、用量与充值流水。个人组织首次使用赠送 100 Credits。' : 'Balance, usage and ledger for VisionCloud AI. Personal organizations get 100 trial Credits.')
                                    : (zh ? '本站尚未开通云端服务。' : 'Cloud services are not available on this site yet.'))}
        {tile('devices', Monitor, zh ? '已登录的电脑' : 'Signed-in computers',
              sessions === null ? '…' : (zh ? `${sessions.length} 台` : `${sessions.length}`),
              zh ? '登录了 VisionStudio 的电脑，可逐台退出。' : 'Computers signed in to VisionStudio; sign any of them out.')}
        {tile('downloads', Download, zh ? '下载与授权' : 'Downloads & licensing',
              downloads === null ? '…' : (zh ? `${downloads.length} 条下载记录` : `${downloads.length} downloads`),
              zh ? '获取安装包、查看下载记录、申请商用授权。' : 'Get installers, see your downloads, request a license.')}
        {tile('security', ShieldCheck, zh ? '账号与安全' : 'Sign-in & security', zh ? '密码与资料' : 'Password & profile',
              zh ? '修改密码、查看账号信息、退出登录。' : 'Change password, see account details, sign out.')}
      </div>

      {orgs.platformAdmin && (
        <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />} title={zh ? '平台管理' : 'Platform admin'}
               description={zh ? '你是平台管理员。' : 'You are a platform administrator.'}>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => go('admin-accounts')} className={ui.secondary}>{zh ? '账号管理' : 'Accounts'}</button>
            <button type="button" onClick={() => go('admin-organizations')} className={ui.secondary}>
              {zh ? `组织管理（${orgs.allOrganizations.length}）` : `Organizations (${orgs.allOrganizations.length})`}
            </button>
            <button type="button" onClick={() => go('admin-releases')} className={ui.secondary}>{zh ? '版本发布' : 'Releases'}</button>
          </div>
        </Panel>
      )}
    </div>
  );
};

const Downloads: React.FC<{ zh: boolean; downloads: UserDownloadRecord[] | null; onNavigate: (path: string) => void }> = ({ zh, downloads, onNavigate }) => {
  const products = [
    { name: 'VisionStudio', detail: zh ? '可视化工程工作台' : 'Engineering workspace', path: '/downloads/visionstudio' },
    { name: 'VisionRuntime', detail: zh ? '生产执行引擎' : 'Production runtime', path: '/downloads/visionruntime' },
    { name: 'VisionEdge', detail: zh ? '边缘现场智能网关' : 'On-site intelligence', path: '/downloads/visionedge' },
  ];
  return (
    <div className="space-y-6">
      <Panel icon={<Download className="h-4 w-4 text-zinc-400" />} title={zh ? '获取安装包' : 'Get installers'}
             description={zh ? '最新版本和各平台安装包在下载中心。' : 'The latest versions for every platform are in the download center.'}>
        <div className="grid gap-3 sm:grid-cols-3">
          {products.map(product => (
            <button key={product.name} type="button" onClick={() => onNavigate(product.path)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left hover:border-zinc-700 cursor-pointer">
              <span className="min-w-0">
                <span className="block font-medium text-white">{product.name}</span>
                <span className="block text-xs text-zinc-500">{product.detail}</span>
              </span>
              <Download className="h-4 w-4 shrink-0 text-emerald-300" />
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={<Package className="h-4 w-4 text-zinc-400" />} title={zh ? '我的下载记录' : 'My downloads'}
             description={zh ? '登录状态下从下载中心下载的安装包会记录在这里。' : 'Installers downloaded while signed in are listed here.'}>
        {downloads === null ? <p className={ui.muted}>{zh ? '正在读取…' : 'Loading…'}</p>
          : downloads.length === 0 ? <p className="text-sm text-zinc-400">{zh ? '还没有下载记录。' : 'No downloads yet.'}</p>
          : (
            <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
              {downloads.map(record => (
                <li key={record.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-zinc-100">{record.assetName}</p>
                    <p className="text-xs text-zinc-500">{record.product} · {record.version}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{formatDate(record.downloadedAt, zh)}</span>
                </li>
              ))}
            </ul>
          )}
      </Panel>

      <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />} title={zh ? '商用授权与硬件加密狗' : 'Commercial license & dongles'}
             description={zh ? '在产线工控机上 24 小时连续运行，需要正式授权码或硬件加密狗。'
                             : 'Running 24/7 on production machines needs a commercial license or hardware dongle.'}
             actions={<button type="button" onClick={() => onNavigate('/contact')} className={ui.primary}>{zh ? '联系我们申请' : 'Contact us'}<ArrowRight className="h-4 w-4" /></button>} />
    </div>
  );
};
