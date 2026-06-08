/**
 * ═══════════════════════════════════════════
 *  State 03 — macOS Terminal Panel
 *
 *  Click a floating card → terminal drops from top
 *  showing real descriptive text (not code).
 * ═══════════════════════════════════════════
 */

/* ── Project profiles from 项目经历.xlsx ── */
const NODE_PROFILES = {
  a1: {
    title: 'OmniSight 知识图谱与蓝海分析',
    path: '~/projects/omnisight/README.md',
    content: `【项目定位】
面向企业高层的通用型大模型资产盘点与战略决策导航系统

【产品定义】
基于 n8n 的双驱动数据治理流水线，集成自动化数据多模态清洗、外部情报异步抓取与红蓝双色拓扑染色交互，旨在盘点内部资产并识别外部战略盲区。

【核心突破】
自动化清洗与防浪费熔断
  基于 n8n 搭建自动化多模态增量清洗线，适配 PDF/Word/图片等格式。
  引入 MD5 前置哈希查重熔断防线，历史已解析文档直接熔断，避免算力浪费与向量库污染。

GraphRAG 双库分流架构
  语义层：通过递归字符切片将文本向量化写入 PostgreSQL 向量表，用于语义检索。
  关系层：调用大模型，通过提示词工程提取文本核心三元组关系，经 Schema 拦截净化后存入关系表。

外部数据定时获取
  在 n8n 中配置单独工作流，根据内部数据提取关键词，每日凌晨异步抓取行业前沿公开数据（arXiv、行业新闻 RSS、公开财报），存入外部数据资产库。

红蓝双色染色交互画布
  前端基于 ECharts 渲染力引导网络拓扑图与资产词云。
  红蓝双色染色交互，多数据强支撑方向染为深蓝（资产热区），外部有而内部空白的方向染为暗红（战略盲区）。

【交付成果】
实现智能决策闭环，用户点击红色盲区节点可自动触发混合检索并捞取外部趋势，由高阶 LLM 自动生成结构化的资产技术分析。`,
  },
  a2: {
    title: 'RARE 逆向资产与智能评估',
    path: '~/projects/rare/README.md',
    content: `【项目定位】
针对大型遗留系统"文档缺失、代码断层、需求变更影响面难评估"的 AI4SE（AI 驱动软件工程）效能工具。

【产品定义】
基于 AIGC 逆向工程流水线的多层嵌套交互画布系统，通过将需求描述翻译为结构化算子，实现代码黑盒解构、变更冲击预警以及需求与代码的双向自动推演。

【核心突破】
低代码元数据逆向解析
  主导设计 AIGC 逆向工程流水线，由大模型深度解析遗留系统的复杂元数据与底层架构拓扑，打破新旧系统交替时的代码黑盒。

解析数据复核与纠正
  前端构建类似 ComfyUI/Retool 的多层嵌套动态交互画布，用户对于大模型解析的数据以拖动节点的形式进行审核纠正后入库，为数据解析的准确性增加一道防线。

智能需求评审与展示
  画布根据缩放展示不同的层级数据。用户在输入框输入新需求描述，系统自动将其翻译为结构化算子，并在画布上对应模块下显示修改内容，评估出需求所影响的现有数据。

画布动态更新
  评估后的需求用户确认后可入库，且触发向量同步与全局图谱认知工作流，画布更新为最新的数据并展示。

【交付成果】
构建了可视化的嵌套交互画布，打破了新旧系统交替时的代码黑盒。`,
  },
  b1: {
    title: '科技管理应用',
    path: '~/projects/tech-mgmt-v1/summary',
    content: `【项目定位】
面向国网信通的万级数据量、53家单位协同的大型信息化核心科技管理系统。

【产品定义】
涵盖科技项目、成果、奖励、查询统计四大业务模块，共计3期的全流程线上化闭环系统架构。

【核心突破】
痛点提炼与 MVP 定义
  深度调研 10 家二级单位科研团队，精准提炼出"项目进度难追踪、成果分散、奖励评定不规范"等核心痛点，科学定义 MVP 功能范围。

复杂业务流程拆解
  梳理 4 大业务模块，成功拆解 20+ 复杂业务流程。

一级核心模块从 0 到 1 落地
  独立完成并落地了科技项目管理、科技成果管理、科技奖励评定、专项管理、技术报告在线签批等核心功能模块的调研、原型与设计，并完成功能上线。

【交付成果】
  纳管科研项目 2087 项、科研成果 17805 项
  全流程 100% 线上化
  科技奖励评定周期缩短 40%
  科研管理效率提升 60% 以上
  荣获 2021 电力科技管理创新成果一等奖
  独立编制全套国家级评审材料`,
  },
  b2: {
    title: '巡查问题在线管理',
    path: '~/projects/patrol-management/README.md',
    content: `【项目定位】
面向集团万级数据量大型系统，聚焦巡察问题全生命周期的数字化与合规化双审治理。

【产品定义】
针对大型信息化系统中的监督整改痛点，支撑巡查问题从创建任务、自动分配人才到问题下发、整改过程双审监督全流程线上化，实现问题整改的高效流转、闭环监督与合规管控。

【核心突破】
闭环整改功能设计
  独立从 0 到 1 完成任务管理、人才信息管理、人才库管理、巡查问题管理、指标统计等 5 项一级功能的业务调研、产品原型设计与最终落地。

合规性流程抽象
  将传统线下的双审与巡察流转逻辑抽象为线上高容错的合规系统，保障数据在万级数据量的大型系统中做到全过程留痕。

【交付成果】
  独立编制《需求说明书》《可行性研究报告》《系统用户手册》
  成功支撑巡察问题数字化管理系统在多级单位间的协同运转`,
  },
  b3: {
    title: '项目管理应用',
    path: '~/projects/project-management/README.md',
    content: `【项目定位】
面向企业大型系统万级数据量，涵盖全类型项目全生命周期管理。

【产品定义】
支撑53家单位进行项目立项、进度管理、交付物管理、人员报工、结算等业务操作，并与营销、财务、物资、人资等模块高度协同。

【核心突破】
复杂业务解构
  负责全类型项目分摊与跨项目报工、阶段性劳务报工管理、经营性项目关联研发项目等相关需求梳理与方案产出，涉及现有系统逻辑重构。`,
  },
}

