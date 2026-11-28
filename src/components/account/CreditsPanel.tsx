import React, { useCallback, useEffect, useState } from 'react';
import { Coins, ExternalLink, ReceiptText, BarChart3 } from 'lucide-react';
import { Alert, Panel, api, ui } from './ui';
import type { OrgChoice } from './useOrganizations';
import { creditsPanelText } from '../../i18n/text/CreditsPanel';

// Organization credits, ledger and usage kept by VisionCloud (read through /api/orgs/{id}/credits*,
// SDK credits contract). Administrators see the account; members see their own usage only.

interface Notice { id: number; title: string; content: string; created_at_unix_ms: number }
interface Account {
  opened: boolean;
  status?: 'active' | 'suspended';
  balance_micros: number;
  used_micros: number;
  input_price_micros_per_1m: number;
  output_price_micros_per_1m: number;
  notices: Notice[];
}
interface Transaction {
  id: number;
  type: 'recharge' | 'consumption' | 'adjustment';
  amount_micros: number;
  balance_after_micros: number;
  description: string;
  operator: string;
  created_at_unix_ms: number;
}
interface UsageRow { requests: number; prompt_tokens?: number; completion_tokens?: number; cost_micros: number }
interface Usage {
  totals: UsageRow;
  by_user: (UsageRow & { user_id: string })[];
  by_endpoint: (UsageRow & { endpoint: string })[];
  users?: Record<string, { name: string; email: string }>;
}

const DAY = 86_400_000;

const credits = (micros: number, digits = 2) => (micros / 1_000_000).toFixed(digits);
const endpointName = (endpoint: string, zh: boolean) => {
  const names: Record<string, [string, string]> = {
    'planning/workflow-changes': ['方案修改规划', 'Workflow changes'],
    'knowledge/search': ['专家问答', 'Expert answers'],
    'planning/blueprints': ['模块选型', 'Blueprints'],
  };
  const key = Object.keys(names).find(name => endpoint.endsWith(name));
  return key ? names[key][zh ? 0 : 1] : endpoint;
};



