/**
 * ═══════════════════════════════════════════
 *  RARE Simulation — Safari‑style chrome
 *
 *  Loads real RARE dist with mock API.
 *  Wraps in macOS traffic‑light title bar.
 * ═══════════════════════════════════════════
 */

let _overlay = null

const PROJECTS = {
  b1: { name: '科技管理应用', tag: 'B端·科技管理' },
  b2: { name: '巡查问题在线管理', tag: 'B端·合规治理' },
  b3: { name: '项目管理应用', tag: 'B端·全生命周期' },
}

export function openSimRare(bKey) {
  // Remove any stale overlay DOM element
  const existing = document.getElementById('sim-rare-overlay')
  if (existing) existing.remove()
  _overlay = null

  const info = PROJECTS[bKey] || { name: '未知项目', tag: '' }

  _overlay = document.createElement('div')
  _overlay.id = 'sim-rare-overlay'
  _overlay.innerHTML = `
    <div class="sr-backdrop" id="sr-backdrop"></div>
    <div class="sr-window">
      <!-- Safari‑style title bar -->
      <div class="sr-titlebar">
        <div class="sr-dots">
          <span class="sr-dot red" id="sr-close"></span>
          <span class="sr-dot yellow"></span>
          <span class="sr-dot green"></span>
        </div>
        <div class="sr-path">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span>~/projects/rare/canvas-sandbox</span>
        </div>
      </div>
      <!-- Loader -->
      <div class="sr-loader" id="sr-loader">
        <div class="sr-loader-bar"><div class="sr-loader-fill" id="sr-loader-fill"></div></div>
        <div class="sr-loader-text">正在注入「${info.name}」数据到 RARE 分析引擎…</div>
        <div class="sr-loader-pct" id="sr-loader-pct">0%</div>
      </div>
      <!-- Iframe body -->
      <div class="sr-body" id="sr-body" style="display:none">
        <iframe class="sr-iframe" id="sr-iframe" src="/rare/index.html?project=${bKey}&_t=${Date.now()}" loading="eager"></iframe>
      </div>
    </div>
  `
  document.body.appendChild(_overlay)
  _overlay.classList.add('active')

  // Close handlers
  document.getElementById('sr-close').addEventListener('click', closeSimRare)
  document.getElementById('sr-backdrop').addEventListener('click', closeSimRare)

  // Inject fixes into iframe once it loads (bypasses iframe caching issues)
  document.getElementById('sr-iframe').addEventListener('load', (e) => {
    try {
      const doc = e.target.contentDocument || e.target.contentWindow?.document
      if (!doc) return
      // Inject CSS and button hiding into iframe
      const style = doc.createElement('style')
      style.textContent = `
        /* Hide save/confirm/asset management buttons */
        button:has(span) { } /* placeholder */
      `
      doc.head.appendChild(style)
      // Start persistent button hiding inside iframe
      const iv = setInterval(() => {
        if (!doc.body) { clearInterval(iv); return }
        doc.querySelectorAll('button').forEach(b => {
          const t = (b.textContent || '').trim()
          if (t === '保存' || t === '确认' || t.includes('资产管理')) b.style.display = 'none'
        })
      }, 500)
    } catch(e) { /* iframe cross-origin */ }
  })

  // Animate progress
  let pct = 0
  const fill = document.getElementById('sr-loader-fill')
  const pctEl = document.getElementById('sr-loader-pct')
  const intv = setInterval(() => {
    pct += Math.random() * 12 + 3
    if (pct > 100) { pct = 100; clearInterval(intv) }
    if (fill) fill.style.width = pct + '%'
    if (pctEl) pctEl.textContent = Math.round(pct) + '%'
    if (pct >= 100) {
      setTimeout(() => {
        document.getElementById('sr-loader').style.display = 'none'
        document.getElementById('sr-body').style.display = 'flex'
      }, 300)
    }
  }, 180)
}

export function closeSimRare() {
  if (!_overlay) return
  // Notify connections.js to remove the trigger connection
  window.dispatchEvent(new CustomEvent('close-sim-rare'))
  _overlay.classList.remove('active')
  setTimeout(() => { _overlay.remove(); _overlay = null }, 400)
}
