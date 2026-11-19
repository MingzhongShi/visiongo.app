import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { KeyRound } from 'lucide-react';
import { passwordProblem, passwordProblemText } from '../../../shared/passwordPolicy';

import { Alert, Panel, ui } from './ui';
import { changePasswordPanelText } from '../../i18n/text/ChangePasswordPanel';

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
    if (next !== repeat) { setError(changePasswordPanelText(zh).theNewPasswords); return; }
    setBusy(true);
    try {
      const { ok, data } = await api('/api/account/password', { current_password: current, new_password: next });
      if (!ok) { setError(data.error || (changePasswordPanelText(zh).couldNotChange)); return; }
      setCurrent(''); setNext(''); setRepeat('');
      setHasPassword(true);
      setDone(changePasswordPanelText(zh).passwordChangedOther);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel as="form" onSubmit={submit} icon={<KeyRound className="h-4 w-4 text-zinc-400" />}
           title={hasPassword ? (changePasswordPanelText(zh).changePassword) : (changePasswordPanelText(zh).setAPassword)}
           description={hasPassword ? (changePasswordPanelText(zh).otherBrowsersMust)
                                    : (changePasswordPanelText(zh).thenYouCan)}>
      <div className="grid gap-2 sm:grid-cols-3">
      {hasPassword && (
        <input type="password" autoComplete="current-password" required value={current} onChange={event => setCurrent(event.target.value)}
               aria-label={changePasswordPanelText(zh).currentPassword} placeholder={changePasswordPanelText(zh).currentPassword} className={input} />
      )}
      <input type="password" autoComplete="new-password" required value={next} onChange={event => setNext(event.target.value)}
             aria-label={changePasswordPanelText(zh).newPassword} placeholder={changePasswordPanelText(zh).newPasswordHint} className={input} />
      <input type="password" autoComplete="new-password" required value={repeat} onChange={event => setRepeat(event.target.value)}
             aria-label={changePasswordPanelText(zh).repeatTheNew} placeholder={changePasswordPanelText(zh).repeatTheNew} className={input} />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {done && <Alert tone="success">{done}</Alert>}
      <button type="submit" disabled={busy} className={ui.primary}>
        {changePasswordPanelText(zh).savePassword}
      </button>
    </Panel>
  );
};
