import type { ResourceArticle } from '../types';
import type { SupportedLocale } from '../types/i18n';

const entries: Array<{
  slug: string;
  category: 'tutorial' | 'architecture' | 'troubleshooting' | 'checklist';
  title: [string, string];
  summary: [string, string];
  content: [string, string];
}> = [
  {
    slug: 'getting-started', category: 'tutorial', title: ['Getting Started with VisionStudio and VisionRuntime', '开始使用 VisionStudio 与 VisionRuntime'],
    summary: ['Choose packages, connect the runtime and validate your first inspection workflow.', '从选择发行包、连接 Runtime 到验证第一个检测流程。'],
    content: [
`## 1. Choose compatible packages
Download VisionStudio and VisionRuntime packages for the operating systems and CPU architectures on your engineering workstation and execution device. Check the release notes and bundled installation instructions. Do not assume packages with different version numbers are compatible.

## 2. Prepare the local runtime
Install and start VisionRuntime following the instructions shipped with your release. Verify device permissions, drivers and runtime connectivity before connecting cameras or other production hardware.

## 3. Connect the engineering workspace
Open VisionStudio and configure the Runtime connection for your installation. Check the connection status. Resolve connection errors before running a workflow.

## 4. Build and inspect a workflow
In the workflow workspace, add the acquisition and processing steps required for your task. Use project samples to inspect node inputs and outputs. For shape matching, prepare a template and ROI in the template workspace and verify it against representative samples.

## 5. Validate before production
Check error paths, expected results and execution costs on your own hardware. Keep permission checks and operator confirmation in place when a workflow can control production devices. Treat a working sample as the start of validation, not a production acceptance test.

[Download software](/downloads)
`,
`## 1. 选择兼容的安装包
分别为工程工作站和执行设备选择适合操作系统、CPU 架构的 VisionStudio 与 VisionRuntime 安装包。阅读版本说明和随包安装文档，不要仅凭版本号推断兼容性。

## 2. 准备本地 Runtime
按照当前发行包文档安装并启动 VisionRuntime。在接入相机或生产设备前，检查设备权限、驱动和 Runtime 通信状态。

## 3. 连接工程工作台
打开 VisionStudio，根据当前安装环境配置 Runtime 连接并检查状态。连接异常应先排查，再执行工作流。

## 4. 编排并检查工作流
在流程工作区添加任务所需的采集与处理步骤，使用项目样本检查各节点输入、输出。形状匹配任务可在模板工作区准备模板与 ROI，再用代表性样本验证。

## 5. 投产前验证
在自己的硬件上检查异常路径、预期结果与执行耗时。涉及生产设备控制时保留权限检查与操作确认。样本运行成功只是验证的起点，不代表已经完成生产验收。

[前往下载](/zh/downloads)
`],
  },
  {
    slug: 'workflow-debugging', category: 'troubleshooting', title: ['Debugging an Inspection Workflow', '调试检测工作流'],
    summary: ['Inspect node data, ROI settings and execution costs before changing a workflow.', '先检查节点数据、ROI 与执行耗时，再调整流程。'],
    content: [
`## Start with the input
Confirm that the image source is connected and that frames arrive as expected. Record sample conditions and distinguish acquisition faults from processing faults.

## Inspect each step
Work through the graph in order. Inspect inputs and outputs at the step where results first diverge from expectations. Check ROI, template and threshold settings against the actual image.

## Measure on your hardware
Use the profiler to examine processing costs with representative samples. Hardware, image size, operators and configuration all affect results. Keep the measured environment and software versions with your findings.

## Validate the change
Re-run normal and abnormal samples after adjusting a node. Confirm the expected results and failure behavior before using the workflow with production equipment.
`,
`## 从输入开始
确认图像来源已连接，且帧按预期到达。记录样本条件，区分采集异常与处理异常。

## 逐步检查
沿流程顺序检查各节点输入、输出，找到结果首次偏离预期的位置。结合实际图像核对 ROI、模板和阈值配置。

## 在实际硬件上测量
使用性能分析检查代表性样本的处理耗时。硬件、图像尺寸、算子和配置都会影响结果；记录测试环境与软件版本。

## 验证改动
调整节点后重新运行正常与异常样本，检查预期结果及失败行为，再用于生产设备。
`],
  },
  {
    slug: 'local-deployment', category: 'architecture', title: ['Planning a Local Deployment', '规划本地部署'],
    summary: ['Define execution, connectivity and control requirements for each station.', '为每个工位明确执行、联网与控制要求。'],
    content: [
`## Separate engineering and execution
VisionStudio is the engineering and interaction workspace. VisionRuntime handles detection, device communication and workflow execution. Connect them through the public SDK contracts rather than private application modules.

## List dependencies
Document OS and CPU architecture, camera drivers, optional compute backends and the enabled feature set. Confirm requirements against the release you deploy.

## Check connectivity requirements
Local execution and online features have different dependencies. Test the intended disconnected operation with your actual configuration. Online identity and cloud analysis require their respective services.

## Keep control boundaries
Record who can change a workflow, approve production actions and restore a known configuration. Keep validation and audit evidence for changes that affect production control.
`,
`## 分开工程与执行
VisionStudio 是工程与交互工作台；VisionRuntime 负责检测、设备通信与流程执行。两者通过 SDK 公共契约连接，不依赖对方私有模块。

## 列出依赖
记录系统、CPU 架构、相机驱动、可选计算后端及启用功能，并按实际部署版本确认要求。

## 检查联网需求
本地执行与在线功能的依赖不同。使用真实配置验证计划中的断网运行；在线身份认证与云端分析需要各自服务可用。

## 保留控制边界
明确谁能修改工作流、批准生产操作及恢复已知配置。涉及生产控制的变更保留验证与审计依据。
`],
  },
  {
    slug: 'sdk-contracts', category: 'architecture', title: ['Understanding SDK Contract Boundaries', '了解 SDK 契约边界'],
    summary: ['Understand the shared contract source and compatibility workflow.', '了解公共契约源与兼容性变更流程。'],
    content: [
`## A shared contract source
The SDK defines the public data contracts used across VISIONGO applications. C++ DTO headers are generated from JSON schemas. Applications consume the generated headers and do not edit them directly.

## Keep application boundaries
Applications communicate through public contracts and formal transports. They do not import each other's private source directories, headers or internal symbols.

## Change contracts first
Update the contract source, regenerate the bindings and run compatibility checks before updating producers and consumers. Prefer optional additions. Breaking changes require a protocol version change.

## Check consumers
Validate all affected producers and consumers, including error paths and older peers. A successful build alone does not prove wire compatibility.
`,
`## 公共契约源
SDK 定义 VISIONGO 应用之间的公共数据契约。C++ DTO 头文件由 JSON schema 生成，应用消费生成结果，不直接修改生成文件。

## 保持应用边界
应用通过公共契约与正式传输路径通信，不导入彼此私有源码目录、头文件或内部符号。

## 先变更契约
先修改契约源、重新生成绑定并完成兼容性检查，再更新生产者与消费者。新增字段优先使用 optional；破坏性变更需升级协议版本。

## 检查消费方
验证所有受影响的生产者和消费者，包括异常路径与旧版本对端。编译成功本身不能证明线上协议兼容。
`],
  },
  {
    slug: 'feasibility-checklist',
    category: 'checklist',
    title: ['Machine Vision Feasibility Evaluation Checklist', '工业视觉工程可行性评估清单'],
    summary: ['Confirm optics, sample variation, cycle budget, and PLC handshake requirements before project kickoff.', '项目启动前核对光学条件、样本差异、节拍约束与 PLC 通信接口需求。'],
    content: [
`## 1. Define the pass/fail acceptance boundary
Separate critical defects from cosmetic variations before tuning algorithms. Gather both representative OK parts and genuine NG examples covering worst-case glare, surface marks, and part tolerances.

## 2. Verify optics, working distance, and lighting
Confirm minimum feature size per pixel across the field of view. Fixed lighting geometry and mechanical fixturing prevent downstream threshold fragility far better than post-processing alone.

## 3. Measure processing and trigger budget
Check exposure time, readout latency, workflow node cost, and PLC handshake turnaround together on the target workstation or IPC hardware.

## 4. Clarify station control & rollback expectations
Document who approves parameter updates, what happens when the line is running, and which snapshot revision acts as the baseline fallback.

[Request feasibility review](/contact?topic=feasibility-checklist)
`,
`## 1. 明确合格与不合格验收边界
在调参前区分关键缺陷与允许的工艺外观波动，同时收集覆盖反光、划痕、来料公差极端情况的代表性 OK 与 NG 样本。

## 2. 核对成像视野、光学与打光条件
确认最小特征对应的像素分辨率与景深余量。稳定的打光结构与工装夹具往往比单纯调大算法滤波更可靠。

## 3. 合并计算曝光、算法与通讯总节拍
在目标工控机上按实际触发频率实测曝光、取图、视觉节点运算与 PLC 回传耗时，预留产线冗余。

## 4. 明确现场控制权限与回滚策略
提前约定谁有权批准工作流参数改动、在产线运行时禁止哪些变更，以及出现误判时的快照回滚机制。

[发起工程可行性评估](/zh/contact?topic=feasibility-checklist)
`],
  },
  {
    slug: 'ai-assisted-tuning',
    category: 'architecture',
    title: ['AI-Assisted Diagnostics & L1/L2 Control Governance', 'AI 辅助调优与 L1/L2 安全治理边界'],
    summary: ['How VISIONGO isolates AI parameter exploration in L1 trials and enforces named L2 approval before production changes.', '了解 VISIONGO 如何通过 L1 隔离试运行与 L2 工程师确认保障现场可控与可回滚。'],
    content: [
`## L0: Read-only diagnostics first
VisionCloud and AI agent tools start in L0 read-only inspection mode—querying NG summaries, node parameters, and execution logs via public SDK contracts without touching live workflows.

## L1: Isolated trial verification
Proposed parameter or script adjustments are evaluated in an isolated L1 trial against historical or captured sample batches. The running production workflow remains untouched.

## L2: Explicit engineer approval & snapshot rollback
Before applying any change to the active station project, the on-site engineer reviews diffs and grants explicit session approval, with the prior revision saved as a restorable snapshot.

## Offline resilience
Once deployed, VisionRuntime never calls VisionCloud or an LLM to pass or reject parts during production runs.
`,
`## L0：先从只读诊断起步
VisionCloud 与 AI 助手默认以 L0 只读方式工作，仅通过 SDK 契约读取 NG 汇总、节点参数与执行日志，不直接改动线上流程。

## L1：隔离试运行验证
针对参数漂移或脚本调整的建议，会先在独立隔离的 L1 试运行环境中针对历史样本包进行效果验证，不干扰在产检测线程。

## L2：具名工程师审批与快照回滚
任何要写入正式工位工程的改动都必须经由现场工程师审阅差异并确认授权，生效前自动保存旧版本快照用于随时回滚。

## 断网独立运行能力
参数验证通过并上线后，VisionRuntime 在日常产线执行期间完全不依赖云端与大模型即可独立完成检测判定。
`],
  },
  {
    slug: 'plc-integration-guide',
    category: 'tutorial',
    title: ['Industrial Camera & PLC Protocol Integration Guide', '工业相机与 PLC 通信协议集成指南'],
    summary: ['Overview of GenICam cameras, Siemens S7, Mitsubishi SLMP, Omron FINS, Modbus, OPC UA, and MQTT in VisionRuntime.', '梳理 VisionRuntime 中 GenICam 相机采集及 S7、SLMP、FINS、Modbus、OPC UA 与 MQTT 的接入要点。'],
    content: [
`## Camera acquisition interfaces
VisionRuntime supports standard GenICam, GigE Vision, and USB3 Vision cameras. Validate MTU / jumbo frames, trigger polarity, and heartbeat timeouts on the station NIC before integration tests.

## Native PLC & fieldbus protocols
Communicate directly with cell controllers over Siemens S7, Mitsubishi SLMP, Omron FINS, Modbus TCP/RTU, or EtherNet/IP without writing custom bridge daemons.

## Plant & traceability integration
Publish structured station summaries, timestamps, and revision IDs upstream through OPC UA, MQTT, or HTTP endpoints while keeping hard pass/fail I/O local.

## Watchdog & fault behavior
Define deterministic timeout defaults when a PLC peer disconnects or returns an unexpected ACK, and log protocol errors cleanly for 9-digit remote diagnostics if needed.
`,
`## 工业相机接入要点
VisionRuntime 支持标准 GenICam、GigE Vision 与 USB3 Vision 相机。联合调试前应先确认网卡巨帧配置、硬触发电平及心跳超时参数。

## 原生 PLC 与工业总线协议
内置 Siemens S7、Mitsubishi SLMP、Omron FINS、Modbus TCP/RTU 与 EtherNet/IP 通信模块，无需额外编写中间转换守护进程。

## 上层 MES 与追溯集成
可通过 OPC UA、MQTT 或 HTTP 向产线管理层上传工位统计、结果编号与工程快照版本，同时将实时合格/剔除判定留在本地执行。

## 看门狗与异常策略
集成前应约定 PLC 断开或应答超时时的默认保护态，并保留清晰的通信日志，便于后续通过 9 位码远程只读协助排查。
`],
  },
];

export const getResourceArticles = (locale: SupportedLocale = 'en'): ResourceArticle[] => entries.map(entry => {
  const index = locale === 'zh' ? 1 : 0;
  return {
    id: entry.slug,
    slug: entry.slug,
    type: entry.category === 'tutorial' ? 'Tutorial' : 'Article',
    category: entry.category,
    title: entry.title[index],
    summary: entry.summary[index],
    date: '2026-11-28',
    readTime: locale === 'zh' ? '约 4 分钟' : '4 min read',
    author: 'VISIONGO Engineering',
    tags: ['VisionStudio', 'VisionRuntime'],
    contentMarkdown: entry.content[index],
  };
});
export const RESOURCE_ARTICLES_EN = getResourceArticles('en');
export const RESOURCE_ARTICLES_ZH = getResourceArticles('zh');
