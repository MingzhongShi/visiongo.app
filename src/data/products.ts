import type { Product } from '../types';
import type { SupportedLocale } from '../types/i18n';

function createProduct(id: Product['id'], locale: SupportedLocale): Product {
  const zh = locale === 'zh';
  const definitions = {
    visionstudio: {
      name: 'VisionStudio',
      action: 'Build',
      color: '#34d399',
      role: zh ? '可视化工程工作台' : 'Engineering workspace',
      tagline: zh ? '可视化编排、样本标注与节点级调试环境' : 'Visual workflow design, annotation and node-level debugging',
      summary: zh ? '编排检测流程，检查节点数据，制作形状模板并分析运行结果。' : 'Design inspection workflows, inspect node data, prepare shape templates and analyze results.',
      description: zh
        ? 'VisionStudio 是面向视觉工程师的桌面工作台。你可以用节点图组合相机采集、图像滤波、形状匹配、尺寸测量、区域分析与模型推理步骤，在真实样本上逐节点检查输入输出与耗时，并在本地完成标注与模板验证。'
        : 'VisionStudio is the desktop workspace for vision engineers. Compose camera acquisition, filtering, shape matching, measurement, region analysis and model inference as a node graph, inspect inputs, outputs and timings at every step, and validate templates or annotations on representative samples.',
      features: zh ? ['节点式流程编排与调试', '形状模板训练与样本标注', 'ROI 编辑与执行耗时分析'] : ['Node-based workflow design and debugging', 'Shape template training and sample annotation', 'ROI editing and execution profiling'],
      details: zh
        ? ['把图像处理、测量和判定节点连成检测流程，逐个节点查看输入、输出和参数。', '从样本图像制作形状模板或整理标注数据集，设置 ROI 与阈值，再用正常和异常样本验证识别结果。', '在图像上框选检测区域，查看每次运行中各节点的耗时，找出拖慢节拍的步骤。']
        : ['Connect image processing, measurement and decision nodes into a workflow and inspect each node\'s inputs, outputs and parameters.', 'Build shape templates or prepare annotated samples, set ROIs and thresholds, then validate matching on good and defective samples.', 'Draw inspection regions on the image and see how long each node takes per run to find the steps that slow the cycle.'],
      deployment: zh ? '工程工作站；系统与架构以发行包为准' : 'Engineering workstation; OS and architecture depend on the package',
      connectivity: zh ? '本地离线可用；在线登录、云端 AI 建议与模型训练按需连接' : 'Works offline locally; online sign-in, cloud AI advice and training connect only when enabled',
      sample: {
        filename: 'workflow.recipe.json',
        language: 'json',
        code: `{
  "schema": "visiongo.workflow/v1",
  "name": "connector-pin-inspection",
  "nodes": [
    { "id": "cam_1", "op": "camera.acquire", "trigger": "hardware" },
    { "id": "match_1", "op": "shape.match", "template": "pin_header.tpl", "min_score": 0.82 },
    { "id": "measure_1", "op": "geometry.distance", "from": "match_1.pose", "roi": "pin_pitch" },
    { "id": "judge_1", "op": "rule.threshold", "metric": "pitch_mm", "range": [2.48, 2.52] }
  ],
  "approval": { "require_operator_confirm": true, "preserve_previous_version": true }
}`,
      },
    },
    visionruntime: {
      name: 'VisionRuntime',
      action: 'Run',
      color: '#22d3ee',
      role: zh ? '现场执行引擎' : 'Local execution runtime',
      tagline: zh ? '离线自治的产线检测与设备控制服务' : 'Offline-capable local inspection and device control service',
      summary: zh ? '在执行设备上运行检测工作流，处理图像与设备通信，通过 SDK 契约与工作台连接。' : 'Execute inspection workflows on the local device, process images and communicate with equipment, connected to the workspace through SDK contracts.',
      description: zh
        ? 'VisionRuntime 部署在现场工控机或执行设备上，专注执行经过验证的检测工作流并与相机、PLC 或外设通信。它与 VisionStudio 保持进程与源码隔离，仅通过公共 SDK 契约通信，在完全断网的生产车间也能独立运行。'
        : 'VisionRuntime runs on the on-site workstation or industrial PC to execute validated inspection workflows and communicate with cameras and production equipment. Isolated from VisionStudio and connected only through public SDK contracts, it operates locally without requiring an internet connection.',
      features: zh ? ['图像处理与检测流程执行', '设备控制与通信边界', '公共 SDK 契约与工作台集成'] : ['Image processing and inspection workflow execution', 'Device control and communication boundaries', 'Workspace integration through public SDK contracts'],
      details: zh
        ? ['在现场设备上运行工作台设计好的检测流程，处理相机图像并给出判定结果。', '通过设备通信与产线交换信号；涉及生产控制的操作保留权限、验证与审批边界。', '与工作台之间只通过公共 SDK 契约通信，升级时双方按契约检查兼容性。']
        : ['Run the workflows designed in the workspace on the local device, process camera images and report the decision.', 'Exchange signals with the line through device communication; production control keeps its permission, validation and approval boundaries.', 'Talks to the workspace only through public SDK contracts, which both sides check for compatibility when upgrading.'],
      deployment: zh ? '现场执行设备；驱动与计算后端按实际配置确认' : 'Local execution device; confirm drivers and compute backends for your configuration',
      connectivity: zh ? '核心检测完全支持离线运行，无强制外网依赖' : 'Core inspection runs fully offline with no mandatory internet dependency',
      sample: {
        filename: 'runtime-contract.json',
        language: 'json',
        code: `{
  "schema": "visiongo.runtime.deploy/v1",
  "transport": "local-ipc",
  "recipe_version": "2026.11.0-rc2",
  "safety_boundary": {
    "validate_before_apply": true,
    "snapshot_for_rollback": true,
    "allow_structural_edit_while_running": false
  },
  "io_channel": { "result_output": "plc_ok_ng", "audit_log": "local" }
}`,
      },
    },
    visionedge: {
      name: 'VisionEdge',
      action: 'Assist',
      color: '#a78bfa',
      role: zh ? '边缘网关' : 'Edge gateway',
      tagline: zh ? '统一现场联网出入与本地控制审批边界' : 'Unified on-site gateway and local control approval boundary',
      summary: zh ? 'VISIONGO 架构中的边缘网关与本地控制边界。具体能力与部署要求按实际发行版本确认。' : 'The edge gateway and local control boundary in the VISIONGO architecture. Confirm capabilities and deployment requirements for the release you use.',
      description: zh
        ? 'VisionEdge 位于现场工作站/执行设备与云端服务之间，负责统一代理联网请求、执行本地控制策略并记录审计日志。云端仅返回建议，任何作用于现场流程或设备的变更都必须经过本地校验与确认边界。'
        : 'VisionEdge sits between on-site stations and connected services, mediating outbound requests, enforcing local control boundaries and recording audit trails. Cloud services only return advice; any change affecting local workflows or equipment passes through local validation and confirmation.',
      features: zh ? ['边缘网关角色', '本地控制与审批边界', '通过公共契约与其他应用通信'] : ['Edge gateway role', 'Local control and approval boundary', 'Communication through public contracts'],
      details: zh
        ? ['位于现场与云端服务之间，现场应用的联网请求经由它统一出入。', '云端只提供建议，涉及现场设备的操作需要在本地校验与确认后才执行，并保留回滚快照。', '与 VisionStudio、VisionRuntime 和 VisionCloud 之间只使用 SDK 中的公共契约，不依赖彼此的内部实现。']
        : ['Sits between the site and cloud services; connected requests of on-site applications pass through it.', 'The cloud only advises; actions affecting local equipment run only after local validation and confirmation, with rollback snapshots preserved.', 'Uses only the public SDK contracts with VisionStudio, VisionRuntime and VisionCloud, never their internals.'],
      deployment: zh ? '现场边缘设备；部署条件请咨询工程团队' : 'On-site edge device; consult engineering about deployment requirements',
      connectivity: zh ? '局域网连接本地站点；可选上行连接 VisionCloud' : 'Connects locally over LAN; optional uplink to VisionCloud when enabled',
      sample: {
        filename: 'edge-policy.json',
        language: 'json',
        code: `{
  "schema": "visiongo.edge.policy/v1",
  "cloud_uplink": "optional",
  "control_boundary": {
    "cloud_can_execute_directly": false,
    "require_local_validation": true,
    "require_approval_or_session_grant": true,
    "audit_trail": "enabled"
  }
}`,
      },
    },
    visioncloud: {
      name: 'VisionCloud',
      action: 'Extend',
      color: '#fbbf24',
      role: zh ? '云端建议与分析' : 'Cloud advice and analysis',
      tagline: zh ? '按组织隔离的可选 AI 辅助分析与额度服务' : 'Optional per-organization AI workflow advice and usage service',
      summary: zh ? '为联网场景提供可选的云端建议与分析服务，生产控制保留现场验证与审批边界。' : 'Optional cloud advice and analysis for connected deployments, with production control retaining on-site validation and approval boundaries.',
      description: zh
        ? 'VisionCloud 在项目需要联网协助时提供 AI 流程建议、参数诊断与按组织隔离的用量/额度管理。AI 数据授权默认关闭，须由企业组织管理员显式开启；断网时本地工程与产线运行不受影响。'
        : 'When your project enables connected assistance, VisionCloud provides AI workflow advice, diagnostic suggestions and organization-isolated credit tracking. AI data authorization is off by default and must be explicitly enabled by an organization administrator; disconnecting never interrupts local production.',
      features: zh ? ['可选 AI 工程建议', '按组织隔离的数据与额度', 'AI 数据授权默认关闭'] : ['Optional AI engineering advice', 'Per-organization data and credit isolation', 'AI data authorization off by default'],
      details: zh
        ? ['联网时为检测流程的设计与调试提供 AI 建议；不联网时其他产品照常工作。', '按组织汇总用量与分析结果，数据和额度在组织之间相互隔离，可在账户中心查看流水。', '云端不具备直接控制现场设备的路径，且组织 AI 数据使用默认关闭，由管理员随时开关。']
        : ['When connected, AI advice helps design and debug inspection workflows; without it the other products work as usual.', 'Usage and analysis are kept per organization, with data and credits separated between organizations and visible in the account ledger.', 'The cloud has no direct execution path to factory equipment, and AI data authorization defaults to off under administrator control.'],
      deployment: zh ? '在线服务，无本地安装包' : 'Online service, no local installer',
      connectivity: zh ? '需互联网访问；本地应用可按需随时断开' : 'Requires internet access; local applications remain independent when offline',
      sample: {
        filename: 'organization-policy.json',
        language: 'json',
        code: `{
  "schema": "visiongo.identity.tenant/v1",
  "tenant_type": "enterprise",
  "ai_data_authorized": false,
  "credits": { "isolation": "per_organization", "ledger": "auditable" },
  "execution_scope": "advice_only"
}`,
      },
    },
  };
  const definition = definitions[id];
  return {
    id,
    slug: id,
    name: definition.name,
    shortAction: definition.action as Product['shortAction'],
    positioning: definition.role,
    tagline: definition.tagline,
    summary: definition.summary,
    description: definition.description,
    accentColor: definition.color,
    badge: zh ? '产品介绍' : 'Product overview',
    highlights: definition.features,
    keyCapabilities: definition.features.map((title, index) => ({
      title,
      description: definition.details[index],
      icon: ['Workflow', 'Cpu', 'Shield'][index],
    })),
    architectureRole: definition.role,
    deploymentTarget: definition.deployment,
    connectivityRequirement: definition.connectivity,
    sampleCodeOrConfig: definition.sample,
  };
}
const ids = ['visionstudio', 'visionruntime', 'visionedge', 'visioncloud'] as const;
export const PRODUCTS_EN: Record<string, Product> = Object.fromEntries(ids.map(id => [id, createProduct(id, 'en')]));
export const PRODUCTS_ZH: Record<string, Product> = Object.fromEntries(ids.map(id => [id, createProduct(id, 'zh')]));
export const getProducts = (locale: SupportedLocale = 'en'): Product[] => ids.map(id => createProduct(id, locale));
export const getProduct = (slug: string, locale: SupportedLocale = 'en'): Product => (locale === 'zh' ? PRODUCTS_ZH : PRODUCTS_EN)[slug] || createProduct('visionstudio', locale);
export const PRODUCTS = PRODUCTS_EN;
export const PRODUCT_LIST = getProducts();