const FALLBACK_PROFILE = {
  title: '未知项目',
  path: '~/projects/unknown',
  content: '项目详情暂不可用',
}

let _overlay = null
let _active  = false

export function openTerminal(key) {
  if (_active) { closeTerminal(); return }

  // Map node keys to profiles
  const profileMap = { a1: 'a1', a2: 'a2', b1: 'b1', b2: 'b2', b3: 'b3' }
  const profileKey = profileMap[key]
  const profile = profileKey ? NODE_PROFILES[profileKey] : NODE_PROFILES.jj

  if (!profile) { closeTerminal(); return }

  ensureOverlay()

  const pathEl = _overlay.querySelector('.terminal-path')
  if (pathEl) pathEl.textContent = profile.path

  const body = _overlay.querySelector('.terminal-body')
  if (body) {
    body.innerHTML = ''
    const lines = profile.content.split('\n')
    lines.forEach((line, i) => {
      const lineNum = String(i + 1).padStart(3, ' ')
      const row = document.createElement('div')
      row.innerHTML = `<span class="line-number">${lineNum}</span>${renderLine(line)}`
      body.appendChild(row)
    })
  }

  document.body.style.overflow = 'hidden'
  _overlay.classList.add('active')
  _active = true
}

export function closeTerminal() {
  if (!_overlay || !_active) return
  _overlay.classList.remove('active')
  _active = false
  document.body.style.overflow = ''
}

function ensureOverlay() {
  if (_overlay) return

  _overlay = document.createElement('div')
  _overlay.id = 'terminal-overlay'

  const backdrop = document.createElement('div')
  backdrop.className = 'absolute inset-0 bg-black/40'
  backdrop.addEventListener('click', closeTerminal)

  const panel = document.createElement('div')
  panel.id = 'terminal-panel'

  panel.innerHTML = `
    <div class="terminal-titlebar">
      <span class="terminal-dot red" id="terminal-close"></span>
      <span class="terminal-dot yellow"></span>
      <span class="terminal-dot green"></span>
      <span class="terminal-path"></span>
    </div>
    <div class="terminal-content">
      <div class="terminal-body"></div>
    </div>
  `

  panel.querySelector('#terminal-close').addEventListener('click', closeTerminal)

  _overlay.appendChild(backdrop)
  _overlay.appendChild(panel)
  document.body.appendChild(_overlay)
}

function renderLine(line) {
  if (!line.trim()) return '&nbsp;'

  // Headers: lines starting with 2+ spaces followed by · or 数字.
  const headerMatch = line.match(/^(\s{2,})([·\d])/)
  if (!headerMatch && line.trim().startsWith('·')) {
    return `<span style="color:rgba(255,255,255,0.7)">${escapeHtml(line)}</span>`
  }

  // Section headers (lines with 项目名称： prefix or all caps)
  if (line.trim().startsWith('李晶晶') || line.trim().startsWith('OmniSight') ||
      line.trim().startsWith('RARE') || line.trim().startsWith('科技管理') ||
      line.trim().startsWith('大厂正规军') || line.trim().startsWith('四')) {
    return `<span style="color:#22c55e;font-weight:600">${escapeHtml(line)}</span>`
  }

  // Bullet points
  if (line.trim().startsWith('·') || line.trim().startsWith('  ·')) {
    return `<span style="color:rgba(34,197,94,0.8)">${escapeHtml(line)}</span>`
  }

  // Numbers / metrics
  if (/\d+%/.test(line) || /\d+,\d+/.test(line) || /[0-9]/.test(line) && line.trim().length < 30) {
    return `<span style="color:rgba(255,255,255,0.8)">${escapeHtml(line)}</span>`
  }

  return `<span style="color:rgba(255,255,255,0.55)">${escapeHtml(line)}</span>`
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
