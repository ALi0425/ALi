/**
 * ═══════════════════════════════════════════
 *  State 04 — Safari Window + Canvas Diff + 0 Token
 *
 *  Drops from center when sufficient connections made.
 *  Apple-style browser mockup with Canvas Diff
 *  red/green impact visualization.
 * ═══════════════════════════════════════════
 */

import { getState, STATES } from './state.js'

/* ── Token security state ── */
let _tokenUnlocked = false
let _queryCount    = 0
const MAX_QUERIES  = 2

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

export function initSafari() {
  // Listen for connections-ready event
  document.addEventListener('connections-ready', () => {
    setTimeout(openSafari, 600)
  })
}

/* ═══════════════════════════════════════
   OPEN SAFARI WINDOW
   ═══════════════════════════════════════ */

function openSafari() {
  if (document.getElementById('safari-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'safari-overlay'

  // Backdrop
  const backdrop = document.createElement('div')
  backdrop.className = 'safari-backdrop'
  backdrop.addEventListener('click', closeSafari)

  // Window
  const win = document.createElement('div')
  win.className = 'safari-window'
  win.innerHTML = safariHTML()

  overlay.appendChild(backdrop)
  overlay.appendChild(win)
  document.body.appendChild(overlay)

  // Animate in after paint
  requestAnimationFrame(() => {
    overlay.classList.add('active')
  })

  // Wire diff selection
  win.querySelectorAll('.diff-item').forEach(item => {
    item.addEventListener('click', () => {
      win.querySelectorAll('.diff-item').forEach(i => i.classList.remove('selected'))
      item.classList.add('selected')
      const target = item.dataset.target
      showDiff(target, win)
    })
  })

  // Wire token unlock
  const unlockBtn = win.querySelector('.token-unlock-btn')
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      _tokenUnlocked = true
      unlockBtn.textContent = '🔓 算力已解锁'
      unlockBtn.classList.add('unlocked')
      win.querySelector('.token-status').textContent = 'COMPUTE: UNAUTHORIZED — 0 TOKEN'
      win.querySelector('.token-status').style.color = '#22c55e'
    })
  }

  // Wire query input (rate limited)
  const queryInput = win.querySelector('.query-input')
  const queryBtn = win.querySelector('.query-btn')
  if (queryInput && queryBtn) {
    const doQuery = () => {
      if (!_tokenUnlocked) {
        win.querySelector('.query-result').textContent = '⛔ 请先解锁算力'
        return
      }
      if (_queryCount >= MAX_QUERIES) {
        win.querySelector('.query-result').textContent = '🔥 24h 限流熔断：已达 2/2 次上限'
        win.querySelector('.query-result').style.color = '#FF5500'
        return
      }
      _queryCount++
      win.querySelector('.query-result').textContent =
        `✅ 模拟执行完成 (${_queryCount}/${MAX_QUERIES}) — Token 消耗: 0`
      win.querySelector('.query-result').style.color = '#22c55e'
    }
    queryBtn.addEventListener('click', doQuery)
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doQuery()
    })
  }
}

function closeSafari() {
  const overlay = document.getElementById('safari-overlay')
  if (overlay) {
    overlay.classList.remove('active')
    setTimeout(() => overlay.remove(), 600)
  }
}

/* ═══════════════════════════════════════
   SAFARI HTML
   ═══════════════════════════════════════ */

