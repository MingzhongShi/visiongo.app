import { bilingual } from '../bilingual';

export const productPageText = bilingual({
  en: {
    home: 'Home',
    readDeveloperDocs: 'Read Developer Docs',
    architectureRole: 'Architecture Role',
    deploymentTarget: 'Deployment Target',
    networkConnectivity: 'Network & Connectivity',
    keyCapabilitiesEngineering: 'Key Capabilities & Engineering Features',
    specificationConfigurationBlueprint: 'Specification & Configuration Blueprint',
    sampleDeclarativeManifest: 'Sample declarative manifest demonstrating interoperability and schema contracts.',
    backToPlatform: 'Back to Platform Overview',
    requestTrial: (name: string | number) => `Request ${name} Trial`,
    products: 'Products',
    phaseSuffix: 'Phase',
  },
  zh: {
    home: '首页',
    readDeveloperDocs: '阅读技术开发者文档',
    architectureRole: '架构职责与定位',
    deploymentTarget: '部署硬件与环境',
    networkConnectivity: '网络与连通性要求',
    keyCapabilitiesEngineering: '关键特性与工程能力',
    specificationConfigurationBlueprint: '配置清单与技术规格蓝图',
    sampleDeclarativeManifest: '声明式配方样例，演示系统互操作性与强类型 SDK 契约规范。',
    backToPlatform: '返回系统全局概览',
    requestTrial: (name: string | number) => `申请 ${name} 试用评估`,
    products: '产品矩阵',
    phaseSuffix: '阶段',
  },
});
