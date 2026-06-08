/**
 * ═══════════════════════════════════════════
 *  State 04 — SVG Overlay Connections
 *
 *  Pixel‑perfect connection lines using SVG overlay.
 *  Right‑angle polyline with rounded corners.
 * ═══════════════════════════════════════════
 */

import { getState, STATES } from './state.js'

/* ── Schema Matrix ── */
const SCHEMA = {
  'b1→a1': true,  'b1→a2': true,
  'b2→a1': true,  'b2→a2': true,
  'doc→a1': true, 'doc→a2': true, 'doc→b1': true, 'doc→b2': true,
}
function isValid(from, to) {
  if (from === to) return false
  return SCHEMA[`${from}→${to}`] === true
}

/* ── Module state ── */
let _svgOverlay  = null
let _dragPath    = null
let _connections = []
let _dragging    = false
let _dragFrom    = null
let _dragTo      = null
let _flowTime    = 0

/* ── Ensure SVG overlay exists ── */
function ensureSVG() {
  if (_svgOverlay) return _svgOverlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:15'
  document.body.appendChild(svg)
  _svgOverlay = svg
  return svg
}

/* ── Create a path element ── */
function createPath(className, stroke, opacity = 0.5, width = 2) {
  const svg = ensureSVG()
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('stroke', stroke)
  el.setAttribute('stroke-width', String(width))
  el.setAttribute('fill', 'none')
  el.setAttribute('stroke-linejoin', 'round')
  el.setAttribute('stroke-linecap', 'round')
  el.setAttribute('opacity', String(opacity))
  if (className) el.classList.add(className)
  svg.appendChild(el)
  return el
}

