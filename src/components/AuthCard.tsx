import React, { useEffect, useState } from 'react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GitHubSignInButton } from './GitHubSignInButton';
import { EmailAuthForm } from './EmailAuthForm';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Mail, Globe } from 'lucide-react';
import { ALL_AUTH_METHODS, loadAuthConfig, type AuthMethod } from '../lib/api';
import { authCardText } from '../i18n/text/AuthCard';

interface AuthCardProps {
  onSuccess?: () => void;
  className?: string;
}

// Sign-in methods of this edition: email in China, Google and GitHub abroad.
const loadMethods = (): Promise<AuthMethod[]> => loadAuthConfig().then(config => config?.methods ?? ALL_AUTH_METHODS);

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, className = '' }) => {
  const { locale } = useLanguage();
  const [methods, setMethods] = useState<AuthMethod[] | null>(null);
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth');
  useEffect(() => { void loadMethods().then(setMethods); }, []);

  if (!methods) {
    return (
      <div className={`w-full max-w-md mx-auto py-8 flex justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }
  const email = methods.includes('email');
  const google = methods.includes('google');
  const github = methods.includes('github');
  const oauth = google || github;
  // Only one kind of method: no tabs.
  const shown = email && !oauth ? 'email' : oauth && !email ? 'oauth' : tab;

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
      {/* Top Tab Switcher */}
      {email && oauth && (
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setTab('oauth')}
          className={`flex-1 pb-2 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            tab === 'oauth'
              ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{authCardText(locale).fastOauthLogin}</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('email')}
          className={`flex-1 pb-2 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            tab === 'email'
              ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{authCardText(locale).emailSignIn}</span>
        </button>
      </div>
      )}

      {/* Tab 1: OAuth Providers (Google & GitHub) */}
      {shown === 'oauth' && (
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-3 w-full">
            {google && <GoogleSignInButton onSuccess={onSuccess} />}

            {google && github && (
              <div className="w-full max-w-[280px] flex items-center gap-2 text-zinc-400 dark:text-zinc-600 my-1">
                <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                <span className="text-[10px] uppercase">{authCardText(locale).or}</span>
                <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
              </div>
            )}

            {github && <GitHubSignInButton onSuccess={onSuccess} />}
          </div>

          {email && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setTab('email')}
              className="text-xs text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{authCardText(locale).noOauthAccount}</span>
            </button>
          </div>
          )}
        </div>
      )}

      {/* Tab 2: Email Password & Verification Code Form */}
      {shown === 'email' && (
        <div className="py-2">
          <EmailAuthForm onSuccess={onSuccess} />
        </div>
      )}

      {/* Privacy Guarantee Footer */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{authCardText(locale).endToEnd}</span>
        </div>
      </div>
    </div>
  );
};
