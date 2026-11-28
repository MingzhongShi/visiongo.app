import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ResolvedTheme = 'light' | 'dark';
export type ThemePreference = ResolvedTheme | 'system';

const STORAGE_KEY = 'visiongo_theme';

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage unavailable (private browsing); fall back to system preference.
  }
  return 'system';
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref;
}

function applyToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

interface ThemeContextValue {
  theme: ResolvedTheme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (next: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  preference: 'system',
  toggleTheme: () => undefined,
  setTheme: () => undefined,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [theme, setResolved] = useState<ResolvedTheme>(() => resolve(readPreference()));

  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    applyToDocument(next);
  }, [preference]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (preference === 'system') {
        const next = media.matches ? 'dark' : 'light';
        setResolved(next);
        applyToDocument(next);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ResolvedTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
