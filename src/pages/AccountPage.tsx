import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Coins,
  Download,
  LayoutDashboard,
  LogOut,
  Mail,
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
import { accountPageText } from '../i18n/text/AccountPage';

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
  | 'admin-accounts' | 'admin-organizations' | 'admin-releases' | 'admin-inquiries';

interface NavItem { id: SectionId; label: string; hint: string; icon: React.ElementType }
interface NavGroup { label: string; items: NavItem[] }

const SECTIONS: SectionId[] = ['overview', 'security', 'devices', 'organization', 'credits', 'downloads',
  'admin-accounts', 'admin-organizations', 'admin-releases', 'admin-inquiries'];
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
    ? <img src={user.avatarUrl} alt="" className={`${size} shrink-0 rounded-2xl border border-zinc-200 dark:border-zinc-700 object-cover`} />
    : <div className={`${size} flex shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 font-semibold text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-emerald-300`}>
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 pb-24 pt-24 font-sans">
      <SeoHead
        noindex
        title={accountPageText(zh).myAccountVisiongo}
        description={accountPageText(zh).manageYourVisiongo}
        canonicalPath="/my"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {authNotice && !user && (
          <div className="mx-auto mb-6 max-w-xl">
            <Alert tone="warning">{accountPageText(zh).thirdPartySign}</Alert>
          </div>
        )}
        {authLoading ? (
          <div role="status" className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500" />
            <span className="sr-only">{accountPageText(zh).loading}</span>
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
  <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-2xl sm:p-12">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-emerald-400">
      <User className="h-7 w-7" />
    </div>
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-zinc-950 dark:text-white">{accountPageText(zh).signInTo}</h1>
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {accountPageText(zh).oneAccountFor}
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
    api('/api/account/desktop-sessions')
      .then(({ ok, status, data }) => { if (!ok) throw new Error(String(status)); setSessions(data.sessions || []); setSessionsError(''); })
      .catch(() => { setSessions([]); setSessionsError(accountPageText(zh).couldNotLoad); });
  }, [zh]);
  useEffect(loadSessions, [loadSessions]);
  const revoke = async (body: { family_id?: string; all?: boolean }) => {
    setSessionsBusy(true);
    setSessionsError('');
    try {
      const res = await api('/api/account/desktop-sessions/revoke', body);
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSessionsError(accountPageText(zh).signingOutFailed);
    } finally {
      setSessionsBusy(false);
      loadSessions();
    }
  };

  const [downloads, setDownloads] = useState<UserDownloadRecord[] | null>(null);
  useEffect(() => {
    api('/api/user/downloads')
      .then(({ ok, data }) => setDownloads((ok && data.downloads) || []))
      .catch(() => setDownloads([]));
  }, []);

  const groups: NavGroup[] = useMemo(() => {
    const list: NavGroup[] = [
      { label: accountPageText(zh).you, items: [
        { id: 'overview', label: accountPageText(zh).overview, hint: accountPageText(zh).everythingAtA, icon: LayoutDashboard },
        { id: 'security', label: accountPageText(zh).signInSecurity, hint: accountPageText(zh).profilePasswordSign, icon: UserCog },
        { id: 'devices', label: accountPageText(zh).signedInComputers, hint: accountPageText(zh).visionstudioSignIns, icon: Monitor },
      ] },
      { label: accountPageText(zh).organization, items: [
        { id: 'organization', label: accountPageText(zh).organizationMembers, hint: accountPageText(zh).switchAddMembers, icon: Users },
        { id: 'credits', label: accountPageText(zh).creditsUsage, hint: accountPageText(zh).balanceUsageLedger, icon: Coins },
      ] },
      { label: accountPageText(zh).software, items: [
        { id: 'downloads', label: accountPageText(zh).downloadsLicensing, hint: accountPageText(zh).installersHistoryLicensing, icon: Download },
      ] },
    ];
    if (platformAdmin) list.push({ label: accountPageText(zh).platformAdmin, items: [
      { id: 'admin-accounts', label: accountPageText(zh).accounts, hint: accountPageText(zh).createResetCodes, icon: UserCog },
      { id: 'admin-organizations', label: accountPageText(zh).adminOrganizations, hint: accountPageText(zh).createSuspend, icon: Building2 },
      { id: 'admin-releases', label: accountPageText(zh).releases, hint: accountPageText(zh).desktopUpdateRecords, icon: PackageCheck },
      { id: 'admin-inquiries', label: accountPageText(zh).inquiries, hint: accountPageText(zh).customerInquiriesDesc, icon: Mail },
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
            <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">{name}</div>
            <div className="truncate text-xs text-zinc-500">{user.email}</div>
          </div>
        </div>
        <nav data-account-nav aria-label={accountPageText(zh).accountNavigation}
             className="relative -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:mb-0 lg:block lg:space-y-5 lg:overflow-visible lg:border-0 lg:px-0 lg:pb-0">
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
                           active ? 'bg-emerald-500/10 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/30 dark:text-emerald-300 dark:ring-emerald-500/30'
                                  : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'}`}>
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
                className="mt-6 hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer lg:flex">
          <LogOut className="h-4 w-4" />{accountPageText(zh).signOut}
        </button>
      </aside>

      <section aria-labelledby="account-section-title" className="min-w-0 space-y-6">
        <header className="space-y-1">
          <h1 id="account-section-title" className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">{current.label}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{current.hint}</p>
        </header>

        {current.id === 'overview' && (
          <Overview zh={zh} user={user} name={name} org={org} orgs={orgs} sessions={sessions} downloads={downloads} go={go} />
        )}

        {current.id === 'security' && (
          <>
            <Panel icon={<User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />} title={accountPageText(zh).profile}
                   actions={<button type="button" onClick={() => void logout()} className={ui.secondary}><LogOut className="h-4 w-4" />{accountPageText(zh).signOut}</button>}>
              <div className="flex items-center gap-4">
                <Avatar user={user} />
                <dl className="grid min-w-0 gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                  <dt className="text-zinc-500">{accountPageText(zh).name}</dt><dd className="truncate text-zinc-900 dark:text-zinc-100">{name}</dd>
                  <dt className="text-zinc-500">{accountPageText(zh).email}</dt><dd className="truncate font-mono text-zinc-900 dark:text-zinc-100">{user.email}</dd>
                  <dt className="text-zinc-500">{accountPageText(zh).memberSince}</dt><dd className="text-zinc-900 dark:text-zinc-100">{formatDate(user.createdAt, zh)}</dd>
                  <dt className="text-zinc-500">{accountPageText(zh).accountId}</dt><dd className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{user.id}</dd>
                </dl>
              </div>
            </Panel>
            <ChangePasswordPanel zh={zh} />
            <Panel icon={<Monitor className="h-4 w-4 text-zinc-400" />} title={accountPageText(zh).signedInComputers}
                   description={accountPageText(zh).computersAre(sessions?.length ?? 0)}
                   actions={<button type="button" onClick={() => go('devices')} className={ui.secondary}>{accountPageText(zh).manage}<ChevronRight className="h-4 w-4" /></button>} />
          </>
        )}

        {current.id === 'devices' && (
          <DesktopSessionsPanel zh={zh} sessions={sessions} error={sessionsError} busy={sessionsBusy} onRevoke={body => void revoke(body)} />
        )}

        {(current.id === 'organization' || current.id === 'credits') && (
          <>
            {orgs.error && <Alert tone="error">{orgs.error}</Alert>}
            <Panel icon={<Building2 className="h-4 w-4 text-zinc-400" />} title={accountPageText(zh).currentOrganization}
                   description={accountPageText(zh).everythingBelowApplies}>
              <OrganizationPicker zh={zh} orgs={orgs} selected={orgId} onSelect={selectOrg} />
            </Panel>
            {org && current.id === 'organization' && <OrganizationDetail key={org.id} zh={zh} org={org} platformAdmin={orgs.platformAdmin} />}
            {org && current.id === 'credits' && (orgs.creditsAvailable
              ? <CreditsPanel key={org.id} zh={zh} organization={org} cloudAdminUrl={orgs.cloudAdminUrl} />
              : <Alert>{accountPageText(zh).cloudServicesAre}</Alert>)}
          </>
        )}

        {current.id === 'downloads' && <Downloads zh={zh} downloads={downloads} onNavigate={onNavigate} />}

        {platformAdmin && current.id === 'admin-accounts' && <PlatformAdminPanel zh={zh} section="accounts" />}
        {platformAdmin && current.id === 'admin-organizations' && (
          <PlatformOrganizationsPanel zh={zh} myEmail={user.email} orgs={orgs} onManage={manageOrg} />
        )}
        {platformAdmin && current.id === 'admin-releases' && <PlatformAdminPanel zh={zh} section="releases" />}
        {platformAdmin && current.id === 'admin-inquiries' && <PlatformAdminPanel zh={zh} section="inquiries" />}

        <button type="button" onClick={() => void logout()} className={`${ui.secondary} w-full lg:hidden`}>
          <LogOut className="h-4 w-4" />{accountPageText(zh).signOut}
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
            className="surface-card group flex flex-col gap-3 p-5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 cursor-pointer">
      <span className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{title}</span>
        <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
      </span>
      <span className="truncate text-xl font-semibold text-zinc-950 dark:text-white">{value}</span>
      <span className="text-xs leading-relaxed text-zinc-500">{detail}</span>
    </button>
  );
  const mine = orgs.choices.filter(choice => choice.role !== null);
  return (
    <div className="space-y-6">
      <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold text-zinc-950 dark:text-white">{accountPageText(zh).hello(name)}</div>
          <div className="truncate font-mono text-sm text-zinc-600 dark:text-zinc-400">{user.email}</div>
          <div className="text-xs text-zinc-500">{accountPageText(zh).memberSinceShort} {formatDate(user.createdAt, zh)}</div>
        </div>
        <button type="button" onClick={() => go('security')} className={ui.secondary}>{accountPageText(zh).signInSecurity}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tile('organization', Users, accountPageText(zh).organizationMembers,
              org ? org.name : (orgs.loaded ? (accountPageText(zh).noOrganization) : '…'),
              org ? `${org.type === 'personal' ? (accountPageText(zh).personal) : (accountPageText(zh).enterprise)} · ${roleLabel(org.role, zh)}${mine.length > 1 ? (accountPageText(zh).organizationCountSuffix(mine.length)) : ''}`
                  : (accountPageText(zh).seeYourOrganizations))}
        {tile('credits', Coins, accountPageText(zh).creditsUsage,
              orgs.creditsAvailable ? (accountPageText(zh).viewBalance) : (accountPageText(zh).notAvailable),
              orgs.creditsAvailable ? (accountPageText(zh).balanceUsageAnd)
                                    : (accountPageText(zh).cloudServicesAreNot))}
        {tile('devices', Monitor, accountPageText(zh).signedInComputers,
              sessions === null ? '…' : (accountPageText(zh).text(sessions.length)),
              accountPageText(zh).computersSignedIn)}
        {tile('downloads', Download, accountPageText(zh).downloadsLicensing,
              downloads === null ? '…' : (accountPageText(zh).downloads(downloads.length)),
              accountPageText(zh).getInstallersSee)}
        {tile('security', ShieldCheck, accountPageText(zh).signInSecurity, accountPageText(zh).passwordProfile,
              accountPageText(zh).changePasswordSee)}
      </div>

      {orgs.platformAdmin && (
        <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />} title={accountPageText(zh).platformAdmin}
               description={accountPageText(zh).youAreA}>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => go('admin-accounts')} className={ui.secondary}>{accountPageText(zh).accounts}</button>
            <button type="button" onClick={() => go('admin-organizations')} className={ui.secondary}>
              {accountPageText(zh).manageOrganizationsCount(orgs.allOrganizations.length)}
            </button>
            <button type="button" onClick={() => go('admin-releases')} className={ui.secondary}>{accountPageText(zh).releases}</button>
            <button type="button" onClick={() => go('admin-inquiries')} className={ui.secondary}>{accountPageText(zh).inquiries}</button>
          </div>
        </Panel>
      )}
    </div>
  );
};

