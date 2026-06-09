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
        <iframe class="sr-iframe" id="sr-iframe" src="./rare/index.html?project=${bKey}&_t=${Date.now()}" loading="eager"></iframe>
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
      const isRedirect = new URL(doc.location.href).searchParams.get('redirect') === '1'
      style.textContent = `
        /* Hide save/confirm/asset management buttons */
        button:has(span) { } /* placeholder */
      `
      doc.head.appendChild(style)
      // Loading overlay to hide project hall flash during redirect auto‑nav
      if (isRedirect) {
        let overlay = doc.getElementById('sr-redirect-overlay')
        if (!overlay) { overlay = doc.createElement('div'); overlay.id = 'sr-redirect-overlay'; doc.body.appendChild(overlay) }
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(255,255,255,0.3);font-size:13px;font-family:inherit'
        overlay.innerHTML = '<div style="width:200px;height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden"><div style="width:30%;height:100%;background:linear-gradient(90deg,rgba(34,197,94,0.3),rgba(34,197,94,0.7));border-radius:4px;animation:srBar 1.4s ease-in-out infinite"></div></div><span>正在加载智能评估…</span>'
        if (!doc.getElementById('sr-bar-style')) {
          const ks = doc.createElement('style'); ks.id = 'sr-bar-style'
          ks.textContent = '@keyframes srBar{0%{transform:translateX(-100%)}50%{transform:translateX(200%)}100%{transform:translateX(200%)}}'
          doc.head.appendChild(ks)
        }
      }
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
        // Track which version row the user clicks (capture‑phase interceptor)
        const iWin = doc.defaultView
        const vc = doc.querySelector('[class*="version" i]') || Array.from(doc.querySelectorAll('div')).find(d => d.textContent.includes('版本管理') && d.children.length > 3)
        if (vc && iWin) {
          if (!vc.dataset._srCapture) {
            vc.dataset._srCapture = '1'
            vc.addEventListener('click', (e) => {
              // Walk up from target to find the row that's a direct child of vc
              let t = e.target
              while (t && t.parentElement !== vc) t = t.parentElement
              if (!t) return
              const vm = (t.textContent||'').match(/[vV](\d+)/)
              if (vm) iWin._srSelectedVersion = parseInt(vm[1])
            }, true) // capture phase — fires BEFORE React
          }
        }
        // Replace "退出预览" button with "↩ 回退" in version preview footer
        const srCommits = iWin && iWin._srCommits
        const exitPreviewBtn = Array.from(doc.querySelectorAll('button')).find(b => (b.textContent||'').trim() === '退出预览')
        if (exitPreviewBtn && srCommits && srCommits.length > 0) {
          const selectedVer = iWin._srSelectedVersion || (srCommits.length > 0 ? srCommits[srCommits.length - 1].version : null)
          const preCommit = selectedVer ? srCommits.find(c => c.version === selectedVer) : null
          // Force text/style every tick (React may re-render and reset)
          exitPreviewBtn.textContent = '↩ 回退'
          exitPreviewBtn.style.cssText = 'padding:4px 10px;border:none;border-radius:6px;background:rgba(239,68,68,0.15);color:#ef4444;cursor:pointer;font-size:11px;font-weight:600;font-family:inherit'
          // Attach our click handler once
          if (!exitPreviewBtn.dataset._srRbfixed) {
            exitPreviewBtn.dataset._srRbfixed = '1'
            exitPreviewBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              e.preventDefault()
              const commit = preCommit || srCommits[srCommits.length - 1]  // fallback to latest
              if (!commit) return
              const ver = commit.version || 0
              // Confirm dialog
              const existing = doc.querySelector('.sr-confirm-dialog')
              if (existing) existing.remove()
              const dlg = doc.createElement('div')
              dlg.className = 'sr-confirm-dialog'
              dlg.style.cssText = 'position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5)'
              dlg.innerHTML = '<div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;max-width:360px;text-align:center"><div style="font-size:14px;color:#e0e0e0;margin-bottom:16px">是否进行回退操作？<br><span style="font-size:12px;color:rgba(255,255,255,0.4)">回退后将删除画布上该次评估生成的新增实体</span></div><div style="display:flex;gap:10px;justify-content:center"><button id="sr-confirm-yes" style="padding:8px 24px;border:none;border-radius:8px;background:rgba(239,68,68,0.2);color:#ef4444;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit">是，回退</button><button id="sr-confirm-no" style="padding:8px 24px;border:none;border-radius:8px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);cursor:pointer;font-size:13px;font-family:inherit">取消</button></div></div>'
              doc.body.appendChild(dlg)
              doc.getElementById('sr-confirm-yes').onclick = () => {
                dlg.remove()
                // Rollback: remove entities + edges created by this commit
                if (iWin && iWin.fullProject) {
                  if (commit._entities) iWin.fullProject.fields = iWin.fullProject.fields.filter(f => !commit._entities.includes(f.id))
                  if (commit._edges) iWin.fullProject.edges = iWin.fullProject.edges.filter(e => !commit._edges.includes(e.id))
                }
                // Remove commit record
                const ci = srCommits.findIndex(c => c.version === ver)
                if (ci >= 0) srCommits.splice(ci, 1)
                // Reload iframe with redirect mode
                const curProj = new URL(doc.location.href).searchParams.get('project') || 'b2'
                doc.location.href = doc.location.href.split('?')[0] + '?project=' + curProj + '&_t=' + Date.now() + '&redirect=1'
              }
              doc.getElementById('sr-confirm-no').onclick = () => dlg.remove()
            })
          }
        }
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
              // Remove redirect overlay once evaluation page is reached
              const ro = doc.getElementById('sr-redirect-overlay')
              if (ro) ro.remove()
            }
          })
        }
        // Remove redirect opacity filter once auto‑nav likely completed
        if (isRedirect && _evalClicked) {
          const ro = doc.getElementById('sr-redirect-overlay')
          if (ro) ro.remove()
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
          // Preset chips — per‑project requirement tags
          const chips = doc.createElement('div')
          chips.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap'
          const pkey = new URL(doc.location.href).searchParams.get('project') || ''
          const options = pkey === 'b1'
            ? ['进度管理页面新增一个里程碑状态', '科技成果模块新增一个成果库页面']
            : pkey === 'b2'
            ? ['人才基本信息页面新增一个上传简历功能', '组队选才页面新增角色要求功能']
            : pkey === 'b3'
            ? ['成员管理里新增一个人员报工功能']
            : ['新增模块', '进度管理页面新增一个里程碑状态', '变更流程']
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
