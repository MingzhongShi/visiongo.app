import React, { useCallback, useEffect, useState } from 'react';
import { Coins, ExternalLink, ReceiptText, BarChart3 } from 'lucide-react';
import { Alert, Panel, api, ui } from './ui';
import type { OrgChoice } from './useOrganizations';

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
    ? (zh ? '云端服务暂不可用，请稍后重试' : 'The cloud service is unavailable; please try again later')
    : data.error_description || data.error || (zh ? '读取失败' : 'Could not load'));

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
    recharge: zh ? '充值' : 'Recharge', consumption: zh ? '消费' : 'Usage', adjustment: zh ? '调整' : 'Adjustment',
  } as Record<string, string>)[value] || value;
  const empty = organization.admin && account && organization.type === 'enterprise' && (!account.opened || account.balance_micros <= 0);
  const stat = (label: string, value: string, tone = 'text-white') => (
    <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 break-words font-mono text-lg font-semibold sm:text-xl ${tone}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      {organization.admin && (
        <Panel icon={<Coins className="h-4 w-4 text-zinc-400" />} title={zh ? '额度账户' : 'Credit account'}
               description={zh ? '组织成员使用 VisionCloud AI 功能时从这里扣费。' : 'Members’ use of VisionCloud AI functions is charged here.'}>
          {!account ? <p className={ui.muted}>{zh ? '正在读取…' : 'Loading…'}</p> : account.opened ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stat(zh ? '余额 (Credits)' : 'Balance (Credits)', credits(account.balance_micros), account.balance_micros <= 0 ? 'text-amber-300' : 'text-emerald-300')}
                {stat(zh ? '累计消耗' : 'Used in total', credits(account.used_micros))}
                {stat(zh ? '输入 / 输出费率' : 'Input / output price', `${credits(account.input_price_micros_per_1m)} / ${credits(account.output_price_micros_per_1m)}`)}
                {stat(zh ? '状态' : 'Status', account.status === 'suspended' ? (zh ? '已停用' : 'Suspended') : (zh ? '正常' : 'Active'),
                      account.status === 'suspended' ? 'text-red-300' : 'text-white')}
              </div>
              <p className={ui.muted}>{zh ? '费率单位：Credits / 100 万 Token' : 'Prices in Credits per 1M tokens'}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {organization.type === 'personal'
                ? (zh ? '该组织尚未使用过 VisionCloud，首次使用时自动开立额度账户，并赠送 100 Credits 体验额度。'
                      : 'This organization has not used VisionCloud yet; its credit account opens on first use with 100 trial Credits.')
                : (zh ? '该企业组织尚未在 VisionCloud 开户。' : 'This enterprise organization has no VisionCloud account yet.')}
            </p>
          )}
          {empty && (
            <Alert tone="warning">
              <p>{zh ? '这个企业组织还没有额度，成员使用 AI 功能时会提示“组织额度不足”。'
                     : 'This enterprise organization has no credits yet; AI functions answer "insufficient credits".'}</p>
              <p className="text-amber-300/80">
                {cloudAdminUrl
                  ? <>{zh ? '平台管理员请到 ' : 'Platform administrators: open the account and recharge at '}
                      <a href={cloudAdminUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">{zh ? 'VisionCloud 管理后台' : 'VisionCloud admin'}<ExternalLink className="h-3 w-3" /></a>
                      {zh ? ' 为它开户并充值（首次充值勾选“开户”），组织 ID：' : ' (tick "open account" on the first recharge); organization ID: '}
                      <span className="font-mono">{organization.id}</span></>
                  : (zh ? '请联系 VISIONGO 开通额度。' : 'Contact VISIONGO to add credits.')}
              </p>
            </Alert>
          )}
          {account?.notices?.length ? (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">{zh ? '平台公告' : 'Notices'}</div>
              {account.notices.map(notice => (
                <div key={notice.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm">
                  <div className="flex justify-between gap-2 text-zinc-200"><span>{notice.title}</span>
                    <span className="shrink-0 font-mono text-xs text-zinc-500">{new Date(notice.created_at_unix_ms).toLocaleDateString()}</span></div>
                  <div className="mt-1 whitespace-pre-wrap text-zinc-400">{notice.content}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      )}

      <Panel icon={<BarChart3 className="h-4 w-4 text-zinc-400" />}
             title={organization.admin ? (zh ? '用量' : 'Usage') : (zh ? '我的用量' : 'My usage')}
             description={organization.admin ? (zh ? '按成员和功能统计。' : 'By member and by feature.')
                                              : (zh ? '你在本组织的 AI 用量。组织余额只有管理员能看到。' : 'Your AI usage in this organization. Only administrators see the balance.')}
             actions={
               <select value={days} onChange={event => setDays(Number(event.target.value))} className={ui.input} aria-label={zh ? '统计区间' : 'Period'}>
                 {[7, 30, 90, 365].map(value => <option key={value} value={value}>{zh ? `最近 ${value} 天` : `Last ${value} days`}</option>)}
               </select>}>
        {!usage ? <p className={ui.muted}>{error ? '' : (zh ? '正在读取…' : 'Loading…')}</p> : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {stat(zh ? '请求次数' : 'Requests', String(usage.totals.requests))}
              {stat(zh ? '消耗 Credits' : 'Credits used', credits(usage.totals.cost_micros, 4))}
            </div>
            {organization.admin && usage.by_user.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{zh ? '成员' : 'Member'}</th><th className={ui.cell}>{zh ? '请求' : 'Requests'}</th>
                    <th className={ui.cell}>Token</th><th className={ui.cell}>Credits</th></tr></thead>
                  <tbody>{usage.by_user.map(row => (
                    <tr key={row.user_id} className="border-t border-zinc-800 text-zinc-300">
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
                  <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{zh ? '功能' : 'Feature'}</th><th className={ui.cell}>{zh ? '请求' : 'Requests'}</th>
                    <th className={ui.cell}>Credits</th></tr></thead>
                  <tbody>{usage.by_endpoint.map(row => (
                    <tr key={row.endpoint} className="border-t border-zinc-800 text-zinc-300">
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
        <Panel icon={<ReceiptText className="h-4 w-4 text-zinc-400" />} title={zh ? '充值与消费流水' : 'Ledger'}
               actions={
                 <select value={type} onChange={event => setType(event.target.value)} className={ui.input} aria-label={zh ? '流水类型' : 'Type'}>
                   <option value="">{zh ? '全部类型' : 'All types'}</option>
                   {['recharge', 'consumption', 'adjustment'].map(value => <option key={value} value={value}>{typeLabel(value)}</option>)}
                 </select>}>
          {transactions.length === 0 ? <p className={ui.muted}>{zh ? '暂无流水' : 'No entries'}</p> : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full min-w-[560px]">
                <thead className="text-xs text-zinc-500"><tr><th className={ui.cell}>{zh ? '时间' : 'Time'}</th><th className={ui.cell}>{zh ? '类型' : 'Type'}</th>
                  <th className={ui.cell}>{zh ? '变动' : 'Amount'}</th><th className={ui.cell}>{zh ? '余额' : 'Balance'}</th><th className={ui.cell}>{zh ? '说明' : 'Description'}</th></tr></thead>
                <tbody>{transactions.map(item => (
                  <tr key={item.id} className="border-t border-zinc-800 text-zinc-300">
                    <td className={`${ui.cell} whitespace-nowrap font-mono text-xs`}>{new Date(item.created_at_unix_ms).toLocaleString(zh ? 'zh-CN' : 'en-US')}</td>
                    <td className={ui.cell}>{typeLabel(item.type)}</td>
                    <td className={`${ui.cell} font-mono ${item.amount_micros < 0 ? 'text-red-300' : 'text-emerald-300'}`}>{credits(item.amount_micros, 4)}</td>
                    <td className={`${ui.cell} font-mono`}>{credits(item.balance_after_micros, 4)}</td>
                    <td className={`${ui.cell} text-zinc-400`}>{item.description}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
          {cursor && <button type="button" onClick={() => void loadTransactions(cursor)} className={ui.secondary}>{zh ? '加载更多' : 'Load more'}</button>}
        </Panel>
      )}
    </div>
  );
};
