import { bilingual } from '../bilingual';

export const releaseNotesModalText = bilingual({
  en: {
    releaseNotes: 'Release Notes',
    officialReleaseRepository: 'Official release repository',
    version: 'Version:',
    noReleaseNotes: 'No release notes provided for this build.',
    releasePackagesBinaries: 'Release Packages & Binaries',
    download: 'Download',
    checkPackageSystem: 'Check package system and architecture',
    close: 'Close',
  },
  zh: {
    releaseNotes: '发版日志',
    officialReleaseRepository: '来自官方发布仓库',
    version: '版本切换:',
    noReleaseNotes: '暂无详细发版说明。',
    releasePackagesBinaries: '本版本安装文件与包',
    download: '下载',
    checkPackageSystem: '系统与架构以安装包标注为准',
    close: '关闭',
  },
});
