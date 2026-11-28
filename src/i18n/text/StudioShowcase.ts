import { bilingual } from '../bilingual';

export const studioShowcaseText = bilingual({
  en: {
    tabs: [
      { id: 'workflow', label: 'Workflow Graph' },
      { id: 'inspection', label: 'Inspection Overlays' },
      { id: 'agent', label: 'AI Agent & L1/L2 Trial' },
      { id: 'annotation', label: 'Annotation & Training' },
    ],
    workflowCaption: 'VisionStudio workflow editor · Real software screenshot (open full size for details)',
    openFullSize: 'Open full size',
    schematicBadge: 'Interactive Schematic · Replaceable with product capture',
    inspectionModes: [
      { id: 'match', label: 'Shape Match', metricLabel: 'Contour Score', metricValue: '0.94 (Threshold ≥ 0.80)', status: 'PASS', node: 'shape.match_1', output: 'pose: (x: 412.6, y: 284.1, θ: +1.4°)' },
      { id: 'measure', label: 'Geometry Measure', metricLabel: 'Pin Pitch', metricValue: '2.502 mm (Spec 2.50 ± 0.05)', status: 'PASS', node: 'geometry.distance_1', output: 'edges: 12 pairs · repeatability check OK' },
      { id: 'blob', label: 'Region & Blob', metricLabel: 'Surface Anomaly', metricValue: 'Area 142 px (> Limit 80 px)', status: 'NG', node: 'region.blob_1', output: 'region: [x: 560, y: 210] · flagged for review' },
    ],
    inspectionCaption: 'Interactive inspection overlay schematic showing how VisionStudio inspects node inputs, ROIs and pass/NG results.',
    agentTitle: 'Human-in-the-loop AI Assistant',
    agentPrompt: 'Engineer: "Why did pin_header NG count increase on Station 2?"',
    agentSteps: [
      { step: 'L0 Read-Only', title: 'Diagnostics & Logs', detail: 'Agent queries get_ng_summary, get_module_params and search_logs via VisionEdge without pausing production.' },
      { step: 'L1 Isolated Trial', title: 'Sample Replay Comparison', detail: 'Edge runs proposed threshold / Lua script patch on an isolated copy against representative OK & NG samples.' },
      { step: 'L2 Engineer Approval', title: 'Explicit Confirmation & Rollback', detail: 'Named engineer reviews diff & sample comparison in Studio and approves write. Previous workflow snapshot preserved.' },
    ],
    agentSafetyNote: 'Production lock: structural workflow edits are blocked while the line is running.',
    agentCaption: 'Interactive AI Agent workflow schematic · Shows read-only diagnostics, isolated L1 trials and L2 approval boundary.',
    annotationSteps: [
      { title: '1. Capture & Label in Studio', detail: 'Import production samples, draw bounding boxes or region masks directly inside VisionStudio desktop.' },
      { title: '2. Train via VisionWeb API', detail: 'Submit organization-isolated datasets using unified desktop tokens; export trained model artifacts.' },
      { title: '3. Validate in Workflow', detail: 'Load exported model into VisionRuntime inference nodes and verify with normal and abnormal samples before deployment.' },
    ],
    annotationLabels: ['OK · Connector Seat', 'NG · Bent Pin ROI', 'Mask · Scratch Region'],
    annotationCaption: 'Interactive annotation & training loop schematic · Unifies desktop labeling, training and local runtime validation.',
  },
  zh: {
    tabs: [
      { id: 'workflow', label: '工作流编排图' },
      { id: 'inspection', label: '检测结果叠加' },
      { id: 'agent', label: 'AI 助手与 L1/L2 试跑' },
      { id: 'annotation', label: '标注与模型训练' },
    ],
    workflowCaption: 'VisionStudio 工作流编辑器 · 真实软件界面截图（可点击查看原图）',
    openFullSize: '查看原图',
    schematicBadge: '交互式原理示意图 · 支持随时替换为实机截图',
    inspectionModes: [
      { id: 'match', label: '形状匹配定位', metricLabel: '轮廓匹配度', metricValue: '0.94（设定阈值 ≥ 0.80）', status: 'OK', node: 'shape.match_1', output: 'pose: (x: 412.6, y: 284.1, θ: +1.4°)' },
      { id: 'measure', label: '几何尺寸测量', metricLabel: '引脚间距', metricValue: '2.502 mm（公差 2.50 ± 0.05）', status: 'OK', node: 'geometry.distance_1', output: 'edges: 12 组边缘卡尺 · 样本复测一致' },
      { id: 'blob', label: '区域与 Blob 分析', metricLabel: '表面异常区域', metricValue: '面积 142 px（超出上限 80 px）', status: 'NG', node: 'region.blob_1', output: 'region: [x: 560, y: 210] · 标记待复核' },
    ],
    inspectionCaption: '交互式检测结果叠加示意图：点击上方模式可切换查看形状匹配、尺寸测量与区域分析的 ROI 和节点输出。',
    agentTitle: '受控的人机协同 AI 工程助手',
    agentPrompt: '工程师提问：“为什么 2 号工位连接器 NG 数量突然升高？”',
    agentSteps: [
      { step: 'L0 只读诊断', title: '汇总统计与参数读取', detail: 'Agent 通过 VisionEdge 调用 get_ng_summary、get_module_params 和日志检索定位异常模块，全程不中断产线。' },
      { step: 'L1 隔离试跑', title: '样本对比验证', detail: 'Edge 在隔离工作流副本上试跑参数或 Lua 脚本补丁，对正常与异常样本集逐项输出对比结果。' },
      { step: 'L2 具名审批', title: '人工确认与版本保全', detail: '已登录工程师核对差异与试跑效果后点击批准写入 Runtime，自动保留变更前快照以供回滚。' },
    ],
    agentSafetyNote: '产线运行保护：产线处于运行状态时，自动禁止任何工作流结构改动。',
    agentCaption: '交互式 AI 助手工作示意图 · 展示 L0 只读诊断、L1 隔离试跑与 L2 人工审批安全边界。',
    annotationSteps: [
      { title: '1. 在 Studio 桌面端标注样本', detail: '导入现场图像，直接在 VisionStudio 中框选或涂抹目标区域与缺陷类别，无需切换网页标注工具。' },
      { title: '2. 衔接 VisionWeb 训练任务', detail: '通过统一桌面令牌按组织隔离提交数据集与训练任务，导出可部署的模型文件。' },
      { title: '3. 回到流程节点验证上线', detail: '在本地工作流中接入推理节点，使用正常与异常样本复验后再下发到 VisionRuntime。' },
    ],
    annotationLabels: ['OK · 引脚到位区域', 'NG · 弯针异常框', 'Mask · 表面划痕掩码'],
    annotationCaption: '交互式样本标注与训练闭环示意图 · 统一桌面端标注、模型训练与本地 Runtime 验证。',
  },
});
