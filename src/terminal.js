/**
 * ═══════════════════════════════════════════
 *  State 03 — Safari-Style Modal
 *
 *  Left pane: browser mockup / project card
 *  Right pane: console details with syntax
 * ═══════════════════════════════════════════
 */

/* ── Project profiles ── */
const NODE_PROFILES = {
  a1: {
    title: 'OmniSight 知识图谱与蓝海分析',
    path: '~/projects/omnisight',
    tag: 'AI · 数据工程',
    metrics: ['n8n工作流编排', 'GraphRAG', 'LLM数据提取'],
    content: `● 项目定位
→ 面向企业高层的通用型大模型资产盘点与战略决策导航系统

● 产品定义
→ 基于 n8n 的双驱动数据治理流水线，集成自动化数据多模态清洗、外部情报异步抓取与红蓝双色拓扑染色交互，旨在盘点内部资产并识别外部战略盲区。

● 核心突破
→ 自动化清洗与防浪费熔断：基于 n8n 搭建自动化多模态增量清洗线，适配 PDF/Word/图片等格式。引入 MD5 前置哈希查重熔断防线，历史已解析文档直接熔断，避免算力浪费与向量库污染。
→ GraphRAG 双库分流架构：语义层通过递归字符切片将文本向量化写入 PostgreSQL 向量表；关系层调用大模型提取文本核心三元组关系，经 Schema 拦截净化后存入关系表。
→ 外部数据定时获取：在 n8n 中配置单独工作流，每日凌晨异步抓取行业前沿公开数据（arXiv、行业新闻 RSS、公开财报），存入外部数据资产库。
→ 红蓝双色染色交互画布：前端基于 ECharts 渲染力引导网络拓扑图与资产词云。深蓝为资产热区，暗红为战略盲区。

● 交付成果
→ 实现智能决策闭环，用户点击红色盲区节点可自动触发混合检索并捞取外部趋势。`,
  },
  a2: {
    title: 'RARE 逆向资产与智能评估',
    path: '~/projects/rare',
    tag: 'AI4SE · 逆向工程',
    metrics: ['元数据逆向解析', '嵌套交互画布', 'LLM智能评估'],
    content: `● 项目定位
→ 针对大型遗留系统"文档缺失、代码断层、需求变更影响面难评估"的 AI4SE 效能工具。

● 产品定义
→ 基于 AIGC 逆向工程流水线的多层嵌套交互画布系统，通过将需求描述翻译为结构化算子，实现代码黑盒解构、变更冲击预警以及需求与代码的双向自动推演。

● 核心突破
→ 低代码元数据逆向解析：大模型深度解析遗留系统的复杂元数据与底层架构拓扑，打破新旧系统交替时的代码黑盒。
→ 解析数据复核与纠正：前端构建类似 ComfyUI/Retool 的多层嵌套动态交互画布，用户对大模型解析的数据以拖动节点形式审核纠正后入库。
→ 智能需求评审与展示：画布根据缩放展示不同层级数据。输入框输入新需求描述，系统自动翻译为结构化算子，在对应模块下显示修改内容。
→ 画布动态更新：评估后的需求确认后可入库，触发向量同步与全局图谱认知工作流。

● 交付成果
→ 构建了可视化的嵌套交互画布，打破代码黑盒。`,
  },
  b1: {
    title: '科技管理应用',
    path: '~/projects/tech-mgmt',
    tag: 'B端 · 国网信通',
    metrics: ['跨部门协同', '流程解构', '资产纳管'],
    content: `● 项目定位
→ 面向国网信通的万级数据量、53家单位协同的大型信息化核心科技管理系统。

● 产品定义
→ 涵盖科技项目、成果、奖励、查询统计四大业务模块，共计3期的全流程线上化闭环系统架构。

● 核心突破
→ 痛点提炼与 MVP 定义：深度调研 10 家二级单位科研团队，精准提炼核心痛点，科学定义 MVP 功能范围。
→ 复杂业务流程拆解：梳理 4 大业务模块，成功拆解 20+ 复杂业务流程。
→ 一级核心模块从 0 到 1 落地：独立完成科技项目管理、科技成果管理、科技奖励评定、专项管理、技术报告在线签批等核心模块的调研、原型与设计。

● 交付成果
→ 纳管科研项目 2087 项、科研成果 17805 项。全流程 100% 线上化，评定周期缩短 40%，效率提升 60%+。荣获 2021 电力科技管理创新成果一等奖。`,
  },
  b2: {
    title: '巡查问题在线管理',
    path: '~/projects/patrol',
    tag: 'B端 · 合规治理',
    metrics: ['合规双审', '人才分配', '全流程留痕'],
    image: '/project-b2.png',
    content: `● 项目定位
→ 聚焦巡察问题全生命周期的数字化与合规化双审治理，面向集团万级数据量大型系统。

● 产品定义
→ 针对大型信息化系统中的监督整改痛点，支撑巡查问题从创建任务、自动分配人才到问题下发、整改过程双审监督全流程线上化。

● 核心突破
→ 闭环整改功能设计：独立从 0 到 1 完成任务管理、人才信息管理、人才库管理、巡查问题管理、指标统计等5项一级功能的业务调研、产品原型设计与最终落地。
→ 合规性流程抽象：将传统线下的双审与巡察流转逻辑抽象为线上高容错的合规系统，保障数据在万级数据量的大型系统中做到全过程留痕。

● 交付成果
→ 独立编制全套规范材料，成功支撑巡察问题数字化管理系统在多级单位间的协同运转。`,
  },
  b3: {
    title: '项目管理应用',
    path: '~/projects/project-mgmt',
    tag: 'B端 · 全生命周期',
    metrics: ['业务解构', '权限划分', '多模块集成'],
    content: `● 项目定位
→ 面向企业大型系统万级数据量，涵盖全类型项目全生命周期管理。

● 产品定义
→ 支撑53家单位进行项目立项、进度管理、交付物管理、人员报工、结算等业务操作，并与营销、财务、物资、人资等模块高度协同。

● 核心突破
→ 复杂业务解构：负责全类型项目分摊与跨项目报工、阶段性劳务报工管理、经营性项目关联研发项目等相关需求梳理与方案产出，涉及现有系统逻辑重构。`,
  },
}

