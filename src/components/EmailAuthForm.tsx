import React, { useState, useEffect } from 'react';
import { loadAuthConfig } from '../lib/api';
import { Mail, Lock, KeyRound, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { passwordProblem, passwordProblemText } from '../../shared/passwordPolicy';
import { emailAuthFormText } from '../i18n/text/EmailAuthForm';

interface EmailAuthFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ onSuccess, className = '' }) => {
  const { sendEmailCode, registerWithEmail, loginWithEmail, resetPassword } = useAuth();
  const { locale } = useLanguage();

  // Sign-up and password reset both start with an emailed code.
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const zh = locale === 'zh';
  const needsCode = mode !== 'login';
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // False while the site cannot send email: codes then come from a platform administrator.
  const [emailDelivery, setEmailDelivery] = useState(true);
  useEffect(() => {
    void loadAuthConfig().then(config => { if (config?.emailDelivery === false) setEmailDelivery(false); });
  }, []);

  // 60-second countdown for code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const switchMode = (next: 'login' | 'register' | 'reset') => {
    setMode(next);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSendCode = async () => {
    setError(null);
    setSuccessMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError(emailAuthFormText(locale).pleaseEnterA);
      return;
    }

    setSendingCode(true);
    const res = await sendEmailCode(email.trim(), mode === 'reset' ? 'reset' : 'register');
    setSendingCode(false);

    if (res.success) {
      setCountdown(60);
      setSuccessMsg(emailAuthFormText(locale).verificationCodeSent);

    } else {
      setError(res.error || (emailAuthFormText(locale).failedToSend));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(emailAuthFormText(locale).emailIsRequired);
      return;
    }

    if (!password) {
      setError(emailAuthFormText(locale).passwordIsRequired);
      return;
    }

    // The rule applies to new passwords; sign-in accepts whatever was set before.
    const problem = mode === 'login' ? null : passwordProblem(password);
    if (problem) {
      setError(passwordProblemText(problem, zh));
      return;
    }
    if (needsCode && !code.trim()) {
      setError(emailAuthFormText(zh).verificationCodeIs);
      return;
    }

    setLoading(true);

    if (mode === 'reset') {
      const res = await resetPassword(cleanEmail, code.trim(), password);
      setLoading(false);
      if (res.success) {
        setMode('login');
        setCode('');
        setPassword('');
        setSuccessMsg(emailAuthFormText(zh).passwordResetSign);
      } else {
        setError(res.error || (emailAuthFormText(zh).passwordResetFailed));
      }
      return;
    }

    if (mode === 'register') {

      const res = await registerWithEmail(cleanEmail, code.trim(), password, displayName.trim());
      setLoading(false);

      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || (emailAuthFormText(locale).registrationFailed));
      }
    } else {
      // Login mode
      const res = await loginWithEmail(cleanEmail, password);
      setLoading(false);

      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || (emailAuthFormText(locale).loginFailed));
      }
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto space-y-4 ${className}`}>
      {/* Mode Switch Tabs */}
      {mode === 'reset' ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{emailAuthFormText(zh).resetPassword}</span>
          <button type="button" onClick={() => switchMode('login')} className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer">
            {emailAuthFormText(zh).backToSign}
          </button>
        </div>
      ) : (
        <div className="flex rounded-xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 p-1 dark:border-zinc-800 text-xs">
          {(['login', 'register'] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => switchMode(item)}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === item
                  ? 'bg-white text-emerald-700 font-semibold border border-emerald-600/25 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:shadow-none'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {item === 'login' ? (emailAuthFormText(zh).emailSignIn) : (emailAuthFormText(zh).emailRegister)}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        {/* Email Field */}
        <div>
          <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
            {emailAuthFormText(locale).emailAddress}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@company.com"
              required
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 dark:bg-zinc-950/80 dark:border-zinc-800 rounded-xl text-xs dark:text-white dark:placeholder-zinc-600 focus:outline-none dark:focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Verification Code Field (sign-up and password reset) */}
        {needsCode && (
          <div>
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
              {emailAuthFormText(locale).verificationCode}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6 位数字"
                  required={needsCode}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 dark:bg-zinc-950/80 dark:border-zinc-800 rounded-xl text-xs font-mono dark:text-white dark:placeholder-zinc-600 focus:outline-none dark:focus:border-emerald-500 transition-colors tracking-widest"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0}
                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-100 border border-zinc-300 disabled:border-zinc-200 text-emerald-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:disabled:bg-zinc-900 dark:border-zinc-700 dark:disabled:border-zinc-800 text-[11px] dark:text-emerald-400 disabled:text-zinc-400 dark:disabled:text-zinc-500 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed min-w-[96px] text-center"
              >
                {sendingCode
                  ? (emailAuthFormText(locale).sending)
                  : countdown > 0
                  ? `${countdown}s`
                  : (emailAuthFormText(locale).sendCode)}
              </button>
            </div>
            {!emailDelivery && (
              <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                {emailAuthFormText(zh).thisSiteCannot}
              </p>
            )}
          </div>
        )}

        {/* Optional Display Name (Only for Register) */}
        {mode === 'register' && (
          <div>
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
              {emailAuthFormText(locale).displayNameOptional}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={emailAuthFormText(locale).visionEngineer}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 dark:bg-zinc-950/80 dark:border-zinc-800 rounded-xl text-xs dark:text-white dark:placeholder-zinc-600 focus:outline-none dark:focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Password Field */}
        <div>
          <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
            {mode === 'reset' ? (emailAuthFormText(zh).newPassword) : (emailAuthFormText(zh).password)}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-9 py-2 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 dark:bg-zinc-950/80 dark:border-zinc-800 rounded-xl text-xs dark:text-white dark:placeholder-zinc-600 focus:outline-none dark:focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {needsCode ? (
            <p className="text-[10px] text-zinc-500 mt-1">
              {emailAuthFormText(zh).charactersWithLetters}
            </p>
          ) : (
            <button type="button" onClick={() => switchMode('reset')}
                    className="text-[11px] text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 mt-1 cursor-pointer">
              {emailAuthFormText(zh).forgotPassword}
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-sm w-full"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === 'register'
                  ? (emailAuthFormText(zh).verifyCompleteRegistration)
                  : mode === 'reset'
                  ? (emailAuthFormText(zh).verifyResetPassword)
                  : (emailAuthFormText(zh).signInTo)}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