const Downloads: React.FC<{ zh: boolean; downloads: UserDownloadRecord[] | null; onNavigate: (path: string) => void }> = ({ zh, downloads, onNavigate }) => {
  const products = [
    { name: 'VisionStudio', detail: accountPageText(zh).engineeringWorkspace, path: '/downloads/visionstudio' },
    { name: 'VisionRuntime', detail: accountPageText(zh).productionRuntime, path: '/downloads/visionruntime' },
    { name: 'VisionEdge', detail: accountPageText(zh).onSiteIntelligence, path: '/downloads/visionedge' },
  ];
  return (
    <div className="space-y-6">
      <Panel icon={<Download className="h-4 w-4 text-zinc-400" />} title={accountPageText(zh).getInstallers}
             description={accountPageText(zh).theLatestVersions}>
        <div className="grid gap-3 sm:grid-cols-3">
          {products.map(product => (
            <button key={product.name} type="button" onClick={() => onNavigate(product.path)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 cursor-pointer">
              <span className="min-w-0">
                <span className="block font-medium text-zinc-950 dark:text-white">{product.name}</span>
                <span className="block text-xs text-zinc-500">{product.detail}</span>
              </span>
              <Download className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={<Package className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />} title={accountPageText(zh).myDownloads}
             description={accountPageText(zh).installersDownloadedWhile}>
        {downloads === null ? <p className={ui.muted}>{accountPageText(zh).loadingList}</p>
          : downloads.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{accountPageText(zh).noDownloadsYet}</p>
          : (
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {downloads.map(record => (
                <li key={record.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-zinc-900 dark:text-zinc-100">{record.assetName}</p>
                    <p className="text-xs text-zinc-500">{record.product} · {record.version}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(record.downloadedAt, zh)}</span>
                </li>
              ))}
            </ul>
          )}
      </Panel>

      <Panel icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />} title={accountPageText(zh).commercialLicenseDongles}
             description={accountPageText(zh).productionLicenseNeeded}
             actions={<button type="button" onClick={() => onNavigate('/contact')} className={ui.primary}>{accountPageText(zh).contactUs}<ArrowRight className="h-4 w-4" /></button>} />
    </div>
  );
};