function safariHTML() {
  return `
    <div class="safari-titlebar">
      <span class="safari-dot red"></span>
      <span class="safari-dot yellow"></span>
      <span class="safari-dot green"></span>
      <div class="safari-addressbar">
        <span class="addr-lock">🔒</span>
        <span class="addr-url">rare.lijingjing.ai</span>
        <span class="addr-path">/canvas_diff_sandbox</span>
      </div>
      <div class="safari-flex"></div>
    </div>

    <div class="safari-body">
      <!-- Left: Diff selection -->
      <div class="diff-sidebar">
        <div class="diff-label">需求变更 Impact 分析</div>
        <div class="diff-item selected" data-target="conflict">
          <span class="diff-indicator red"></span>
          14家二级单位协同冲突
        </div>
        <div class="diff-item" data-target="permission">
          <span class="diff-indicator yellow"></span>
          权限模型重构冲击
        </div>
        <div class="diff-item" data-target="module">
          <span class="diff-indicator green"></span>
          模块扩展新增
        </div>
      </div>

      <!-- Right: Canvas Diff visualization -->
      <div class="diff-canvas" id="diff-canvas-view">
        ${renderDiffTree('conflict')}
      </div>
    </div>

    <!-- Bottom: 0 Token security panel -->
    <div class="token-panel">
      <div class="token-info">
        <span class="token-status">COMPUTE: UNAUTHORIZED — 0 TOKEN</span>
        <span class="token-badge">前端 Mock 数据包</span>
      </div>
      <div class="token-controls">
        <button class="token-unlock-btn">🔐 解锁算力</button>
        <input class="query-input" placeholder="输入查询（限30字）" maxlength="30" />
        <button class="query-btn">执行</button>
        <span class="token-limit">${_queryCount}/${MAX_QUERIES}</span>
      </div>
      <div class="query-result">等待操作…</div>
    </div>
  `
}

/* ═══════════════════════════════════════
   CANVAS DIFF TREE — Apple-style red/green
   ═══════════════════════════════════════ */

function renderDiffTree(type) {
  const trees = {
    conflict: `
      <div class="tree-root">科技管理应用系统</div>
      <div class="tree-line"></div>
      <div class="tree-children">
        <div class="tree-node unchanged">
          <span class="node-dot"></span>项目申报模块
        </div>
        <div class="tree-node impacted">
          <span class="node-dot red"></span>成果认定管理 <span class="diff-tag red">冲击</span>
        </div>
        <div class="tree-node unchanged">
          <span class="node-dot"></span>科技奖励评定
        </div>
        <div class="tree-node impacted">
          <span class="node-dot red"></span>二级单位数据同步 <span class="diff-tag red">冲突</span>
        </div>
        <div class="tree-node expanded">
          <span class="node-dot green"></span>跨单位协同服务 <span class="diff-tag green">新增</span>
        </div>
        <div class="tree-node impacted">
          <span class="node-dot red"></span>权限校验中间件 <span class="diff-tag red">重构</span>
        </div>
        <div class="tree-node expanded">
          <span class="node-dot green"></span>实时数据看板 <span class="diff-tag green">扩增</span>
        </div>
      </div>
    `,
    permission: `
      <div class="tree-root">权限服务拓扑</div>
      <div class="tree-line"></div>
      <div class="tree-children">
        <div class="tree-node unchanged"><span class="node-dot"></span>角色管理</div>
        <div class="tree-node impacted"><span class="node-dot red"></span>数据权限 <span class="diff-tag red">重构</span></div>
        <div class="tree-node impacted"><span class="node-dot red"></span>菜单权限 <span class="diff-tag red">冲击</span></div>
        <div class="tree-node expanded"><span class="node-dot green"></span>单位级权限 <span class="diff-tag green">新增</span></div>
      </div>
    `,
    module: `
      <div class="tree-root">功能模块拓扑</div>
      <div class="tree-line"></div>
      <div class="tree-children">
        <div class="tree-node expanded"><span class="node-dot green"></span>AI 策略导航 <span class="diff-tag green">新增</span></div>
        <div class="tree-node expanded"><span class="node-dot green"></span>智能报表引擎 <span class="diff-tag green">扩增</span></div>
        <div class="tree-node unchanged"><span class="node-dot"></span>基础数据管理</div>
      </div>
    `,
  }

  return trees[type] || trees.conflict
}

function showDiff(type, win) {
  const canvas = win.querySelector('#diff-canvas-view')
  if (canvas) {
    canvas.innerHTML = renderDiffTree(type)
  }
}

/* ═══════════════════════════════════════
   CLEANUP
   ═══════════════════════════════════════ */

export function closeSafariPanel() {
  closeSafari()
}

export function resetSafari() {
  closeSafari()
  _tokenUnlocked = false
  _queryCount = 0
  window.__safariTriggered = false
}
