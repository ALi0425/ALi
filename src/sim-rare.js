/**
 * ═══════════════════════════════════════════
 *  RARE Simulation Sandbox
 *
 *  Full RARE‑like canvas + smart evaluation
 *  loaded with B‑node project data.
 *  No real RARE code is modified.
 * ═══════════════════════════════════════════
 */

let _overlay = null

/* ── Project data templates (filled by user) ── */
const PROJECT_DATA = {
  b1: { name: '科技管理应用', /* TODO */ },
  b2: { name: '巡查问题在线管理', /* TODO */ },
  b3: { name: '项目管理应用', /* TODO */ },
}

/* ── Open simulation ── */
export function openSimRare(bKey) {
  if (_overlay) closeSimRare()
  const info = PROJECT_DATA[bKey]
  if (!info) return

  _overlay = document.createElement('div')
  _overlay.id = 'sim-rare-overlay'
  _overlay.innerHTML = `
    <div class="sr-backdrop"></div>
    <div class="sr-window">
      <div class="sr-loader" id="sr-loader">
        <div class="sr-loader-bar"><div class="sr-loader-fill" id="sr-loader-fill"></div></div>
        <div class="sr-loader-text">正在注入「${info.name}」数据到 RARE 分析引擎…</div>
        <div class="sr-loader-pct" id="sr-loader-pct">0%</div>
      </div>
      <div class="sr-body" id="sr-body" style="display:none">
        <iframe class="sr-iframe" id="sr-iframe" src="/sim-rare/index.html?project=${bKey}"></iframe>
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
    pct += Math.random() * 15 + 2
    if (pct > 100) { pct = 100; clearInterval(intv) }
    if (fill) fill.style.width = pct + '%'
    if (pctEl) pctEl.textContent = Math.round(pct) + '%'
    if (pct >= 100) {
      setTimeout(() => {
        document.getElementById('sr-loader').style.display = 'none'
        document.getElementById('sr-body').style.display = 'flex'
      }, 400)
    }
  }, 200)
}

export function closeSimRare() {
  if (!_overlay) return
  _overlay.classList.remove('active')
  setTimeout(() => { _overlay.remove(); _overlay = null }, 400)
}
