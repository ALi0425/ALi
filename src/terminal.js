/**
 * ═══════════════════════════════════════════
 *  State 03 — Safari-Style Modal
 *
 *  Left pane: browser mockup / project card
 *  Right pane: console details with syntax
 * ═══════════════════════════════════════════
 */

/* ── Project profiles ── */
const _BASE = import.meta.env.BASE_URL
const NODE_PROFILES = {
  a1: {
    title: 'OmniSight 知识图谱与蓝海分析',
    path: '~/projects/omnisight',
    tag: 'AI · 数据工程',
    metrics: ['n8n工作流编排', 'GraphRAG', 'LLM数据提取'],
    video: _BASE + 'o.webm',
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
    video: _BASE + 'rv.webm',
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
    tag: 'B端 · 科技管理应用',
    metrics: ['跨部门协同', '流程解构', '资产纳管'],
    video: _BASE + 'tm.webm',
    content: `● 项目定位
→ 面向国网信通 53 家二级单位，集"科研立项、成果转化、知识产权、奖励评定"于一体的集团级核心科技管理数字化解决方案（历经 3 期建设）。

● 产品定义
→ 纳管集团全量科研资产，构建涉及 20 余类复杂业务流的线上化全生命周期闭环系统，解决成果分散、进度难追踪及评定不规范等核心痛点。

● 核心突破
→ 场景识别与精准 MVP 定义：深度调研 10 家二级单位的核心科研团队，从零散、非结构化的线下业务中提炼出科研链路的深层痛点，科学定义 MVP 核心边界，成功实现集团首个科技综合管理平台的破局落地。
→ 非结构化知识资产纳管与复杂业务解构：全面梳理和拆解项目变更、成果登记、技术报告在线签批等 20+ 复杂业务流程，建立了科学的科技奖励评定指标模型，为集团搭建起坚实的企业级科技知识资产库底层架构。
→ 从 0 到 1 落地：独立完成并落地了科技项目管理、科技成果管理、科技奖励评定、专项管理、技术报告在线签批等核心功能模块的调研、原型与设计，并完成功能上线。

● 交付成果
→ 业务价值跃升：系统上线后成功纳管科研项目 2087 项、科研成果 17805 项，实现全流程 100% 线上化，将科技奖励评定周期缩短 40%，整体科研管理效率提升 60% 以上。
→ 行业核心荣誉：荣获 2021 电力科技管理创新成果一等奖。
→ 交付物：独立编制并交付《技术规范书》《项目标书》《需求说明书》《项目可行性研究报告》《系统用户手册》等 20 余套全套材料，推动项目 100% 按期通过国家级评审与验收。`,
  },
  b2: {
    title: '巡查问题在线管理',
    path: '~/projects/patrol',
    tag: 'B端 · 合规治理',
    metrics: ['合规双审', '人才分配', '全流程留痕'],
    video: _BASE + 'pb2.webm',
    content: `● 项目定位
→ 面向集团总部及多级二级单位，聚焦巡察问题全生命周期的数字化治理、智能任务流转与高合规性双审风控系统。

● 产品定义
→ 针对传统政企监督整改流转慢、流痕难、追责难的痛点，构建涵盖任务创建、跨部门人才自动化动态分配、问题下发及整改过程"双审双签"的闭环全链路管理平台。

● 核心突破
→ 闭环整改功能设计：在系统建设中，独立从 0 到 1 完成任务管理、人才信息管理、人才库管理、巡查问题管理、指标统计等 5 项一级功能的业务调研、产品原型设计与最终落地。
→ 端到端场景定义与全模块落地：独力承担并完成任务管理、动态人才库、多维指标统计等 5 大核心一级功能模块的深度业务调研与架构设计，打通了"问题发现-分配-整改-复核"的数字化闭环。

● 交付成果
→ 独立编制并交付《需求规格说明书》《业务流程白皮书》及《系统用户手册》等全套合规物料，成功支撑巡察问题数字化管理系统在多级跨地域单位间的高效高可靠运转。`,
  },
  b3: {
    title: '项目管理应用',
    path: '~/projects/project-mgmt',
    tag: 'B端 · 全生命周期',
    metrics: ['复杂业务解构', '跨系统数据集成', '53家单位'],
    video: _BASE + 'pm.webm',
    content: `● 项目定位
→ 面向国网信通 53 家二级单位、跨多业务板块协同的核心项目全生命周期管理解决方案。

● 产品定义
→ 支撑集团各类型项目的立项、进度、交付物、人员报工及结算全流程闭环。深度接入企业核心资产网，实现与营销、财务、物资、人资等多个大型异构系统（ERP）的高效协同与高并发数据互通。

● 核心突破
→ 复杂多维业务解构与核心逻辑重构：深入梳理集团全类型项目资金分摊、跨项目交叉报工、阶段性动态劳务报工等错综复杂的财务与人资业务规则；独立主导经营性项目与研发项目的"多对多"底层关联方案设计，成功攻坚并完成现有遗留系统核心底层逻辑的平滑重构。
→ 跨异构系统数据集成解决方案：针对项目系统与财务、物资、营销等多模块间的数据孤岛痛点，深度参与跨系统统一数据字典与接口规范的制定，设计了高内聚、低耦合的跨系统数据闭环流转机制，保障万级协同节点下的数据合规与全过程留痕。

● 交付成果
→ 系统全面上线：成功支撑 53 家二级单位的线上化规范运作，大幅提升了集团跨项目、跨单位人员劳务报工的结算效率。`,
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
            ${p.video
              ? `<div class="bb-image"><video autoplay loop muted playsinline preload="auto"></video></div>`
              : p.image
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

  // ── Video source picker ──
  function pickVideoSrc(webmSrc, mp4Src) {
    // Mobile: always MP4 (H.264 hardware decode, universal)
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile) return { src: mp4Src, type: 'video/mp4', label: 'MP4' }
    // Desktop: prefer WebM VP9 (better compression), fallback MP4
    const v = document.createElement('video')
    if (v.canPlayType('video/webm; codecs="vp9"')) {
      return { src: webmSrc, type: 'video/webm; codecs="vp9"', label: 'WebM' }
    }
    return { src: mp4Src, type: 'video/mp4', label: 'MP4' }
  }

  // Video: single source, simple retry
  _overlay.querySelectorAll('.bb-image video').forEach(v => {
    const container = v.closest('.bb-image') || v.parentElement
    if (!container) return

    const webmSrc = p.video
    if (!webmSrc) return
    const mp4Src = webmSrc.replace(/\.webm$/, '.mp4')

    // Create loading bar
    const loader = document.createElement('div')
    loader.className = 'bb-loader'
    loader.innerHTML = `
      <div class="bb-loader-bar"><div class="bb-loader-fill"></div></div>
      <span class="bb-loader-txt">加载中…</span>
    `
    container.appendChild(loader)
    const fill = loader.querySelector('.bb-loader-fill')
    fill.style.width = '0%'

    /* ── State ── */
    let _ready = false
    let _usedFormats = []   // track tried formats
    let _loadedSrc = null

    function setVideoSource(src) {
      _loadedSrc = src
      v.src = src
      v.load()
      // 立即请求播放（在用户手势上下文中），浏览器会等待足够数据后自动开始
      // Mobile Safari 要求 play() 必须在用户手势中调用，否则会被拦截
      v.play().catch(() => {
        // 浏览器暂时无法播放（数据还没加载完），canplay 事件会再试
      })
    }

    // Pick best format and load
    const firstPick = pickVideoSrc(webmSrc, mp4Src)
    _usedFormats.push(firstPick.label)
    setVideoSource(firstPick.src)

    /* ── Progress ── */
    let progressRaf = null
    function tickProgress() {
      if (v.buffered && v.buffered.length > 0 && v.duration) {
        const pct = Math.min(v.buffered.end(0) / v.duration * 100, 100)
        fill.style.width = pct + '%'
      }
      progressRaf = requestAnimationFrame(tickProgress)
    }
    v.addEventListener('loadstart', () => { progressRaf = requestAnimationFrame(tickProgress) }, { once: true })

    v.addEventListener('progress', () => {
      if (!v.buffered || !v.buffered.length || !v.duration) return
      fill.style.width = Math.min(v.buffered.end(0) / v.duration * 100, 100) + '%'
    })

    /* ── Can play: show video ── */
    v.addEventListener('canplay', () => {
      if (_ready) return
      _ready = true
      if (progressRaf) { cancelAnimationFrame(progressRaf); progressRaf = null }
      fill.style.width = '100%'
      v.classList.add('ready')
      setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 400) }, 200)
      v.play().catch(() => {})
    })

    /* ── Waiting during playback (not initial load) ── */
    let _hasPlayed = false
    v.addEventListener('playing', () => { _hasPlayed = true; loader.querySelector('.bb-loader-txt').textContent = '加载中…' })
    v.addEventListener('waiting', () => {
      if (_hasPlayed) loader.querySelector('.bb-loader-txt').textContent = '缓冲中…'
    })

    /* ── Error: retry with the other format ── */
    v.addEventListener('error', () => {
      if (progressRaf) { cancelAnimationFrame(progressRaf); progressRaf = null }
      if (_ready) return // already playing, ignore

      const alt = _loadedSrc === webmSrc ? mp4Src : webmSrc
      const altLabel = _loadedSrc === webmSrc ? 'MP4' : 'WebM'
      if (_usedFormats.includes(altLabel)) {
        showTextFallback(v, container, p, loader)
        return
      }
      _usedFormats.push(altLabel)
      loader.querySelector('.bb-loader-txt').textContent = '切换格式…'
      fill.style.width = '0%'
      setVideoSource(alt)
    })
  })

  /**
   * Show text fallback when video fails completely.
   */
  function showTextFallback(videoEl, container, project, loaderEl) {
    if (loaderEl) loaderEl.remove()
    videoEl.remove()
    const browser = container.closest('.tt-browser')
    if (!browser) return
    const fallback = document.createElement('div')
    fallback.className = 'bb-content'
    fallback.innerHTML = `
      <div class="bb-title">${esc(project.title)}</div>
      <div class="bb-divider"></div>
      <div class="bb-metrics">
        ${(project.metrics || []).map(m => `<span class="bb-metric">◈ ${esc(m)}</span>`).join('')}
      </div>
    `
    container.replaceWith(fallback)
  }

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
