/**
 * ═══════════════════════════════════════════
 *  State 03 — macOS Terminal Panel
 *
 *  Click a floating card → terminal panel drops
 *  from top with macOS traffic-light dots.
 * ═══════════════════════════════════════════
 */

/* ── Capability & terminal content per node key ── */
const NODE_PROFILES = {
  a1: {
    title: 'OmniSight 策略导航',
    path: '~/projects/omnisight/architecture.tsx',
    capabilities: ['n8n工作流自动化', 'GraphRAG双库分流', 'JSON Mode提取'],
    code: `// OmniSight — 企业级资产全景透视系统
// 多模态增量清洗流 (Event-driven)

interface AssetIngestionPipeline {
  md5Hash: string;       // 前置哈希查重熔断
  unitCost: number;      // ≤ 0.2 元/次
}

type GraphRAG = {
  semantic: VectorStore;  // PostgreSQL 向量表
  relational: RelationDB; // JSON Mode 三元组
}

const strategy = await Navigator.analyze({
  blindSpots: GraphRAG.gapAnalysis(),
  external: EXTERNAL_SHADOW_DATA,
});

console.log(\`破局可行性评分: \${strategy.score}/100\`);`,
  },

  a2: {
    title: 'RARE 智能逆向',
    path: '~/projects/rare/canvas_diff.tsx',
    capabilities: ['元数据逆向解析', '嵌套交互画布', '强Schema校验'],
    code: `// RARE — 智能需求审核与逆向系统
// 低代码元数据逆向解析流水线

interface LegacySystem {
  metadata: unknown;      // 遗留系统元数据
  topology: Graph;        // 底层架构拓扑
}

class CanvasDiff {
  // 红绿染色预警
  diff(newRequirement: Req): Impact {
    return {
      menus: 'red',       // #EF4444/20
      services: 'green',  // #22C55E/20
      permissions: 'red',
    };
  }

  // 线性快照回滚
  rollback(commitId: string): Snapshot {
    return Snapshots.findById(commitId);
  }
}`,
  },

  b1: {
    title: '科技管理 一/二期',
    path: '~/projects/tech-mgmt-v1/sprint-dashboard.ts',
    capabilities: ['20+业务流程拆解', '纳管12805项成果', '效率提升60%+'],
    code: `// 科技管理系统 — 一期/二期
// 业务流程拆解与MVP定义

const DEPARTMENTS = 10;  // 二级单位
const MODULES = [
  '项目进度追踪',
  '成果管理',
  '科技奖励评定',
  '查询统计',
];

const results = await deploy({
  projects: 1693,
  achievements: 12805,
  onlineRate: '100%',
});

console.log(\`评定周期缩短: 40%\`);
console.log(\`管理效率提升: 60%+\`);`,
  },

  b2: {
    title: '科技管理 应用三期',
    path: '~/projects/tech-mgmt-v3/scale-architecture.ts',
    capabilities: ['万级数据高效协同', '14家二级单位协同'],
    code: `// 科技管理系统 — 三期
// 万级数据协同架构

interface CollaborativeNode {
  unitId: string;        // 14家二级单位
  dataVolume: '10k+';
  sync: RealtimeChannel;
}

const platform = new SyncPlatform({
  nodes: 14,
  consistency: 'eventual',
  conflictResolver: 'LWW',
});

// 新需求冲击评估
const impact = CanvasDiff.analyze(requirement);
// 染色预警: 菜单/服务/权限`,
  },

  doc: {
    title: '大厂正规军交付物',
    path: '~/projects/deliverables/spec-index.ts',
    capabilities: ['技术规范书', '可行性研究报告', '需规说明书'],
    code: `// 正规军交付物索引
// 全过程结构化文档

const DELIVERABLES = [
  {
    type: '技术规范书',
    status: '国家级评审通过',
    pages: 280,
  },
  {
    type: '可行性研究报告',
    status: '100%按期验收',
    pages: 156,
  },
  {
    type: '需求规格说明书',
    status: '甲方确认签章',
    pages: 320,
  },
  {
    type: '系统用户手册',
    status: '已归档',
    pages: 180,
  },
];

// 推动项目100%高质量按期验收`,
  },
}

/* ── Fallback profile ── */
const FALLBACK_PROFILE = {
  title: '未知项目',
  path: '~/projects/unknown',
  capabilities: ['信息加载中…'],
  code: '// 项目详情暂不可用',
}

/* ── Module state ── */
let _overlay = null
let _active  = false

/**
 * Open terminal panel for a given node key.
 */
export function openTerminal(key) {
  if (_active) { closeTerminal(); return }

  const profile = NODE_PROFILES[key] || FALLBACK_PROFILE
  ensureOverlay()

  // Set content
  const pathEl = _overlay.querySelector('.terminal-path')
  if (pathEl) pathEl.textContent = profile.path

  const body = _overlay.querySelector('.terminal-body')
  if (body) {
    // Build code lines with line numbers
    const lines = profile.code.split('\n')
    body.innerHTML = lines
      .map((line, i) => {
        const lineNum = String(i + 1).padStart(3, ' ')
        return `<div><span class="line-number">${lineNum}</span>${highlightLine(line)}</div>`
      })
      .join('')
  }

  // Show
  document.body.style.overflow = 'hidden'
  _overlay.classList.add('active')
  _active = true
}

/**
 * Close terminal panel.
 */
export function closeTerminal() {
  if (!_overlay || !_active) return
  _overlay.classList.remove('active')
  _active = false
  document.body.style.overflow = ''
}

/**
 * Create overlay DOM once.
 */
function ensureOverlay() {
  if (_overlay) return

  _overlay = document.createElement('div')
  _overlay.id = 'terminal-overlay'

  // Dark backdrop (click to close)
  const backdrop = document.createElement('div')
  backdrop.className = 'absolute inset-0 bg-black/40'
  backdrop.addEventListener('click', closeTerminal)

  // Panel
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

  // Red dot → close terminal
  panel.querySelector('#terminal-close').addEventListener('click', closeTerminal)

  _overlay.appendChild(backdrop)
  _overlay.appendChild(panel)
  document.body.appendChild(_overlay)
}

/**
 * Simple syntax highlighting for TypeScript-like code.
 */
function highlightLine(line) {
  if (!line.trim()) return '&nbsp;'

  // Comment
  if (line.trim().startsWith('//')) {
    return `<span class="comment">${escapeHtml(line)}</span>`
  }

  let html = escapeHtml(line)

  // Keywords
  const keywords = /\b(const|let|var|function|return|if|else|for|of|interface|type|class|new|await|async|import|export|default|console|typeof|keyof)\b/g
  html = html.replace(keywords, '<span class="keyword">$1</span>')

  // Types (PascalCase)
  html = html.replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, (match) => {
    if (['CanvasDiff', 'Navigator', 'GraphRAG', 'VectorStore', 'RelationDB', 'SyncPlatform', 'RealtimeChannel', 'Snapshot', 'Graph'].includes(match)) {
      return `<span class="type">${match}</span>`
    }
    return match
  })

  // Numbers
  html = html.replace(/\b(\d+[\d.]*)\b/g, '<span class="keyword">$1</span>')

  // Strings
  html = html.replace(/`([^`]*)`/g, '<span class="string">`$1`</span>')
  html = html.replace(/'([^']*)'/g, "<span class=\"string\">'$1'</span>")
  html = html.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')

  return html
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