/** Credits, usage and ledger of one organization (credits section). */
export const CreditsPanel: React.FC<{ zh: boolean; organization: OrgChoice; cloudAdminUrl?: string | null }> = ({ zh, organization, cloudAdminUrl }) => {
  const [days, setDays] = useState(30);
  const [account, setAccount] = useState<Account | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  const base = `/api/orgs/${encodeURIComponent(organization.id)}/credits`;
  const failure = (status: number, data: any) => (status === 502 || data.error === 'cloud_unavailable'
    ? (creditsPanelText(zh).theCloudService)
    : data.error_description || data.error || (creditsPanelText(zh).couldNotLoad));

  const loadTransactions = useCallback(async (after: string | null) => {
    const query = new URLSearchParams({ limit: '50' });
    if (type) query.set('type', type);
    if (after) query.set('cursor', after);
    const { ok, status, data } = await api(`${base}/transactions?${query}`);
    if (!ok) { setError(failure(status, data)); return; }
    setTransactions(previous => (after ? [...previous, ...data.items] : data.items));
    setCursor(data.next_cursor ?? null);
  }, [base, type]);

  useEffect(() => {
    setError('');
    setUsage(null);
    const to = Date.now();
    void api(`${base}/usage?from=${to - days * DAY}&to=${to}`).then(({ ok, status, data }) => {
      if (ok) setUsage(data); else setError(failure(status, data));
    });
  }, [base, days]);

  useEffect(() => {
    setAccount(null);
    setTransactions([]);
    if (!organization.admin) return;
    void api(base).then(({ ok, status, data }) => { if (ok) setAccount(data); else setError(failure(status, data)); });
  }, [base, organization.admin]);

  useEffect(() => { if (organization.admin) void loadTransactions(null); }, [organization.admin, loadTransactions]);

  const users = usage?.users || {};
  const typeLabel = (value: string) => ({
    recharge: creditsPanelText(zh).recharge, consumption: creditsPanelText(zh).consumption, adjustment: creditsPanelText(zh).adjustment,
  } as Record<string, string>)[value] || value;
  const empty = organization.admin && account && organization.type === 'enterprise' && (!account.opened || account.balance_micros <= 0);
  const stat = (label: string, value: string, tone = 'text-zinc-950 dark:text-white') => (
    <div key={label} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 break-words font-mono text-lg font-semibold sm:text-xl ${tone}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      {organization.admin && (
        <Panel icon={<Coins className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />} title={creditsPanelText(zh).creditAccount}
               description={creditsPanelText(zh).membersUseOf}>
          {!account ? <p className={ui.muted}>{creditsPanelText(zh).loading}</p> : account.opened ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stat(creditsPanelText(zh).balanceCredits, credits(account.balance_micros), account.balance_micros <= 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}
                {stat(creditsPanelText(zh).usedInTotal, credits(account.used_micros))}
                {stat(creditsPanelText(zh).inputOutputPrice, `${credits(account.input_price_micros_per_1m)} / ${credits(account.output_price_micros_per_1m)}`)}
                {stat(creditsPanelText(zh).status, account.status === 'suspended' ? (creditsPanelText(zh).suspended) : (creditsPanelText(zh).active),
                      account.status === 'suspended' ? 'text-red-700 dark:text-red-300' : 'text-zinc-950 dark:text-white')}
              </div>
              <p className={ui.muted}>{creditsPanelText(zh).pricesInCredits}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {organization.type === 'personal'
                ? (creditsPanelText(zh).thisOrganizationHas)
                : (creditsPanelText(zh).thisEnterpriseOrganization)}
            </p>
          )}
          {empty && (
            <Alert tone="warning">
              <p>{creditsPanelText(zh).thisEnterpriseOrganizationHas}</p>
              <p className="text-amber-700 dark:text-amber-300/80">
                {cloudAdminUrl
                  ? <>{creditsPanelText(zh).platformAdministratorsOpen}
                      <a href={cloudAdminUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">{creditsPanelText(zh).visioncloudAdmin}<ExternalLink className="h-3 w-3" /></a>
                      {creditsPanelText(zh).tickOpenAccount}
                      <span className="font-mono">{organization.id}</span></>
                  : (creditsPanelText(zh).contactVisiongoTo)}
              </p>
            </Alert>
          )}
          {account?.notices?.length ? (
            <div className="space-y-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{creditsPanelText(zh).notices}</div>
              {account.notices.map(notice => (
                <div key={notice.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex justify-between gap-2 text-zinc-900 dark:text-zinc-200"><span>{notice.title}</span>
                    <span className="shrink-0 font-mono text-xs text-zinc-500">{new Date(notice.created_at_unix_ms).toLocaleDateString()}</span></div>
                  <div className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{notice.content}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      )}

      <Panel icon={<BarChart3 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
             title={organization.admin ? (creditsPanelText(zh).usageTab) : (creditsPanelText(zh).myUsage)}
             description={organization.admin ? (creditsPanelText(zh).byMemberAnd)
                                              : (creditsPanelText(zh).yourAiUsage)}
             actions={
               <select value={days} onChange={event => setDays(Number(event.target.value))} className={ui.input} aria-label={creditsPanelText(zh).period}>
                 {[7, 30, 90, 365].map(value => <option key={value} value={value}>{creditsPanelText(zh).lastDays(value)}</option>)}
               </select>}>
        {!usage ? <p className={ui.muted}>{error ? '' : (creditsPanelText(zh).loading)}</p> : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {stat(creditsPanelText(zh).requests, String(usage.totals.requests))}
              {stat(creditsPanelText(zh).creditsUsed, credits(usage.totals.cost_micros, 4))}
            </div>
            {organization.admin && usage.by_user.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{creditsPanelText(zh).member}</th><th className={ui.cell}>{creditsPanelText(zh).requestsColumn}</th>
                    <th className={ui.cell}>Token</th><th className={ui.cell}>Credits</th></tr></thead>
                  <tbody>{usage.by_user.map(row => (
                    <tr key={row.user_id} className="border-t border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                      <td className={ui.cell} title={users[row.user_id]?.email}>{users[row.user_id]?.name || row.user_id}</td>
                      <td className={`${ui.cell} font-mono`}>{row.requests}</td>
                      <td className={`${ui.cell} font-mono`}>{(row.prompt_tokens || 0) + (row.completion_tokens || 0)}</td>
                      <td className={`${ui.cell} font-mono`}>{credits(row.cost_micros, 4)}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
            {usage.by_endpoint.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px]">
                  <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{creditsPanelText(zh).feature}</th><th className={ui.cell}>{creditsPanelText(zh).requestsColumn}</th>
                    <th className={ui.cell}>Credits</th></tr></thead>
                  <tbody>{usage.by_endpoint.map(row => (
                    <tr key={row.endpoint} className="border-t border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                      <td className={ui.cell}>{endpointName(row.endpoint, zh)}</td>
                      <td className={`${ui.cell} font-mono`}>{row.requests}</td>
                      <td className={`${ui.cell} font-mono`}>{credits(row.cost_micros, 4)}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Panel>

      {organization.admin && (
        <Panel icon={<ReceiptText className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />} title={creditsPanelText(zh).ledger}
               actions={
                 <select value={type} onChange={event => setType(event.target.value)} className={ui.input} aria-label={creditsPanelText(zh).transactionType}>
                   <option value="">{creditsPanelText(zh).allTypes}</option>
                   {['recharge', 'consumption', 'adjustment'].map(value => <option key={value} value={value}>{typeLabel(value)}</option>)}
                 </select>}>
          {transactions.length === 0 ? <p className={ui.muted}>{creditsPanelText(zh).noEntries}</p> : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full min-w-[560px]">
                <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{creditsPanelText(zh).time}</th><th className={ui.cell}>{creditsPanelText(zh).typeColumn}</th>
                  <th className={ui.cell}>{creditsPanelText(zh).amount}</th><th className={ui.cell}>{creditsPanelText(zh).balance}</th><th className={ui.cell}>{creditsPanelText(zh).description}</th></tr></thead>
                <tbody>{transactions.map(item => (
                  <tr key={item.id} className="border-t border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                    <td className={`${ui.cell} whitespace-nowrap font-mono text-xs`}>{new Date(item.created_at_unix_ms).toLocaleString(zh ? 'zh-CN' : 'en-US')}</td>
                    <td className={ui.cell}>{typeLabel(item.type)}</td>
                    <td className={`${ui.cell} font-mono ${item.amount_micros < 0 ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{credits(item.amount_micros, 4)}</td>
                    <td className={`${ui.cell} font-mono`}>{credits(item.balance_after_micros, 4)}</td>
                    <td className={`${ui.cell} text-zinc-500 dark:text-zinc-400`}>{item.description}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
          {cursor && <button type="button" onClick={() => void loadTransactions(cursor)} className={ui.secondary}>{creditsPanelText(zh).loadMore}</button>}
        </Panel>
      )}
    </div>
  );
};
