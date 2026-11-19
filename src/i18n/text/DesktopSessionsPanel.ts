import { bilingual } from '../bilingual';

export const desktopSessionsPanelText = bilingual({
  en: {
    computersSignedIn: 'Computers signed in to VisionStudio',
    signOutA: 'Sign out a computer you lost or no longer use; VisionStudio on it must sign in again.',
    signOutVisionstudio: 'Sign out VisionStudio on every computer?',
    signOutEverywhere: 'Sign out everywhere',
    loading: 'Loading…',
    noComputerIs: 'No computer is signed in. Computers appear here after signing in to VisionStudio with this account.',
    unnamedComputer: 'Unnamed computer',
    lastUsed: 'last used',
    signedIn: 'signed in',
    signOut: 'Sign out',
  },
  zh: {
    computersSignedIn: '已登录 VisionStudio 的电脑',
    signOutA: '电脑丢失或不再使用时，在这里让它退出登录。退出后那台电脑上的 VisionStudio 需要重新登录。',
    signOutVisionstudio: '让所有电脑上的 VisionStudio 都退出登录？',
    signOutEverywhere: '全部退出',
    loading: '正在读取…',
    noComputerIs: '目前没有电脑登录。在 VisionStudio 里用本账号登录后，会出现在这里。',
    unnamedComputer: '未命名的电脑',
    lastUsed: '最近使用',
    signedIn: '登录于',
    signOut: '退出登录',
  },
});
