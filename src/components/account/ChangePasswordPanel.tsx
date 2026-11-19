import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { KeyRound } from 'lucide-react';
import { passwordProblem, passwordProblemText } from '../../../shared/passwordPolicy';

import { Alert, Panel, ui } from './ui';

const input = `${ui.input} w-full`;

/** Change the password of the signed-in account, or set a first one (profile tab). */
export const ChangePasswordPanel: React.FC<{ zh: boolean }> = ({ zh }) => {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [emailSignIn, setEmailSignIn] = useState(true);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    api('/api/account/password')
      .then(({ ok, data }) => {
        if (!ok) return;
        setHasPassword(!!data.has_password);
        setEmailSignIn(data.email_sign_in !== false);
      })
      .catch(() => undefined);
  }, []);

  if (hasPassword === null || (!emailSignIn && !hasPassword)) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setDone('');
    const problem = passwordProblem(next);
    if (problem) { setError(passwordProblemText(problem, zh)); return; }
    if (next !== repeat) { setError(zh ? '两次输入的新密码不一致' : 'The new passwords do not match'); return; }
    setBusy(true);
    try {
      const { ok, data } = await api('/api/account/password', { current_password: current, new_password: next });
      if (!ok) { setError(data.error || (zh ? '修改失败' : 'Could not change the password')); return; }
      setCurrent(''); setNext(''); setRepeat('');
      setHasPassword(true);
      setDone(zh ? '密码已修改。其他浏览器需要重新登录，已登录的 VisionStudio 不受影响。'
                 : 'Password changed. Other browsers must sign in again; signed-in VisionStudio stays signed in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel as="form" onSubmit={submit} icon={<KeyRound className="h-4 w-4 text-zinc-400" />}
           title={hasPassword ? (zh ? '修改密码' : 'Change password') : (zh ? '设置密码' : 'Set a password')}
           description={hasPassword ? (zh ? '修改后其他浏览器需要重新登录，已登录的 VisionStudio 不受影响。' : 'Other browsers must sign in again; signed-in VisionStudio stays signed in.')
                                    : (zh ? '设置后也可以用邮箱和密码登录。' : 'Then you can also sign in with email and password.')}>
      <div className="grid gap-2 sm:grid-cols-3">
      {hasPassword && (
        <input type="password" autoComplete="current-password" required value={current} onChange={event => setCurrent(event.target.value)}
               aria-label={zh ? '当前密码' : 'Current password'} placeholder={zh ? '当前密码' : 'Current password'} className={input} />
      )}
      <input type="password" autoComplete="new-password" required value={next} onChange={event => setNext(event.target.value)}
             aria-label={zh ? '新密码' : 'New password'} placeholder={zh ? '新密码（8 位以上，含字母和数字）' : 'New password (8+ characters, letters and digits)'} className={input} />
      <input type="password" autoComplete="new-password" required value={repeat} onChange={event => setRepeat(event.target.value)}
             aria-label={zh ? '再次输入新密码' : 'Repeat the new password'} placeholder={zh ? '再次输入新密码' : 'Repeat the new password'} className={input} />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {done && <Alert tone="success">{done}</Alert>}
      <button type="submit" disabled={busy} className={ui.primary}>
        {zh ? '保存新密码' : 'Save password'}
      </button>
    </Panel>
  );
};
