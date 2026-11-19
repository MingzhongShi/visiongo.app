import { bilingual } from '../bilingual';

export const authCardText = bilingual({
  en: {
    fastOauthLogin: 'Fast OAuth Login',
    emailSignIn: 'Email Sign In / Register',
    or: 'OR',
    noOauthAccount: 'No OAuth account? Register with email',
    endToEnd: 'End-to-End Encrypted • Safe & Compliant',
  },
  zh: {
    fastOauthLogin: '第三方快捷登录',
    emailSignIn: '工作邮箱注册 / 登录',
    or: '或',
    noOauthAccount: '没有第三方账号？使用邮箱验证码注册',
    endToEnd: '端到端加密 • 零明文存储 • 安全合规',
  },
});
