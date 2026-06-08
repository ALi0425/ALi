/**
 * ═══════════════════════════════════════════
 *  RARE Simulation — loads real RARE dist
 *
 *  Progress bar → iframe with mock API
 *  serving B‑node project data.
 * ═══════════════════════════════════════════
 */

let _overlay = null
const NAMES = { b1: '科技管理应用', b2: '巡查问题在线管理', b3: '项目管理应用' }

export function openSimRare(bKey) {
  if (_overlay) closeSimRare()
  const name = NAMES[bKey] || '未知项目'

  _overlay = document.createElement('div')
  _overlay.id = 'sim-rare-overlay'
  _overlay.innerHTML = `
    <div class="sr-backdrop"></div>
    <div class="sr-window">
      <div class="sr-loader" id="sr-loader">
        <div class="sr-loader-bar"><div class="sr-loader-fill" id="sr-loader-fill"></div></div>
        <div class="sr-loader-text">正在注入「${name}」数据到 RARE 分析引擎…</div>
        <div class="sr-loader-pct" id="sr-loader-pct">0%</div>
      </div>
      <div class="sr-body" id="sr-body" style="display:none">
        <iframe class="sr-iframe" src="/rare/index.html?project=${bKey}" loading="eager"></iframe>
      </div>
    </div>
  `
  document.body.appendChild(_overlay)
  requestAnimationFrame(() => _overlay.classList.add('active'))

  // Animate progress bar
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
  _overlay.classList.remove('active')
  setTimeout(() => { _overlay.remove(); _overlay = null }, 400)
}
