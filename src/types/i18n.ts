export type SupportedLocale = 'en' | 'zh';

export interface LanguageInfo {
  code: SupportedLocale;
  label: string;
  nativeName: string;
  flagCode?: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'zh', label: 'Chinese', nativeName: '简体中文' },
];
