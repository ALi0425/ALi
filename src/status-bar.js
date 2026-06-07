/**
 * ═══════════════════════════════════════════
 *  Status Bar & System Info UI
 * ═══════════════════════════════════════════
 */

import { onEnter, STATES } from './state.js'

/**
 * Create the status bar and wire state‑aware updates.
 */
export function createStatusBar() {
  const container = document.getElementById('status-bar')
  if (!container) return

  container.innerHTML = `
    <div id="status-badge" class="inline-flex items-center gap-3 px-4 py-2 border border-green-500/30 bg-green-500/[0.04] rounded-sm text-green-400 font-mono text-xs tracking-[0.15em] backdrop-blur-sm">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span id="status-text">SYSTEM_STATUS: AUTHORIZED_BY_JJ</span>
    </div>
  `

  // ── State‑aware status updates ──
  onEnter(STATES.IDLE, () => {
    setStatus('SYSTEM_STATUS: AUTHORIZED_BY_JJ', 'green')
  })

  onEnter(STATES.EXPLODE, () => {
    setStatus('KERNEL_MODULES: DECOUPLING', 'yellow')
  })

  onEnter(STATES.SETTLE, () => {
    setStatus('PARTICLES: GRID_ADSORPTION', 'yellow')
  })

  onEnter(STATES.FLOATING, () => {
    setStatus('MODULES: DECOUPLED — [Esc] reintegrate', 'green')
  })
}

function setStatus(text, color) {
  const el = document.getElementById('status-text')
  const badge = document.getElementById('status-badge')
  if (!el || !badge) return

  el.textContent = text

  const colors = {
    green:  { text: '#22c55e', border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.04)' },
    yellow: { text: '#eab308', border: 'rgba(234,179,8,0.3)', bg: 'rgba(234,179,8,0.04)' },
    red:    { text: '#ef4444', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.04)' },
  }

  const c = colors[color] || colors.green
  badge.style.borderColor = c.border
  badge.style.background = c.bg
  el.style.color = c.text

  // Update the LED dot color
  const led = badge.querySelector('.relative.inline-flex')
  if (led) {
    led.style.background = c.text
  }
  const ping = badge.querySelector('.animate-ping')
  if (ping) {
    ping.style.background = c.text
  }
}
