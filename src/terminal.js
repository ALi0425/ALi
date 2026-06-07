/**
 * ═══════════════════════════════════════════
 *  State 03 — macOS Terminal Panel
 *
 *  Click a floating card → terminal drops from top
 *  showing real descriptive text (not code).
 * ═══════════════════════════════════════════
 */

/* ── Descriptive content per node key ── */
const NODE_PROFILES = {
  jj: {
    title: '李晶晶 — 核心档案',
    path: '~/profile/core_summary',
    content: `李晶晶 · AI 产品经理
北京市顺义区 | 27岁 | 本科

四年企业级 B 端系统与 LLM 落地产品经验。
兼具大厂正规军交付与 AI 辅助全栈交付双重视角。

教育背景
  华北理工大学 · 工商管理学士（专业前 15%）
  校级一等/三等奖学金 · 优秀大学生
  发表学术论文 4 篇

商赛荣誉
  玛氏箭牌「垃圾投进趣」全国前 50 强
  欧莱雅工业商赛 全国前 400 强

核心能力
  · n8n 工作流编排 · GraphRAG 双库分流
  · 复杂低代码平台架构 · Canvas 动态画布设计
  · 大模型 JSON Mode Schema 校验

代表项目
  · OmniSight — 企业级资产全景透视系统
  · RARE — 智能需求审核与逆向平台
  · 科技管理系统（一/二/三期）国家电网`,
  },
  a1: {
    title: 'OmniSight 策略导航',
    path: '~/projects/omnisight/README.md',
    content: `OmniSight — 企业级通用资产全景透视与策略导航系统
AI 辅助独立全栈开发

核心架构
  · 多模态增量清洗流（Event-driven）
    基于 n8n 搭建自动化清洗线
    适配 PDF / Word / 图片等多格式
    MD5 前置哈希查重 → 算力熔断防线
    单次资产处理 Unit Cost ≤ 0.2 元

  · GraphRAG 双库分流
    语义层：PostgreSQL 向量表（递归字符切片）
    关系层：JSON Mode 三元组（Few-Shot 提取 + Schema 拦截净化）

  · 定时情报抓取流（Time-driven）
    Cron 每日凌晨异步抓取 arXiv / 行业新闻 / 公开财报
    INTERNAL 影子数据与 EXTERNAL 物理隔离

  · 技术差距分析画布
    ECharts 力引导拓扑图 + 资产词云
    红蓝双色染色：深蓝＝资产热区，暗红＝战略盲区

  · 智能策略导航
    点击红色盲区节点 → 混合检索捞取外部趋势
    自动生成《行业空白领域抢滩行动建议书》0-100 评分`,
  },
  a2: {
    title: 'RARE 智能逆向平台',
    path: '~/projects/rare/README.md',
    content: `RARE — 智能需求审核与逆向系统资产管理平台
AI 辅助独立全栈开发
针对大型遗留系统「文档缺失、代码断层」的 AI4SE 效能工具

核心架构
  · 低代码元数据逆向解析
    LLM 深度解析遗留系统元数据与架构拓扑
    打破新旧系统交替时的代码黑盒

  · 嵌套交互画布
    ComfyUI/Retool 风格多层动态画布
    输入新需求描述 → 自动翻译为结构化算子
    红绿染色（Canvas Diff）直观预警全局冲击

  · 线性快照与版本一致性管理
    每次系统快照生成唯一 Commit_ID
    支持全量一键回溯至任意历史版本

  · 智能交互与文档推演
    画布拖拽连线反向修改需求逻辑
    LLM 实时重写 → 一键导出
    《业务需求规格说明书》《软件需求规格说明书》`,
  },
  b1: {
    title: '科技管理 一/二期',
    path: '~/projects/tech-mgmt-v1/summary',
    content: `科技管理系统 — 一期/二期
中电伟恒（北京）科技发展有限公司 | 产品经理 | 2021.8 - 2023.10

项目背景
  为国电网信通集团设计并交付两期科技管理系统
  协调 6+ 跨部门资源，深度调研 10 家二级单位科研团队

业务成果
  · 提炼「项目进度难追踪、成果分散」等核心痛点
  · 定义 MVP 功能范围：4 大业务模块
  · 拆解 20+ 复杂业务流程

商业效果
  · 纳管科研项目 1,693 项
  · 纳管科研成果 12,805 项
  · 全流程 100% 线上化
  · 科技奖励评定周期缩短 40%
  · 整体科研管理效率提升 60%+

行业荣誉
  2021 电力科技管理创新成果一等奖
  凭借《科研项目「网状」管理研究》论文及创新架构`,
  },
  b2: {
    title: '科技管理 应用三期',
    path: '~/projects/tech-mgmt-v3/summary',
    content: `科技管理系统 — 三期
中电伟恒（北京）科技发展有限公司 | 产品经理 | 2023.10 - 至今

项目概述
  集团核心科技管理应用三期建设
  万级数据量的大型系统全生命周期管理

职责与成果
  · 独立完成 6 项一级功能模块从 0 到 1 落地
    技术报告在线签批 / 专项管理 / 科技项目报工
    问题整改双审 / 人才信息管理 / 人才库管理

  · 覆盖 14 家二级单位协同
  · 万级数据高效协同处理

正规军交付物
  · 《技术规范书》《项目标书》
  · 《需求说明书》《可行性研究报告》
  · 《系统用户手册》
  · 全套过程文档，100% 按期通过国家级评审与验收`,
  },
  doc: {
    title: '大厂正规军交付物',
    path: '~/projects/deliverables/catalog',
    content: `正规军过程文档交付索引

作为主笔人独立编制的全套国家级评审材料：

  1. 技术规范书（280 页）
    系统技术架构 · 接口规范 · 安全标准

  2. 可行性研究报告（156 页）
    技术可行性 · 经济效益分析 · 风险控制

  3. 需求规格说明书（320 页）
    业务需求 · 功能需求 · 数据需求

  4. 系统用户手册（180 页）
    操作指南 · 常见问题 · 维护手册

  5. 项目标书
    技术方案 · 实施计划 · 报价明细

交付质量
  推动项目 100% 高质量按期验收
  全部通过国家级评审`,
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
  const profileMap = { a1: 'a1', a2: 'a2', b1: 'b1', b2: 'b2', doc: 'doc' }
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
