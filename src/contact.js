/**
 * ═══════════════════════════════════════════
 *  Contact Page — scroll‑linked parallax
 *  Scroll down → page follows smoothly.
 *  Scroll up → page goes back down.
 * ═══════════════════════════════════════════
 */

let _overlay = null
let _pos = 0          // 0 = hidden, 1 = fully visible
let _target = 0
let _vel = 0
let _raf = null
let _handler = null
let _lastT = 0
let _dismissed = false  // prevents immediate re-open after close
let _dismissTimer = null
const DISMISS_COOLDOWN = 2500 // ms — cooldown before contact can reopen

/* ── Check if any modal overlay is active (blocks contact scroll) ── */
function isModalOverlayActive() {
  const term = document.getElementById('terminal-overlay')
  if (term && term.classList.contains('active')) return true
  const safari = document.getElementById('safari-overlay')
  if (safari && safari.classList.contains('active')) return true
  const sim = document.getElementById('sim-rare-overlay')
  if (sim && sim.classList.contains('active')) return true
  return false
}

function ensureDOM() {
  if (_overlay) { _overlay.style.display = ''; return }
  _overlay = document.createElement('div')
  _overlay.id = 'contact-overlay'
  _overlay.innerHTML = `
    <div class="co-scroll-container" id="co-scroll-container">
      <div class="co-scanlines"></div>
      <div class="co-content">
        <div class="co-statusbar">
          <div class="co-status-left">
            <span class="co-status-dot"></span>
            <span>SYSTEM_ONLINE</span>
            <span class="co-secure">SECURE_CONNECTION</span>
          </div>
        </div>
        <div class="co-middle">
          <div class="co-hero">
            <h2 class="co-title">CONTACT<br><span class="co-gradient">INFORMATION</span></h2>
            <p class="co-subtitle">*call me👇*</p>
          </div>
          <div class="co-cards">
            <div class="project-label card co-card">
              <div class="pl-body">
                <span class="pl-title" style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.12em">📞 WECHAT</span>
                <span class="pl-desc" style="font-size:16px;color:rgba(255,255,255,0.9);font-weight:600">15720164041</span>
              </div>
            </div>
            <div class="project-label card co-card">
              <div class="pl-body">
                <span class="pl-title" style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.12em">📧 EMAIL</span>
                <span class="pl-desc" style="font-size:16px;color:rgba(255,255,255,0.9);font-weight:600">15720164041@163.com</span>
              </div>
            </div>
          </div>
        </div>
        <div class="co-footer">
          <span>al·2026</span>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(_overlay)
}

function render() {
  const c = document.getElementById('co-scroll-container')
  if (!c) return
  const pct = (1 - _pos) * 100
  c.style.transform = `translateY(${pct}%)`
  const visible = _pos > 0.02
  _overlay.style.pointerEvents = visible ? 'auto' : 'none'
  _overlay.style.opacity = visible ? '1' : '0'
  // Lock body scroll when contact is open
  document.body.style.overflow = visible ? 'hidden' : ''
}

function tick(now) {
  _raf = requestAnimationFrame(tick)
  const dt = Math.min((now - (_lastT || now)) / 16, 4)
  _lastT = now

  // critically‑damped spring toward target
  const k = 0.045 * dt
  const d = 0.80
  const accel = (_target - _pos) * k - _vel * d
  _vel += accel * dt
  _pos += _vel * dt
  if (_pos < 0) { _pos = 0; _vel = 0 }
  if (_pos > 1) { _pos = 1; _vel = 0 }

  render()

  // sleep when settled
  if (Math.abs(_pos - _target) < 0.003 && Math.abs(_vel) < 0.0005) {
    const wasOpen = _pos > 0.02
    _pos = _target; _vel = 0; render()
    cancelAnimationFrame(_raf); _raf = null; _lastT = 0
    // If just closed → notify and set dismiss cooldown
    if (wasOpen && _pos < 0.02) {
      _dismissed = true
      if (_dismissTimer) clearTimeout(_dismissTimer)
      _dismissTimer = setTimeout(() => { _dismissed = false; _dismissTimer = null }, DISMISS_COOLDOWN)
      window.dispatchEvent(new CustomEvent('contact-closed'))
    }
  }
}

function wake() { if (!_raf) { _lastT = 0; _raf = requestAnimationFrame(tick) } }

/* ── Public API ── */

export function mountScrollTrigger(container) {
  if (_handler) return
  ensureDOM()
  // Start with contact blocked — user must be on nodes page first before
  // contact can be opened via swipe. Cooldown automatically clears.
  _dismissed = true
  if (_dismissTimer) { clearTimeout(_dismissTimer); _dismissTimer = null }
  _dismissTimer = setTimeout(() => { _dismissed = false; _dismissTimer = null }, DISMISS_COOLDOWN)
  _handler = (e) => {
    if (isModalOverlayActive()) return
    if (_dismissed && e.deltaY > 0) return
    _target = Math.max(0, Math.min(1, _target + e.deltaY / 500))
    wake()
  }
  container.addEventListener('wheel', _handler, { passive: true })

  // Touch support for mobile swipe (vertical only)
  let _touchStartY = null
  let _touchStartTarget = 0
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return
    if (isModalOverlayActive()) return
    if (_dismissed) return  // cooldown: prevent reopening too soon
    _touchStartY = e.touches[0].clientY
    _touchStartTarget = _target
    _vel = 0
  }
  const onTouchMove = (e) => {
    if (_touchStartY === null || e.touches.length !== 1) return
    const dy = (_touchStartY - e.touches[0].clientY) / window.innerHeight * 1.8
    _target = Math.max(0, Math.min(1, _touchStartTarget + dy))
    _pos = _target
    render()
  }
  const onTouchEnd = () => {
    _touchStartY = null
    // Snap to 0 or 1 based on position
    if (_pos > 0.3) _target = 1
    else {
      _target = 0
      _dismissed = true
      if (_dismissTimer) clearTimeout(_dismissTimer)
      _dismissTimer = setTimeout(() => { _dismissed = false; _dismissTimer = null }, DISMISS_COOLDOWN)
    }
    _vel = 0
    wake()
  }
  container.addEventListener('touchstart', onTouchStart, { passive: true })
  container.addEventListener('touchmove', onTouchMove, { passive: true })
  container.addEventListener('touchend', onTouchEnd, { passive: true })
}

export function unmountScrollTrigger(container) {
  if (!_handler) return
  container.removeEventListener('wheel', _handler)
  _handler = null
  _target = 0; _pos = 0; _vel = 0; _lastT = 0; _dismissed = false
  if (_dismissTimer) { clearTimeout(_dismissTimer); _dismissTimer = null }
  if (_raf) { cancelAnimationFrame(_raf); _raf = null }
  const c = document.getElementById('co-scroll-container')
  if (c) c.style.transform = 'translateY(100%)'
  if (_overlay) { _overlay.style.opacity = '0'; _overlay.style.pointerEvents = 'none' }
}

export function openContact() {
  _dismissed = false
  if (_dismissTimer) { clearTimeout(_dismissTimer); _dismissTimer = null }
  _target = 1
  wake()
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { _target = 0; wake() }
})
