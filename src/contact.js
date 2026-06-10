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

function ensureDOM() {
  if (_overlay) { _overlay.style.display = ''; return }
  _overlay = document.createElement('div')
  _overlay.id = 'contact-overlay'
  _overlay.innerHTML = `
    <div class="co-scroll-container" id="co-scroll-container">
      <div class="co-scanlines"></div>
      <div class="co-orb"></div>
      <div class="co-content">
        <div class="co-statusbar">
          <div class="co-status-left">
            <span class="co-status-dot"></span>
            <span>SYSTEM_ONLINE</span>
            <span>SECURE_CONNECTION_ESTABLISHED</span>
          </div>
          <div class="co-status-right">🔋📶</div>
        </div>
        <div class="co-hero">
          <h2 class="co-title">CONTACT<br><span class="co-gradient">INFORMATION</span></h2>
          <p class="co-subtitle">// Let's collaborate<br>// Response guaranteed within 24 cycles.</p>
        </div>
        <div class="co-cards">
          <div class="co-card">
            <div class="co-card-icon">📞</div>
            <div class="co-card-label">WECHAT</div>
            <div class="co-card-value">15720164041</div>
          </div>
          <div class="co-card">
            <div class="co-card-icon">📧</div>
            <div class="co-card-label">EMAIL</div>
            <div class="co-card-value">15720164041@163.com</div>
          </div>
        </div>
        <div class="co-footer">
          <div class="co-footer-left">
            <span>LOCATION: CHINA</span>
          </div>
          <div class="co-footer-right"><p>© ALI</p></div>
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
  _overlay.style.pointerEvents = _pos > 0.02 ? 'auto' : 'none'
  _overlay.style.opacity = _pos > 0.02 ? '1' : '0'
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
    // If just closed → notify to restore floating state
    if (wasOpen && _pos < 0.02) {
      window.dispatchEvent(new CustomEvent('contact-closed'))
    }
  }
}

function wake() { if (!_raf) { _lastT = 0; _raf = requestAnimationFrame(tick) } }

/* ── Public API ── */

export function mountScrollTrigger(container) {
  if (_handler) return
  ensureDOM()
  _handler = (e) => {
    // Ignore wheel events when terminal modal is open
    const term = document.getElementById('terminal-overlay')
    if (term && term.classList.contains('active')) return
    _target = Math.max(0, Math.min(1, _target + e.deltaY / 500))
    wake()
  }
  container.addEventListener('wheel', _handler, { passive: true })
}

export function unmountScrollTrigger(container) {
  if (!_handler) return
  container.removeEventListener('wheel', _handler)
  _handler = null
  _target = 0; _pos = 0; _vel = 0; _lastT = 0
  if (_raf) { cancelAnimationFrame(_raf); _raf = null }
  const c = document.getElementById('co-scroll-container')
  if (c) c.style.transform = 'translateY(100%)'
  if (_overlay) { _overlay.style.opacity = '0'; _overlay.style.pointerEvents = 'none' }
}

export function openContact() { _target = 1; wake() }

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { _target = 0; wake() }
})
