import { bilingual } from '../bilingual';

export const googleSignInButtonText = bilingual({
  en: {
    authenticationVerificationFailed: 'Authentication verification failed',
    connecting: 'Connecting...',
    continueWithDemo: 'Continue with Demo Google Account',
    noteValidGoogle: 'Note: Valid Google Client ID not detected. Demo login active.',
  },
  zh: {
    authenticationVerificationFailed: '登录验证失败，请重试',
    connecting: '正在连接...',
    continueWithDemo: '使用本地模拟 Google 账号登录',
    noteValidGoogle: '提示：未检测到有效 Google Client ID，已启用本地模拟测试登录。',
  },
});
