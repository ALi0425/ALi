/**
 * ═══════════════════════════════════════════
 *  State 04 — SVG Overlay Connections
 *
 *  Bezier curves between endpoint dots.
 *  Auto‑follows dragged/pinned nodes.
 * ═══════════════════════════════════════════
 */

import { getState, STATES } from './state.js'
import { openSimRare, closeSimRare } from './sim-rare.js'

const SCHEMA = {
  'b1→a1': true,  'b1→a2': true,
  'b2→a1': true,  'b2→a2': true,
  'b3→a1': true,  'b3→a2': true, 'b3→b1': true, 'b3→b2': true,
}
function isValid(from, to) {
  if (from === to) return false
  return SCHEMA[`${from}→${to}`] === true
}

let _svgOverlay  = null
let _dragPath    = null
let _connections = []
let _dragging    = false
let _dragFrom    = null
let _dragTo      = null
let _flowTime    = 0

function ensureSVG() {
  if (_svgOverlay) return _svgOverlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:15'
  document.body.appendChild(svg)
  _svgOverlay = svg
  return svg
}

function createPath(className, stroke, opacity = 0.5, width = 2) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('stroke', stroke)
  el.setAttribute('stroke-width', String(width))
  el.setAttribute('fill', 'none')
  el.setAttribute('stroke-linejoin', 'round')
  el.setAttribute('stroke-linecap', 'round')
  el.setAttribute('opacity', String(opacity))
  if (className) el.classList.add(className)
  ensureSVG().appendChild(el)
  return el
}

/* ── Cubic bezier curve D ── */
function curveD(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1) * 0.4
  return `M ${x1} ${y1} C ${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`
}

