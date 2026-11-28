import type { Solution } from '../types';
import type { SupportedLocale } from '../types/i18n';

export const getSolutions = (locale: SupportedLocale = 'en'): Solution[] => {
  const zh = locale === 'zh';
  return [
    {
      id: 'shape-matching',
      slug: 'shape-matching',
      category: 'task',
      title: zh ? '形状匹配与几何定位' : 'Shape Matching and Geometric Positioning',
      shortDescription: zh ? '从样本创建轮廓模板，在代表性图像上验证旋转、缩放与坐标修正结果。' : 'Create contour templates from samples and validate rotation, scale, and fixture alignment on representative images.',
      fullDescription: zh
        ? '在 VisionStudio 模板工作区准备样本、ROI 与特征轮廓，输出稳定坐标系供后续测量、抓取或装配节点引用。使用产线正常与异常样本评估遮挡、反光及对比度波动下的鲁棒性。'
        : 'Prepare samples, ROIs, and feature contours in the VisionStudio template workspace to feed downstream gauging, pick-and-place, or assembly checks. Validate robustness across lighting glare, partial occlusion, and contrast variations with representative pass/fail samples.',
      industry: zh ? '核心检测任务 · 定位引导' : 'Core Vision Task · Alignment & Guidance',
      pipeline: zh
        ? ['相机取图', '图像预处理', '轮廓形状匹配', '坐标系跟随定位', '结果输出 / PLC']
        : ['Acquire Frame', 'Preprocess', 'Contour Match', 'Fixture Transform', 'PLC / I/O Output'],
      keyBenefits: zh
        ? ['模板训练与特征轮廓可视化编辑', 'ROI、角度范围与分数阈值可控配置', '节点输入输出坐标实时透视检查']
        : ['Interactive template and contour editing', 'Explicit ROI, angle span, and score thresholds', 'Per-node coordinate and transform inspection'],
      recommendedStack: ['VisionStudio', 'VisionRuntime'],
    },
    {
      id: 'measurement',
      slug: 'measurement',
      category: 'task',
      title: zh ? '高精度尺寸测量工作流' : 'Precision Gauging & Measurement Workflows',
      shortDescription: zh ? '组合亚像素边缘提取、几何拟合与标定步骤，验证关键尺寸公差。' : 'Compose sub-pixel edge extraction, geometric fitting, and calibration steps to verify dimensional tolerances.',
      fullDescription: zh
        ? '围绕被测物光学条件、标定基准与坐标变换配置测量流程。在 VisionRuntime 中以实测样本检查重复性与误差边界，所有公差、标定参数及判定规则均以版本化工程快照管理。'
        : 'Configure metrology pipelines tailored to optics, calibration targets, and coordinate references. Evaluate repeatability and tolerance margins on real hardware in VisionRuntime, with every tolerance and calibration table stored in versioned workflow snapshots.',
      industry: zh ? '核心检测任务 · 几何测量' : 'Core Vision Task · Metrology & Gauging',
      pipeline: zh
        ? ['标定映射', '亚像素找边 / 找圆', '距离与角度拟合', '公差门限判定', 'SPC / 测量日志']
        : ['Calibration Map', 'Sub-pixel Edge/Circle', 'Distance & Angle Fit', 'Tolerance Gate', 'Traceability Log'],
      keyBenefits: zh
        ? ['预处理与几何测量节点自由组合', '按批次样本追踪单帧耗时与误差', '公差越限触发可审计的报警与分选边界']
        : ['Modular composition of filter and geometry nodes', 'Per-sample processing cost and variance profiling', 'Auditable pass/fail gating and reject outputs'],
      recommendedStack: ['VisionStudio', 'VisionRuntime'],
    },
    {
      id: 'region-analysis',
      slug: 'region-analysis',
      category: 'task',
      title: zh ? '表面缺陷与区域 Blob 分析' : 'Surface Defect & Region / Blob Analysis',
      shortDescription: zh ? '结合规则形态学过滤与可选 AI 检测节点，平衡复杂纹理判别与可控阈值。' : 'Combine rule-based morphology filtering with optional AI inspection nodes to handle complex textures within controllable bounds.',
      fullDescription: zh
        ? '面向划痕、污渍、异物、缺胶等表面异常，逐步检查灰度直方图、ROI 掩膜与连通域指标，并按需接入在 VisionStudio 标注训练的 AI 分类/分割模型作为辅助判别节点，同时保留规则阈值作为最终放行门限。'
        : 'For scratches, contamination, foreign particles, and adhesive continuity checks, inspect intensity histograms, ROI masks, and connected-region features step by step. Optionally pair desktop-annotated AI models trained via VisionWeb with explicit rule-based acceptance gates.',
      industry: zh ? '核心检测任务 · 缺陷与特征分析' : 'Core Vision Task · Defect & Region Analysis',
      pipeline: zh
        ? ['多区域 ROI 掩膜', '滤波与形态学', '连通域 / AI 节点', '面积数量阈值', '分选控制边界']
        : ['ROI Masking', 'Filter & Morphology', 'Blob / AI Node', 'Area & Count Gate', 'Reject Boundary'],
      keyBenefits: zh
        ? ['规则算法与受控 AI 模型在同一画布协同', '支持 NG 样本汇总复盘与阈值对比', '产线设备动作保持权限、验证与人工确认']
        : ['Rule tools and controlled AI nodes on one canvas', 'NG sample aggregation for root-cause review', 'Explicit operator and PLC safety interlocks'],
      recommendedStack: ['VisionStudio', 'VisionRuntime', 'VisionEdge'],
    },
    {
      id: 'lua-scripting',
      slug: 'lua-scripting',
      category: 'task',
      title: zh ? 'Lua 脚本编排与定制控制逻辑' : 'Lua Scripting & Custom Flow Control',
      shortDescription: zh ? '通过 module_flow_script 与条件分支实现多相机汇总、动态配方切换与总线报文组装。' : 'Implement multi-camera aggregation, dynamic recipe routing, and industrial bus formatting with embedded Lua flow scripts.',
      fullDescription: zh
        ? '当标准图形化节点需要配合自定义业务状态机或工位逻辑时，可在 VisionStudio 与 VisionRuntime 中嵌入轻量级 Lua 脚本节点（module_flow_script / module_flow_case），统一由工程版本和 L1 隔离试运行管理。'
        : 'When graphical nodes need custom state handling, multi-camera result fusion, or station-specific protocol payloads, embed Lua flow nodes (module_flow_script / module_flow_case) governed by the same project snapshots and L1 isolated trial execution.',
      industry: zh ? '核心工程能力 · 自定义逻辑扩展' : 'Core Engineering · Programmable Logic',
      pipeline: zh
        ? ['多节点结果汇入', 'Lua 逻辑运算', 'Case 条件分支', 'S7 / Modbus / HTTP', '版本化快照回滚']
        : ['Upstream Results', 'Lua Logic Script', 'Case Branching', 'PLC / MES Payload', 'Snapshot Rollback'],
      keyBenefits: zh
        ? ['无需脱离图形化工程即可编写条件分支与汇总脚本', '参数修改先经 L1 隔离试运行验证不触碰在产线程', '完整保留脚本版本变更与操作审批轨迹']
        : ['Custom branching and aggregation without leaving the project graph', 'Tested in L1 isolated trials before touching live execution', 'Tracked cleanly inside project snapshots and approval records'],
      recommendedStack: ['VisionStudio', 'VisionRuntime'],
    },
    {
      id: 'connector-pcb',
      slug: 'connector-pcb',
      category: 'industry',
      title: zh ? '3C 电子、连接器与 PCB 装配检测' : '3C Electronics, Connectors & PCB Inspection',
      shortDescription: zh ? '针对针脚共面度、插针偏位、焊点缺漏与 Fiducial 定位构建高一致性工位视觉。' : 'High-consistency station inspection for pin pitch, connector seating, component presence, and PCB fiducial alignment.',
      fullDescription: zh
        ? '连接器与 PCB 产线换型频繁且特征细密。工程师在 VisionStudio 中利用轮廓定位跟随组件位姿变化，结合亚像素针距测量与多 ROI 存在性判定，并通过 OPC UA、Modbus 或 HTTP 将单件判定写入产线追溯。'
        : 'Electronics and connector lines face tight feature tolerances and frequent product changeovers. Build fiducial-anchored workflows in VisionStudio combining sub-pixel pitch measurement and multi-ROI presence gates, with station traceability published over OPC UA, Modbus, or HTTP.',
      industry: zh ? '行业场景 · 3C 与半导体封装周边' : 'Industry · Electronics & PCB Assembly',
      pipeline: zh
        ? ['高分工业相机取图', 'Fiducial 基准定位', '针距与共面测量', '多 ROI 缺漏检测', 'MES / OPC UA 追溯']
        : ['High-Res Acquisition', 'Fiducial Alignment', 'Pin & Pitch Gauge', 'Presence Gate', 'OPC UA Traceability'],
      keyBenefits: zh
        ? ['多配方工单通过版本号清晰切换与核验', '局部光源波动时支持代表性样本复测标定', '桌面端直接标注异常引脚样本并闭环训练新版本']
        : ['Clear versioned recipes for fast model changeover', 'Repeatable calibration and lighting verification tools', 'Desktop annotation workflow for hard-to-catch edge defects'],
      recommendedStack: ['VisionStudio', 'VisionRuntime', 'VisionEdge'],
    },
    {
      id: 'automotive-parts',
      slug: 'automotive-parts',
      category: 'industry',
      title: zh ? '汽车精密零部件装配验证与包装核对' : 'Automotive Precision Parts & Packaging Verification',
      shortDescription: zh ? '面向机加工螺纹、卡簧装配、防错防漏与标签一致性，并与工位 PLC 严格联锁。' : 'Inspection for machined threads, clip seating, poka-yoke assembly verification, and label alignment interlocked with station PLCs.',
      fullDescription: zh
        ? '汽车零部件工位强调零误放与与现有 PLC 控制器的可靠握手。VisionRuntime 通过 Siemens S7、Mitsubishi SLMP、Omron FINS 或 EtherNet/IP 与产线协同执行本地判定，现场遇到参数漂移时还可通过 9 位码远程只读诊断协作。'
        : 'Automotive stations require deterministic pass/fail signaling and tight PLC handshakes. VisionRuntime coordinates natively over Siemens S7, Mitsubishi SLMP, Omron FINS, or EtherNet/IP for offline local execution, while VisionEdge and VisionRelay allow 9-digit read-only remote diagnostics when troubleshooting.',
      industry: zh ? '行业场景 · 汽车部件与总成制造' : 'Industry · Automotive & Precision Manufacturing',
      pipeline: zh
        ? ['PLC 硬触发取图', '几何装配防错', '倒角/螺纹测量', 'S7 / SLMP / FINS 联锁', '9 位码远程只读支持']
        : ['PLC Triggered Grab', 'Assembly Poka-Yoke', 'Thread/Edge Check', 'S7/SLMP/FINS Handshake', '9-Digit Remote Support'],
      keyBenefits: zh
        ? ['断网状态下在产工位持续独立运行不受外部影响', '产线运行期间禁止任何远程或云端写入更改结构', '工程师可按会话批准建议参数并一键保留回滚快照']
        : ['100% offline local execution independent of external networks', 'Remote/cloud structural edits blocked while line is running', 'Named engineer approval and instant snapshot rollback'],
      recommendedStack: ['VisionStudio', 'VisionRuntime', 'VisionEdge', 'VisionCloud'],
    },
  ];
};
export const SOLUTIONS_EN = getSolutions('en');
export const SOLUTIONS_ZH = getSolutions('zh');
export const SOLUTIONS = SOLUTIONS_EN;
