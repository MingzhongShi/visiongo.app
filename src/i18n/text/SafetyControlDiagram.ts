import { bilingual } from '../bilingual';

export const safetyControlDiagramText = bilingual({
  en: {
    modes: [
      { id: 'boundary', label: 'Local Control & AI Boundary' },
      { id: 'relay', label: '9-Digit Remote Assist' },
    ],
    badge: 'Interactive Architecture Diagram',
    boundaryNodes: [
      { app: 'VisionStudio', zone: 'Engineering Station', role: 'Design workflows, inspect diffs, approve L2 proposals', tone: 'emerald' },
      { app: 'VisionEdge', zone: 'Local Gateway', role: 'Execute L1 isolated trials, enforce lease & audit log, mediate cloud uplink', tone: 'violet' },
      { app: 'VisionRuntime', zone: 'Shop-Floor IPC', role: 'Run workflows 100% offline, talk to cameras & PLCs, lock structure while running', tone: 'cyan' },
      { app: 'VisionCloud', zone: 'Optional Cloud', role: 'Advice only (AI agent steps & Q&A). No direct control path to shop-floor devices', tone: 'amber' },
    ],
    boundaryNote: 'Only signed-in, named on-site engineers can approve parameter or script writes; VisionCloud can never trigger equipment directly.',
    relaySteps: [
      { code: 'STEP 01', title: 'On-Site 9-Digit Pairing Code', desc: 'Site engineer enables Remote Assist in VisionStudio and reads a one-time 9-digit code (10 min expiry).' },
      { code: 'STEP 02', title: 'Read-Only Diagnostics via VisionRelay', desc: 'Remote VISIONGO engineer reads versions, logs, NG counts, workflow structure and module params. Images & arbitrary files stay inaccessible.' },
      { code: 'STEP 03', title: 'On-Site Engineer Approves Every Change', desc: 'Remote engineer can only propose parameter tweaks or runtime reconnect. Execution waits for explicit click by the named engineer on-site.' },
    ],
    relayNote: 'Zero relay retention: VisionRelay forwards session messages only and stores no proposals, images or diagnostic logs.',
  },
  zh: {
    modes: [
      { id: 'boundary', label: '现场控制与 AI 安全边界' },
      { id: 'relay', label: '9 位配对码远程协助' },
    ],
    badge: '交互式架构示意图',
    boundaryNodes: [
      { app: 'VisionStudio', zone: '工程工作站', role: '编排工作流、查看参数/脚本 Diff、批准 L2 修改提议', tone: 'emerald' },
      { app: 'VisionEdge', zone: '本地边缘网关', role: '执行 L1 隔离试跑、校验设备租约与本地审计、统一代理联网', tone: 'violet' },
      { app: 'VisionRuntime', zone: '车间执行引擎', role: '纯离线运行检测与 PLC 通信，产线运行中锁定工作流结构', tone: 'cyan' },
      { app: 'VisionCloud', zone: '可选云端建议层', role: '仅提供步骤规划与知识检索建议，不持有任何直连现场设备的控制路径', tone: 'amber' },
    ],
    boundaryNote: '只有现场已登录的具名工程师在核对内容后点击批准，Edge 才会向 Runtime 写入变更；云端无法直接操作设备。',
    relaySteps: [
      { code: '第 1 步', title: '现场生成一次性 9 位配对码', desc: '现场工程师在 VisionStudio 开启远程协助，生成 10 分钟有效的 9 位配对码并口头告知支持工程师。' },
      { code: '第 2 步', title: '经 VisionRelay 只读排查诊断', desc: '远程支持工程师仅可读取版本、日志、NG 统计、流程结构与模块参数；无法查看原始图像或读写任意本地文件。' },
      { code: '第 3 步', title: '逐项提议 · 现场具名审批执行', desc: '即使勾选允许提出修改，也只能发起参数或重连提议；必须由现场工程师逐项点击“批准并执行”，产线运行中一律拒绝。' },
    ],
    relayNote: '中继零留存：VisionRelay 仅转发会话请求，不保存诊断内容或修改提议，完整审计记录只留存在现场电脑本机。',
  },
});