/* ── Get endpoint dot screen position for a card ── */
function getEndpoints(key) {
  const card = document.querySelector(`.project-label.card[data-key="${key}"]`)
  if (!card) return null
  const r = card.getBoundingClientRect()
  return {
    left:  { x: r.left - 8,  y: r.top + r.height / 2 },
    right: { x: r.right + 8, y: r.top + r.height / 2 },
  }
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

export function initConnections() {
  return { triggerConnection }
}

/* ═══════════════════════════════════════
   DRAG
   ═══════════════════════════════════════ */

/* ── Pulse a‑node endpoints when b‑node drag starts ── */
function pulseATargets(active) {
  const keys = ['a1', 'a2']
  keys.forEach(k => {
    const card = document.querySelector(`.project-label.card[data-key="${k}"]`)
    if (!card) return
    const ep = card.querySelector('.endpoint.left')
    if (ep) ep.classList.toggle('pulse', active)
  })
}

export function startDrag(fromKey, fromScreenX, fromScreenY) {
  if (getState() !== STATES.FLOATING) return
  _dragging = true
  _dragFrom = { key: fromKey, sx: fromScreenX, sy: fromScreenY }
  _dragTo = null
  _dragPath = createPath('drag-line', 'rgba(34,197,94,0.5)', 0.6, 2)
  // Pulse a‑node endpoints when dragging from b‑node
  if (['b1','b2','b3'].includes(fromKey)) pulseATargets(true)
}

export function setDragTarget(key, sx, sy) {
  if (!_dragging) return
  _dragTo = { key, sx, sy }
}

export function clearDragTarget() {
  if (!_dragging) return
  _dragTo = null
}

document.addEventListener('mousemove', (e) => {
  if (!_dragging || !_dragFrom) return
  const to = _dragTo || { sx: e.clientX, sy: e.clientY }
  _dragPath.setAttribute('d', curveD(_dragFrom.sx, _dragFrom.sy, to.sx, to.sy))
})

document.addEventListener('mouseup', () => {
  if (!_dragging) return
  _dragging = false
  console.log('🐭 mouseup dragFrom:', _dragFrom?.key, 'dragTo:', _dragTo?.key, 'valid:', _dragTo ? isValid(_dragFrom.key, _dragTo.key) : 'no-target')
  if (_dragTo && isValid(_dragFrom.key, _dragTo.key)) {
    addConnection(_dragFrom, _dragTo)
  } else if (_dragTo) {
    const cx = (_dragFrom.sx + _dragTo.sx) / 2
    const cy = (_dragFrom.sy + _dragTo.sy) / 2
    triggerInvalidBurst(cx, cy)
  }
  // Stop pulse on any drag end
  pulseATargets(false)
  if (_dragPath) { _dragPath.remove(); _dragPath = null }
  _dragFrom = null; _dragTo = null
})

/* ═══════════════════════════════════════
   ADD CONNECTION
   ═══════════════════════════════════════ */

function addConnection(from, to) {
  const path = createPath('conn-line', '#22c55e', 0.4, 2)
  const glow = createPath('conn-glow', '#22c55e', 0.08, 6)
  const d = curveD(from.sx, from.sy, to.sx, to.sy)
  path.setAttribute('d', d)
  glow.setAttribute('d', d)

  const conn = { fromKey: from.key, toKey: to.key, fromSx: from.sx, fromSy: from.sy, toSx: to.sx, toSy: to.sy, path, glow, _flowTime: Math.random() * 100 }
  _connections.push(conn)

  // Stop pulse when b→a connection established
  pulseATargets(false)

  // Open RARE simulation when b‑node → a2 (RARE)
  if (to.key === 'a2' && ['b1','b2','b3'].includes(from.key)) {
    console.log('🎯 triggering sim-rare for', from.key)
    setTimeout(() => openSimRare(from.key), 300)
  } else {
    console.log('❌ sim-rare NOT triggered: to=', to.key, 'from=', from.key)
  }

  console.log(`%c🔗  ${from.key} → ${to.key} — VALID`, 'color:#22c55e;font-family:monospace')
  checkAllConnected()
}

/* ═══════════════════════════════════════
   UPDATE ENDPOINTS — call when node drags
   ═══════════════════════════════════════ */

export function updateConnectionForKey(key) {
  if (_connections.length === 0) return
  const eps = getEndpoints(key)
  if (!eps) return

  _connections.forEach(c => {
    let changed = false
    if (c.fromKey === key) {
      const ep = eps.right
      c.fromSx = ep.x; c.fromSy = ep.y; changed = true
    }
    if (c.toKey === key) {
      const ep = eps.left
      c.toSx = ep.x; c.toSy = ep.y; changed = true
    }
    if (changed) {
      c.path.setAttribute('d', curveD(c.fromSx, c.fromSy, c.toSx, c.toSy))
      c.glow.setAttribute('d', curveD(c.fromSx, c.fromSy, c.toSx, c.toSy))
    }
  })
}

/* ═══════════════════════════════════════
   INVALID BURST
   ═══════════════════════════════════════ */

function triggerInvalidBurst(cx, cy) {
  const burst = document.createElement('div')
  burst.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:4px;height:4px;border-radius:50%;background:#FF5500;pointer-events:none;z-index:20;box-shadow:0 0 6px #FF5500`
  document.body.appendChild(burst)
  burst.animate([
    { transform: 'scale(0)', opacity: 1 },
    { transform: 'scale(8)', opacity: 0 }
  ], { duration: 600, easing: 'ease-out' }).onfinish = () => burst.remove()
  console.log('%c🔥  [Schema Error]: Matrix Mismatch', 'color:#FF5500;font-size:13px;font-weight:bold;font-family:monospace')
}

/* ═══════════════════════════════════════
   CHECK → SAFARI
   ═══════════════════════════════════════ */

function checkAllConnected() {
  const seen = new Set()
  _connections.forEach(c => { seen.add(c.fromKey); seen.add(c.toKey) })
  if (seen.size >= 3 && !window.__safariTriggered) {
    window.__safariTriggered = true
    document.dispatchEvent(new CustomEvent('connections-ready'))
  }
}

/* ═══════════════════════════════════════
   PER‑FRAME — flowing dash + pinned update
   ═══════════════════════════════════════ */

export function updateConnections() {
  if (_connections.length === 0) return
  _flowTime += 0.05

  _connections.forEach((c, i) => {
    // Flowing dash
    const dash = (Math.sin(_flowTime + i) * 4 + 8).toFixed(0)
    c.path.setAttribute('stroke-dasharray', `${dash} ${16 - dash}`)
    c.path.setAttribute('stroke-dashoffset', String(-_flowTime * 3))
    // Update positions for pinned/dragged nodes
    const fromEps = getEndpoints(c.fromKey)
    const toEps = getEndpoints(c.toKey)
    if (fromEps && toEps) {
      const newD = curveD(fromEps.right.x, fromEps.right.y, toEps.left.x, toEps.left.y)
      if (newD !== c.path.getAttribute('d')) {
        c.path.setAttribute('d', newD)
        c.glow.setAttribute('d', newD)
      }
    }
  })
}

/* ═══════════════════════════════════════
   TRIGGER (test + global)
   ═══════════════════════════════════════ */

export function triggerConnection(fromKey, toKey) {
  const eps = getEndpoints(fromKey) && getEndpoints(toKey)
  if (!eps) return
  const fromEp = getEndpoints(fromKey).right
  const toEp = getEndpoints(toKey).left
  if (isValid(fromKey, toKey)) {
    addConnection({ key: fromKey, sx: fromEp.x, sy: fromEp.y }, { key: toKey, sx: toEp.x, sy: toEp.y })
  } else {
    triggerInvalidBurst((fromEp.x + toEp.x) / 2, (fromEp.y + toEp.y) / 2)
  }
}

window.__testConnection = (fromKey, toKey) => triggerConnection(fromKey, toKey)

/* ═══════════════════════════════════════
   CLEANUP
   ═══════════════════════════════════════ */

// Listen for close-sim-rare event — remove the trigger connection
window.addEventListener('close-sim-rare', () => {
  const idx = _connections.findIndex(c => c.toKey === 'a2' && ['b1','b2','b3'].includes(c.fromKey))
  if (idx !== -1) {
    const conn = _connections[idx]
    if (conn.path) conn.path.remove()
    if (conn.glow) conn.glow.remove()
    _connections.splice(idx, 1)
  }
  window.__safariTriggered = false
})

export function clearConnections() {
  if (_svgOverlay) _svgOverlay.innerHTML = ''
  _connections = []; _dragPath = null; _dragFrom = null; _dragTo = null
  _dragging = false; window.__safariTriggered = false
}
