import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLocale } from '../types/i18n';
import { languageSwitcherText } from '../i18n/text/LanguageSwitcher';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { locale, setLocale, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false); }} className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        aria-expanded={isOpen} aria-controls="language-options"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-colors cursor-pointer"
        title="Switch Language / 切换语言"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{variant === 'compact' ? (languageSwitcherText(locale).shortName) : currentLang.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div id="language-options" className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-zinc-200 shadow-xl dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-2xl p-1.5 z-50 backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 py-1 mb-1 border-b border-zinc-200 dark:border-zinc-800/80">
            Language / 语言
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
