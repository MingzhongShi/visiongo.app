import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  /** Platform-wide role; super_admin sees the platform administration tab. */
  role?: 'super_admin' | 'org_admin' | 'member';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  loginWithGitHub: () => Promise<boolean>;
  sendEmailCode: (email: string, purpose?: 'register' | 'reset') => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (email: string, code: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  registerWithEmail: (email: string, code: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const { ok, data } = await api<{ user?: AuthUser | null }>('/api/auth/me');
      setUser(ok ? data.user || null : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  /** Posts a sign-in form; a returned user signs this page in. */
  const submit = async (path: string, body: unknown, failed: string, network: string,
                        expectsUser: string | null): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const { ok, data } = await api<{ user?: AuthUser; message?: string; error?: string }>(path, body);
      if (!ok) return { success: false, error: data.error || failed };
      if (expectsUser === null) return { success: true, message: data.message };
      if (!data.user) return { success: false, error: expectsUser };
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: network };
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      const { ok, data } = await api<{ user?: AuthUser }>('/api/auth/google', { credential });
      if (!ok || !data.user) return false;
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('[AuthContext] Google Login error:', err);
      return false;
    }
  };

  const loginWithGitHub = async (): Promise<boolean> => {
    const returnUrl = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/api/auth/github?returnUrl=${encodeURIComponent(returnUrl)}`);
    return false;
  };

  const sendEmailCode = (email: string, purpose: 'register' | 'reset' = 'register') =>
    submit('/api/auth/email/send-code', { email, purpose }, '发送验证码失败', '网络连接失败，请检查网络设置', null);

  const registerWithEmail = (email: string, code: string, password: string, displayName?: string) =>
    submit('/api/auth/email/register', { email, code, password, displayName }, '注册失败', '网络连接失败，请稍后重试', '注册未返回有效用户信息');

  const loginWithEmail = (email: string, password: string) =>
    submit('/api/auth/email/login', { email, password }, '登录失败', '网络连接失败，请稍后重试', '登录未返回有效用户信息');

  const resetPassword = (email: string, code: string, password: string) =>
    submit('/api/auth/email/reset-password', { email, code, password }, '重置密码失败', '网络连接失败，请稍后重试', null);

  const logout = async (): Promise<void> => {
    try {
      await api('/api/auth/logout', {});
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithGitHub,
        sendEmailCode,
        registerWithEmail,
        loginWithEmail,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
