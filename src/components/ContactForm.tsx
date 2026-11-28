import { SiteLink } from './SiteLink';
import { api } from '../lib/api';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { contactFormText } from '../i18n/text/ContactForm';

export function ContactForm() {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const tx = contactFormText(zh);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    product: 'all',
    task: '',
    plc: '',
    os: '',
    message: '',
    websiteUrl: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const topic = new URLSearchParams(window.location.search).get('topic')?.trim();
    if (!topic) return;
    setForm(previous => {
      if (previous.task) return previous;
      return { ...previous, task: topic };
    });
  }, []);

  const update = (field: keyof typeof form, value: string) => {
    submissionId.current = null;
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const buildPayloadMessage = () => {
    const contextLines: string[] = [];
    if (form.task) {
      const matched = tx.taskOptions.find(opt => opt.value === form.task);
      contextLines.push(`Task: ${matched ? matched.label : form.task}`);
    }
    if (form.plc) contextLines.push(`PLC / Protocol: ${form.plc}`);
    if (form.os) contextLines.push(`Station OS: ${form.os}`);
    const body = form.message.trim();
    if (contextLines.length === 0) return form.message;
    const prefix = `[Engineering Context]\n${contextLines.join('\n')}\n\n`;
    return `${prefix}${body}`.slice(0, 5000);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus('submitting');
    setError('');
    submissionId.current ??= crypto.randomUUID();
    try {
      const { ok, data } = await api(
        '/api/contact',
        {
          name: form.name,
          email: form.email,
          company: form.company,
          product: form.product,
          message: buildPayloadMessage(),
          websiteUrl: form.websiteUrl,
          locale,
          source: `${window.location.pathname}${window.location.search}`,
          submissionId: submissionId.current,
        },
        { signal: AbortSignal.timeout(20000) }
      );
      if (!ok || !data.success || typeof data.referenceId !== 'string') throw new Error(data.error || tx.submissionFailedPlease);
      setReference(data.referenceId);
      setStatus('success');
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : tx.connectionTimedOut);
      setStatus('error');
    } finally { submitting.current = false; }
  };

  if (status === 'success') return (
    <div role="status" className="space-y-4 py-8 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">{tx.inquirySaved}</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{tx.ourEngineeringTeam}</p>
      <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">{tx.reference}{reference}</p>
      <button className="btn-secondary" onClick={() => { setStatus('idle'); submissionId.current = null; setForm(previous => ({ ...previous, message: '' })); }}>{tx.sendAnotherInquiry}</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={status === 'submitting'} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="form-label">{tx.name}<input className="form-input" autoComplete="name" value={form.name} onChange={e => update('name', e.target.value)} required maxLength={100} /></label>
          <label className="form-label">{tx.email}<input className="form-input" type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} required maxLength={254} /></label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="form-label">{tx.company}<input className="form-input" autoComplete="organization" value={form.company} onChange={e => update('company', e.target.value)} maxLength={200} /></label>
          <label className="form-label">{tx.productInterest}<select className="form-input" value={form.product} onChange={e => update('product', e.target.value)}>
            <option value="all">VisionStudio + VisionRuntime</option>
            <option value="visionstudio">VisionStudio</option>
            <option value="visionruntime">VisionRuntime</option>
            <option value="visionedge">VisionEdge</option>
            <option value="visioncloud">VisionCloud</option>
          </select></label>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <p className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">{tx.optionalDetailsTitle}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="form-label text-xs">{tx.taskLabel}
              <select className="form-input text-xs" value={form.task} onChange={e => update('task', e.target.value)}>
                <option value="">{tx.taskPlaceholder}</option>
                {tx.taskOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                {form.task && !tx.taskOptions.some(opt => opt.value === form.task) && (
                  <option value={form.task}>{form.task}</option>
                )}
              </select>
            </label>
            <label className="form-label text-xs">{tx.plcLabel}
              <select className="form-input text-xs" value={form.plc} onChange={e => update('plc', e.target.value)}>
                <option value="">{tx.plcPlaceholder}</option>
                {tx.plcOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label className="form-label text-xs">{tx.osLabel}
              <select className="form-input text-xs" value={form.os} onChange={e => update('os', e.target.value)}>
                <option value="">{tx.osPlaceholder}</option>
                {tx.osOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
          </div>
        </div>

        <label className="form-label">{tx.projectDescription}<textarea className="form-input min-h-32" value={form.message} onChange={e => update('message', e.target.value)} required maxLength={5000} placeholder={tx.describeTheInspection} /></label>
        <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.websiteUrl} onChange={e => update('websiteUrl', e.target.value)} /></label></div>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{tx.weUseThese} <SiteLink href="/privacy" className="text-emerald-700 underline dark:text-emerald-400">{tx.privacyPolicy}</SiteLink>{tx.fullStop}</p>
        <button type="submit" className="btn-primary w-full"><span>{status === 'submitting' ? tx.submitting : tx.contactEngineering}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </fieldset>
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-300"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" /><div>{error}<br /><SiteLink className="underline" href="mailto:contact@visiongo.app">contact@visiongo.app</SiteLink></div></div>}
    </form>
  );
}
