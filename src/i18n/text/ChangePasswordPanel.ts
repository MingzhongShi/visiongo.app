import { bilingual } from '../bilingual';

export const changePasswordPanelText = bilingual({
  en: {
    theNewPasswords: 'The new passwords do not match',
    couldNotChange: 'Could not change the password',
    passwordChangedOther: 'Password changed. Other browsers must sign in again; signed-in VisionStudio stays signed in.',
    changePassword: 'Change password',
    setAPassword: 'Set a password',
    otherBrowsersMust: 'Other browsers must sign in again; signed-in VisionStudio stays signed in.',
    thenYouCan: 'Then you can also sign in with email and password.',
    currentPassword: 'Current password',
    newPassword: 'New password',
    newPasswordHint: 'New password (8+ characters, letters and digits)',
    repeatTheNew: 'Repeat the new password',
    savePassword: 'Save password',
  },
  zh: {
    theNewPasswords: '两次输入的新密码不一致',
    couldNotChange: '修改失败',
    passwordChangedOther: '密码已修改。其他浏览器需要重新登录，已登录的 VisionStudio 不受影响。',
    changePassword: '修改密码',
    setAPassword: '设置密码',
    otherBrowsersMust: '修改后其他浏览器需要重新登录，已登录的 VisionStudio 不受影响。',
    thenYouCan: '设置后也可以用邮箱和密码登录。',
    currentPassword: '当前密码',
    newPassword: '新密码',
    newPasswordHint: '新密码（8 位以上，含字母和数字）',
    repeatTheNew: '再次输入新密码',
    savePassword: '保存新密码',
  },
});