const FALLBACK = { title: '未知项目', path: '~/projects/unknown', tag: '', metrics: [], content: '项目详情暂不可用' }

let _overlay = null
let _active  = false

export function openTerminal(key) {
  if (_active) { closeTerminal(); return }
  const map = { a1: 'a1', a2: 'a2', b1: 'b1', b2: 'b2', b3: 'b3' }
  const p = NODE_PROFILES[map[key]] || NODE_PROFILES.a1
  ensureOverlay()
  render(p)
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
  if (_overlay) { _overlay.innerHTML = ''; return }
  _overlay = document.createElement('div')
  _overlay.id = 'terminal-overlay'
  document.body.appendChild(_overlay)
}

function render(p) {
  _overlay.innerHTML = `
    <!-- backdrop -->
    <div class="tt-backdrop"></div>
    <!-- window -->
    <div class="tt-window">
      <!-- title bar -->
      <div class="tt-titlebar">
        <div class="tt-dots">
          <span class="tt-dot red" id="tt-close"></span>
          <span class="tt-dot yellow"></span>
          <span class="tt-dot green"></span>
        </div>
        <div class="tt-path">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span>${p.path}</span>
        </div>
        <div class="tt-tag">${p.tag}</div>
      </div>
      <!-- body: split -->
      <div class="tt-body">
        <!-- LEFT: browser‑like card -->
        <div class="tt-left">
          <div class="tt-browser">
            <div class="bb-bar">
              <div class="bb-url"><span class="bb-lock">🔒</span>${p.title}</div>
            </div>
            ${p.image
              ? `<div class="bb-image"><img src="${p.image}" alt="${p.title}" /></div>`
              : `<div class="bb-content">
                  <div class="bb-title">${p.title}</div>
                  <div class="bb-divider"></div>
                  <div class="bb-metrics">
                    ${p.metrics.map(m => `<span class="bb-metric">◈ ${m}</span>`).join('')}
                  </div>
                  <div class="bb-footer">
                    <span class="bb-blink">▍</span>
                    <span class="bb-status">module_loaded · ready</span>
                  </div>
                </div>`
            }
          </div>
        </div>
        <!-- RIGHT: console details -->
        <div class="tt-right">
          <div class="tt-console">
            <div class="console-line">
              <span class="cl-prompt">❯</span>
              <span class="cl-cmd">cat ${p.path}/README.md</span>
            </div>
            <div class="console-body">
              <div class="cl-project-name">${p.title}</div>
              ${renderContent(p.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // Close
  _overlay.querySelector('#tt-close').addEventListener('click', closeTerminal)
  _overlay.querySelector('.tt-backdrop').addEventListener('click', closeTerminal)
}

/* ── Render content ── */
function renderContent(text) {
  const lines = text.split('\n')
  return lines.map(line => {
    const t = line.trim()
    if (!t) return '<div class="cl-empty"></div>'
    // Section headers: 【X】 or ● X
    if (t.startsWith('【')) {
      return `<div class="cl-section"><span class="cl-dot">●</span> ${esc(t.replace(/[【】]/g, ''))}</div>`
    }
    if (t.startsWith('●')) {
      return `<div class="cl-section"><span class="cl-dot">●</span> ${esc(t.slice(1).trim())}</div>`
    }
    // Bullets →
    if (t.startsWith('→')) {
      return `<div class="cl-bullet"><span class="cl-arrow">→</span>${esc(t.slice(1).trim())}</div>`
    }
    // Metrics / numbers
    if (/\d+%/.test(t) || /\d+ 项/.test(t) || /^\d+/.test(t)) {
      return `<div class="cl-highlight">${esc(t)}</div>`
    }
    return `<div class="cl-line">${esc(t)}</div>`
  }).join('')
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
