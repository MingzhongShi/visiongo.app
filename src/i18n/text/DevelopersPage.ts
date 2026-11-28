import { bilingual } from '../bilingual';

export const developersPageText = bilingual({
  en: {
    quickstart: 'Quickstart',
    choosePackagesFor: 'Choose packages for your OS and architecture, install Studio and Runtime using the bundled instructions, verify connectivity and validate a workflow with project samples.',
    quickstartSteps: [
      { step: '01', title: 'Install matched packages', desc: 'Select VisionStudio (workstation) and VisionRuntime (station/IPC) packages matching your OS and CPU architecture.' },
      { step: '02', title: 'Start local Runtime', desc: 'Verify camera drivers, hardware permissions, and local VisionRuntime service startup before adding production triggers.' },
      { step: '03', title: 'Connect Studio workspace', desc: 'Point VisionStudio to your local or LAN Runtime instance, verify protocol status, and load representative sample frames.' },
      { step: '04', title: 'Inspect & gate production', desc: 'Check node outputs, ROI alignment, cycle cost, and PLC safety interlocks before marking a project snapshot active.' },
    ],
    goToDownloads: 'Download installers',
    engineeringAndDeployment: 'Engineering and deployment',
    defineWorkstationExecution: 'Define workstation, execution device, driver and connectivity dependencies. Keep permission, approval, validation and rollback boundaries for production control.',
    deploymentCards: [
      { title: 'Execution Separation', desc: 'VisionRuntime runs locally on the station without requiring cloud connectivity during production.' },
      { title: 'Snapshot Governance', desc: 'Workflow edits save as immutable project revisions with one-step rollback on unexpected drift.' },
      { title: 'Control Safety', desc: 'AI suggestions require L1 isolated trial verification and named engineer L2 approval before applying.' },
    ],
    publicSdkContracts: 'Public SDK contracts',
    theSdkIs: 'The SDK is the shared contract source for communication between applications. C++ DTOs are generated from schemas. Contract changes require generation, validation and producer/consumer compatibility checks.',
    sdkTableHeaders: { contract: 'Schema Contract', scope: 'Producers & Consumers', role: 'Purpose & Governance' },
    sdkContracts: [
      { name: 'agent.json', peers: 'VisionStudio ↔ VisionEdge ↔ VisionCloud', role: 'Session state, L0 diagnostic tool calls, L1 trial orchestration, and approval requests.' },
      { name: 'identity.json', peers: 'VisionStudio / Website / VisionWeb / VisionCloud', role: 'User accounts, organization roles, and desktop/service authentication tokens.' },
      { name: 'training.json', peers: 'VisionStudio ↔ VisionWeb', role: 'Desktop-annotated sample uploads, training job status, and exported model artifacts.' },
      { name: 'remote_assist.json', peers: 'On-Site Peer ↔ VisionRelay ↔ Support Engineer', role: '9-digit pairing session (10-min TTL) and read-only diagnostic relay.' },
      { name: 'credits.json & releases.json', peers: 'VisionCloud / Release Server ↔ Website', role: 'Organization quota reporting, release manifests, and SHA-256 checksum indexing.' },
    ],
    interfacesAndIntegration: 'Interfaces and integration',
    interfaceAvailabilityAnd: 'Interface availability and device support depend on the release, public SDK contracts and release documentation. Confirm data sources, permissions and failure behavior before integration.',
    interfaceGroups: [
      { title: 'Cameras', items: ['GenICam', 'GigE Vision', 'USB3 Vision'] },
      { title: 'PLC & Fieldbus', items: ['Siemens S7', 'Mitsubishi SLMP', 'Omron FINS', 'Modbus TCP / RTU', 'EtherNet/IP'] },
      { title: 'Plant & Telemetry', items: ['OPC UA', 'MQTT', 'HTTP', 'JSON SDK IPC'] },
    ],
    workflowDebugging: 'Lua scripting & workflow debugging',
    inspectNodeInputs: 'Inspect node inputs, outputs, ROI and parameters, or compose custom branching in module_flow_script / module_flow_case Lua nodes validated via isolated L1 runs.',
    luaSnippetTitle: 'module_flow_script · Result gate example',
    luaSnippetCode: `-- Embedded Lua flow script evaluated inside VisionRuntime
function evaluate(ctx)
  local matchScore = ctx.getNumber("shape_match.score", 0.0)
  local defects = ctx.getInt("region_filter.count", 0)
  local ok = (matchScore >= 0.85) and (defects == 0)

  ctx.setBool("plc.output_pass", ok)
  ctx.setString("trace.status", ok and "OK" or "NG_REVIEW")
  return ok
end`,
    developersGettingStarted: 'Developers — Getting started',
    downloadConnectAnd: 'Download, connect and debug Studio and Runtime, and understand public SDK contracts.',
    startWithYour: 'Engineering integration & SDK documentation',
    installationAndWorkflow: 'Installation path, public SDK schemas, industrial protocols, and Lua workflow scripting boundaries.',
    developerGuides: 'Developer guides',
    learnMore: 'Read full guide',
    readPlcGuide: 'Read PLC integration guide',
    discussRequirements: 'Discuss integration requirements',
  },
  zh: {
    quickstart: '快速开始',
    choosePackagesFor: '选择适合系统与架构的发行包，按随包文档安装 Studio 和 Runtime，确认连接后用项目样本构建并验证检测流程。',
    quickstartSteps: [
      { step: '01', title: '安装匹配版本的安装包', desc: '按工程机与工控机操作系统和 CPU 架构分别获取 VisionStudio 与 VisionRuntime。' },
      { step: '02', title: '启动本地 Runtime', desc: '接入生产触发前，先确认相机驱动、设备权限及 VisionRuntime 本地服务连通。' },
      { step: '03', title: '连接 Studio 工作区', desc: '配置 Studio 指向本机或局域网 Runtime，导入代表性合格/异常样本进行离线验证。' },
      { step: '04', title: '核验指标后上线放行', desc: '检查各节点输出、ROI 坐标、单帧耗时与 PLC 安全联锁，再将版本快照设为生效状态。' },
    ],
    goToDownloads: '前往下载中心',
    engineeringAndDeployment: '工程与部署',
    defineWorkstationExecution: '明确工作站、执行设备、驱动与联网依赖。生产控制保留权限、审批、验证和回滚边界。',
    deploymentCards: [
      { title: '执行与编排解耦', desc: 'VisionRuntime 在工位本地独立执行，产线生产期间不依赖任何外部云连接。' },
      { title: '工程快照版本治理', desc: '参数调整保存为完整工程版本，出现异常时可按快照一键回滚。' },
      { title: '受控参数变更机制', desc: 'AI 参数建议必须经过 L1 隔离试运行与工程师 L2 确认方可写入正式流程。' },
    ],
    publicSdkContracts: 'SDK 公共契约',
    theSdkIs: 'SDK 是应用间通信的公共契约源。C++ DTO 由 schema 生成；契约变更需先生成、校验并检查生产者与消费者兼容性。',
    sdkTableHeaders: { contract: '契约 Schema', scope: '生产方与消费方', role: '职责与约束' },
    sdkContracts: [
      { name: 'agent.json', peers: 'VisionStudio ↔ VisionEdge ↔ VisionCloud', role: '会话状态、L0 只读排障工具调用、L1 试运行与变更确认请求。' },
      { name: 'identity.json', peers: 'VisionStudio / Website / VisionWeb / VisionCloud', role: '用户账号、组织权限与桌面端访问令牌统一签发与校验契约。' },
      { name: 'training.json', peers: 'VisionStudio ↔ VisionWeb', role: '桌面端标注样本提交、模型训练任务追踪与产物导出协议。' },
      { name: 'remote_assist.json', peers: '现场工位 ↔ VisionRelay ↔ 支持工程师', role: '9 位一次性配对码（10 分钟有效期）与只读诊断命令转发契约。' },
      { name: 'credits.json & releases.json', peers: 'VisionCloud / 发布服务 ↔ Website', role: '组织资源额度统计、多平台发行清单与 SHA-256 校验索引。' },
    ],
    interfacesAndIntegration: '接口与工业协议集成',
    interfaceAvailabilityAnd: '接口可用性与设备支持以实际版本、SDK 契约及发行文档为准。集成前请明确数据源、控制权限及异常降级行为。',
    interfaceGroups: [
      { title: '工业相机', items: ['GenICam', 'GigE Vision', 'USB3 Vision'] },
      { title: 'PLC 与工控总线', items: ['Siemens S7', 'Mitsubishi SLMP', 'Omron FINS', 'Modbus TCP / RTU', 'EtherNet/IP'] },
      { title: '上层系统与遥测', items: ['OPC UA', 'MQTT', 'HTTP', 'JSON SDK IPC'] },
    ],
    workflowDebugging: 'Lua 流程脚本与调试',
    inspectNodeInputs: '沿节点检查输入、输出、ROI 与参数，并在 module_flow_script / module_flow_case 中编写定制分支逻辑，通过 L1 隔离试运行先验证效果。',
    luaSnippetTitle: 'module_flow_script · 工位结果汇总示例',
    luaSnippetCode: `-- 在 VisionRuntime 中执行的嵌入式 Lua 流程脚本示例
function evaluate(ctx)
  local matchScore = ctx.getNumber("shape_match.score", 0.0)
  local defects = ctx.getInt("region_filter.count", 0)
  local ok = (matchScore >= 0.85) and (defects == 0)

  ctx.setBool("plc.output_pass", ok)
  ctx.setString("trace.status", ok and "OK" or "NG_REVIEW")
  return ok
end`,
    developersGettingStarted: '开发者与快速开始',
    downloadConnectAnd: '下载、连接并调试 Studio 与 Runtime，了解 SDK 公共契约。',
    startWithYour: '工程集成与开发者文档',
    installationAndWorkflow: '从快速安装、SDK 公共契约边界，到工业 PLC 接口清单与 Lua 流程脚本示例。',
    developerGuides: '开发者导航',
    learnMore: '阅读完整指南',
    readPlcGuide: '阅读 PLC 集成指南',
    discussRequirements: '咨询项目集成需求',
  },
});