/* ── Build path `d` attribute for right‑angle polyline ── */
function polylineD(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return `M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

export function initConnections() {
  // SVG overlay created lazily in ensureSVG()
  return { triggerConnection }
}

/* ═══════════════════════════════════════
   DRAG (called from explosion.js)
   ═══════════════════════════════════════ */

export function startDrag(fromKey, fromScreenX, fromScreenY) {
  if (getState() !== STATES.FLOATING) return
  _dragging = true
  _dragFrom = { key: fromKey, sx: fromScreenX, sy: fromScreenY }
  _dragTo = null

  _dragPath = createPath('drag-line', 'rgba(34,197,94,0.5)', 0.6, 2)
}

export function setDragTarget(key, sx, sy) {
  if (!_dragging) return
  _dragTo = { key, sx, sy }
}

export function clearDragTarget() {
  if (!_dragging) return
  _dragTo = null
}

/* ═══════════════════════════════════════
   MOUSE TRACKING
   ═══════════════════════════════════════ */

document.addEventListener('mousemove', (e) => {
  if (!_dragging || !_dragFrom) return
  const to = _dragTo || { sx: e.clientX, sy: e.clientY }
  _dragPath.setAttribute('d', polylineD(_dragFrom.sx, _dragFrom.sy, to.sx, to.sy))
})

document.addEventListener('mouseup', () => {
  if (!_dragging) return
  _dragging = false

  if (_dragTo && isValid(_dragFrom.key, _dragTo.key)) {
    addConnection(_dragFrom, _dragTo)
  } else if (_dragTo) {
    triggerInvalidBurst(
      (_dragFrom.sx + _dragTo.sx) / 2,
      (_dragFrom.sy + _dragTo.sy) / 2
    )
  }

  if (_dragPath) { _dragPath.remove(); _dragPath = null }
  _dragFrom = null
  _dragTo = null
})

/* ═══════════════════════════════════════
   ADD CONNECTION
   ═══════════════════════════════════════ */

function addConnection(from, to) {
  const path = createPath('connection-line', '#22c55e', 0.4, 2)
  path.setAttribute('d', polylineD(from.sx, from.sy, to.sx, to.sy))

  // Glow (wider, fainter copy)
  const glow = createPath('connection-glow', '#22c55e', 0.1, 6)
  glow.setAttribute('d', polylineD(from.sx, from.sy, to.sx, to.sy))

  const conn = { from, to, path, glow, _flowTime: Math.random() * 100 }
  _connections.push(conn)

  console.log(
    `%c🔗  CONNECTION: ${from.key} → ${to.key} — VALID`,
    'color: #22c55e; font-family: monospace;'
  )

  checkAllConnected()
}

/* ═══════════════════════════════════════
   INVALID BURST (CSS particles)
   ═══════════════════════════════════════ */

function triggerInvalidBurst(cx, cy) {
  const burst = document.createElement('div')
  burst.style.cssText = `
    position:fixed;left:${cx}px;top:${cy}px;width:4px;height:4px;
    border-radius:50%;background:#FF5500;pointer-events:none;z-index:20;
    box-shadow:0 0 6px #FF5500;
  `
  document.body.appendChild(burst)

  // Animate burst
  burst.animate([
    { transform: 'scale(0)', opacity: 1 },
    { transform: 'scale(8)', opacity: 0 }
  ], { duration: 600, easing: 'ease-out' }).onfinish = () => burst.remove()

  console.log(
    '%c🔥  [Schema Error]: Matrix Mismatch',
    'color: #FF5500; font-size: 13px; font-weight: bold; font-family: monospace;'
  )
}

/* ═══════════════════════════════════════
   CHECK → SAFARI
   ═══════════════════════════════════════ */

function checkAllConnected() {
  const seen = new Set()
  _connections.forEach(c => { seen.add(c.from.key); seen.add(c.to.key) })
  if (seen.size >= 3 && !window.__safariTriggered) {
    window.__safariTriggered = true
    document.dispatchEvent(new CustomEvent('connections-ready'))
  }
}

/* ═══════════════════════════════════════
   PER‑FRAME UPDATE
   ═══════════════════════════════════════ */

export function updateConnections() {
  if (_connections.length === 0) return
  _flowTime += 0.05
  // SVG stroke‑dash animation for flowing effect
  _connections.forEach((c, i) => {
    const dash = (Math.sin(_flowTime + i) * 4 + 8).toFixed(0)
    c.path.setAttribute('stroke-dasharray', `${dash} ${16 - dash}`)
    c.path.setAttribute('stroke-dashoffset', String(-_flowTime * 3))
  })
}

/* ═══════════════════════════════════════
   TEST / TRIGGER
   ═══════════════════════════════════════ */

export function triggerConnection(fromKey, toKey, nodeRefs) {
  const from = nodeRefs.find(n => n.data.key === fromKey)
  const to = nodeRefs.find(n => n.data.key === toKey)
  if (!from || !to) return
  // Get screen positions from overlay cards
  const fromCard = document.querySelector(`.project-label.card[data-key="${fromKey}"]`)
  const toCard = document.querySelector(`.project-label.card[data-key="${toKey}"]`)
  if (!fromCard || !toCard) return
  const fr = fromCard.getBoundingClientRect()
  const tr = toCard.getBoundingClientRect()
  const fromSx = fr.left, fromSy = fr.top + fr.height / 2
  const toSx = tr.right, toSy = tr.top + tr.height / 2

  if (isValid(fromKey, toKey)) {
    addConnection({ key: fromKey, sx: fromSx, sy: fromSy }, { key: toKey, sx: toSx, sy: toSy })
  } else {
    triggerInvalidBurst((fromSx + toSx) / 2, (fromSy + toSy) / 2)
  }
}

window.__testConnection = (fromKey, toKey) => {
  if (window.__floatingNodeRefs) triggerConnection(fromKey, toKey, window.__floatingNodeRefs)
}

/* ═══════════════════════════════════════
   CLEANUP
   ═══════════════════════════════════════ */

export function clearConnections() {
  if (_svgOverlay) _svgOverlay.innerHTML = ''
  _connections = []
  _dragPath = null
  _dragFrom = null
  _dragTo = null
  _dragging = false
  window.__safariTriggered = false
}
