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
      // Persistent UI fixes inside iframe
      let _evalClicked = false
      const iv = setInterval(() => {
        if (!doc.body) { clearInterval(iv); return }
        // Hide buttons
        doc.querySelectorAll('button').forEach(b => {
          const t = (b.textContent || '').trim()
          if (t.includes('保存') || t.includes('确认') || t.includes('资产管理') || t.includes('上传') || t.includes('Upload') || t === '编辑') b.style.display = 'none'
        })
        // Zoom-aware font: update every 500ms via CSS !important rule
        const vp = doc.querySelector('.react-flow__viewport')
        if (vp) {
          const zm = vp.style.transform.match(/scale\(([\d.]+)\)/)
          const zoom = zm ? parseFloat(zm[1]) : 1
          const targetPx = Math.round(13 / Math.max(zoom, 0.1))
          let styleTag = doc.getElementById('rf-zoom-style')
          if (!styleTag) {
            styleTag = doc.createElement('style')
            styleTag.id = 'rf-zoom-style'
            doc.head.appendChild(styleTag)
          }
          styleTag.textContent = `.react-flow__node *[style*="font-size"] { font-size: ${Math.max(targetPx, 10)}px !important }`
        }
        // Fix submit buttons (精炼/优化/评估) — enable all
        doc.querySelectorAll('button').forEach(btn => {
          if ((btn.textContent.includes('精炼') || btn.textContent.includes('优化') || btn.textContent.includes('评估')) && !btn.dataset._optFixed) {
            btn.dataset._optFixed = '1'
            btn.removeAttribute('disabled')
            // Override disabled so React doesn't block click
            Object.defineProperty(btn, 'disabled', { get: () => false, configurable: true })
            // Direct click handler as fallback
            btn.addEventListener('click', () => {
              const ta = doc.querySelector('textarea')
              if (ta) {
                ta.value = ta.value || '1】测试需求'
                ta.dispatchEvent(new Event('input', { bubbles: true }))
              }
            }, { once: true })
          }
        })
        // Add "回退" button to version items with milestone changes
        const versionEls = doc.querySelectorAll('[style*="cursor"][style*="border"] > div')
        versionEls.forEach(el => {
          if (el.textContent.includes('里程碑状态') && !el.querySelector('.sr-rollback')) {
            const rb = doc.createElement('button')
            rb.className = 'sr-rollback'; rb.textContent = '↩ 回退'
            rb.style.cssText = 'padding:2px 10px;border-radius:4px;font-size:10px;cursor:pointer;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:rgba(239,68,68,0.7);margin-top:4px;font-family:inherit'
            rb.addEventListener('click', (e) => { e.stopPropagation()
              // Clean cached project + reload iframe
              if (window._fullProject) {
                window._fullProject.fields = window._fullProject.fields.filter(f => f.name !== '里程碑状态')
                window._fullProject.edges = window._fullProject.edges.filter(e => e.sourceId === 'f-new-ms' || e.targetId === 'f-new-ms' ? false : true)
              }
              window._srCommits = (window._srCommits||[]).filter(c => !c.message.includes('里程碑'))
              doc.location.href = doc.location.href.split('?')[0] + '?project=' + BKEY + '&_t=' + Date.now()
            })
            el.appendChild(rb)
          }
        })
        // Hide "Space + 拖拽" tooltip (leaf elements only!)
        doc.querySelectorAll('span').forEach(el => {
          if (!el.children?.length && (el.textContent||'').includes('Space') && (el.textContent||'').includes('拖拽')) {
            el.style.display = 'none'
          }
        })
        // Auto‑click "智能评估" tab to skip to evaluate page
        if (!_evalClicked) {
          doc.querySelectorAll('button, [role="button"], [style*="cursor"]').forEach(el => {
            if ((el.textContent || '').trim().includes('智能评估')) {
              el.click(); _evalClicked = true
            }
          })
        }
        // Replace textarea with read-only input + preset chips
        doc.querySelectorAll('textarea').forEach(ta => {
          if (!ta.parentNode || ta.dataset._replaced) return
          ta.dataset._replaced = '1'
          // Remove any stale previous container (from React re-render)
          const oldContainer = ta.parentNode.querySelector('.sr-chip-container')
          if (oldContainer) oldContainer.remove()
          const container = doc.createElement('div')
          container.className = 'sr-chip-container'
          container.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:6px'
          // Read-only input showing selected value
          const inp = doc.createElement('input')
          inp.readOnly = true
          inp.placeholder = '选择需求类型'
          inp.style.cssText = 'width:100%;padding:12px 16px;font-size:13px;color:#e0e0e0;background:transparent;border:none;border-radius:8px;outline:none;font-family:inherit;box-sizing:border-box;cursor:pointer'
          inp.addEventListener('focus', () => { inp.style.borderColor = 'rgba(34,197,94,0.5)' })
          inp.addEventListener('blur', () => { inp.style.borderColor = 'rgba(34,197,94,0.2)' })
          container.appendChild(inp)
          // Preset chips
          const chips = doc.createElement('div')
          chips.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'
          const options = ['新增模块', '进度管理页面新增一个里程碑状态', '变更流程']
          options.forEach(text => {
            const chip = doc.createElement('span')
            chip.textContent = text
            chip.style.cssText = 'padding:5px 14px;border-radius:6px;font-size:11px;cursor:pointer;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);color:rgba(34,197,94,0.7);transition:all 0.2s;font-family:inherit'
            chip.addEventListener('mouseenter', () => { chip.style.background = 'rgba(34,197,94,0.15)'; chip.style.borderColor = 'rgba(34,197,94,0.3)'; chip.style.color = '#22c55e' })
            chip.addEventListener('mouseleave', () => { chip.style.background = 'rgba(34,197,94,0.06)'; chip.style.borderColor = 'rgba(34,197,94,0.15)'; chip.style.color = 'rgba(34,197,94,0.7)' })
            chip.addEventListener('click', () => {
              inp.value = text
              // Use native value setter to trigger React onChange
              const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')
              if (nativeSetter) {
                nativeSetter.set.call(ta, text)
                ta.dispatchEvent(new Event('input', { bubbles: true }))
              } else {
                ta.value = text
                ta.dispatchEvent(new Event('input', { bubbles: true }))
              }
            })
            chips.appendChild(chip)
          })
          container.appendChild(chips)
          ta.style.display = 'none'; ta.parentNode.insertBefore(container, ta.nextSibling)
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
