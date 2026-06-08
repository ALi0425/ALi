/**
 * ═══════════════════════════════════════════
 *  State 04 — Drag-to-Connect + Flowing Lines + Schema
 *
 *  Drag from a card endpoint → curved green流光 line
 *  → snap to target endpoint.
 *  Valid: glowing particle flow.
 *  Invalid: orange #FF5500 burst + dissolve.
 * ═══════════════════════════════════════════
 */

import * as THREE from 'three'
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
let _scene       = null
let _camera      = null
let _dragging    = false
let _dragFrom    = null   // { key, pos3D }
let _dragTo      = null   // null or { key, pos3D }
let _connections = []     // active connections

// Three.js objects for the drag line
let _lineMesh = null
let _glowMesh = null

// Particle system for flowing effect
let _flowParticles = null
let _flowTime = 0

const _vec = new THREE.Vector3()

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

export function initConnections(scene, camera) {
  _scene = scene
  _camera = camera

  // Create reusable line geometry
  _lineMesh = createFlowLine()
  _lineMesh.visible = false
  scene.add(_lineMesh)

  _glowMesh = createGlowLine()
  _glowMesh.visible = false
  scene.add(_glowMesh)

  // Flow particles
  _flowParticles = createFlowParticles()
  _flowParticles.visible = false
  scene.add(_flowParticles)

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  return { triggerConnection }
}

/**
 * Called from explosion.js when a card endpoint is mousedowned.
 */
export function startDrag(fromKey, fromPos3D) {
  if (getState() !== STATES.FLOATING) return
  _dragging = true
  _dragFrom = { key: fromKey, pos3D: fromPos3D }
  _dragTo = null
  _lineMesh.visible = true
  _glowMesh.visible = true
}

/**
 * Called from explosion.js when mouseup on a target endpoint.
 */
function onMouseUp(e) {
  if (!_dragging) return
  _dragging = false

  if (_dragTo) {
    // Check schema
    if (isValid(_dragFrom.key, _dragTo.key)) {
      addConnection(_dragFrom.key, _dragTo.key, _dragFrom.pos3D, _dragTo.pos3D)
    } else {
      triggerInvalidBurst(_dragFrom.pos3D, _dragTo.pos3D)
    }
  }

  _lineMesh.visible = false
  _glowMesh.visible = false
  _flowParticles.visible = false
  _dragFrom = null
  _dragTo = null
}

function onMouseMove(e) {
  if (!_dragging || !_dragFrom) return

  // Project mouse to 3D ray and find intersection with z=0 plane
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, _camera)

  // Intersect with a plane at z=0
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const intersect = new THREE.Vector3()
  raycaster.ray.intersectPlane(plane, intersect)

  if (intersect) {
    updateDragLine(_dragFrom.pos3D, intersect)
    _dragTo = null // mouse not over a card
  }
}

/**
 * Called from explosion.js when mouse enters a target endpoint.
 */
export function setDragTarget(key, pos3D) {
  if (!_dragging) return
  _dragTo = { key, pos3D }
  updateDragLine(_dragFrom.pos3D, pos3D)
}

export function clearDragTarget() {
  if (!_dragging) return
  _dragTo = null
}

/* ═══════════════════════════════════════
   DRAG LINE RENDERING
   ═══════════════════════════════════════ */

function updateDragLine(from, to) {
  const points = getCurvePoints(from, to)
  _lineMesh.geometry.dispose()
  _lineMesh.geometry = new THREE.BufferGeometry().setFromPoints(points)

  _glowMesh.geometry.dispose()
  _glowMesh.geometry = new THREE.BufferGeometry().setFromPoints(points)
}

function getCurvePoints(from, to) {
  // Rounded polyline: horizontal → rounded corner → vertical
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const radius = 0.5  // rounding radius

  // Two corner approach: creates a rounded L-shape
  const pts = [
    from,
    new THREE.Vector3(from.x, my, (from.z + to.z) / 2),
    new THREE.Vector3(mx, my, (from.z + to.z) / 2),
    new THREE.Vector3(to.x, my, (from.z + to.z) / 2),
    to,
  ]

  // CatmullRom creates a smooth curve through all points (rounded corner)
  const curve = new THREE.CatmullRomCurve3(pts)
  return curve.getPoints(24)
}

function createFlowLine() {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(33 * 3)
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.6,
    linewidth: 1,
  })
  return new THREE.Line(geo, mat)
}

function createGlowLine() {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(33 * 3)
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.15,
    linewidth: 1,
  })
  const line = new THREE.Line(geo, mat)
  line.scale.setScalar(1.03)
  return line
}

/* ═══════════════════════════════════════
   FLOW PARTICLES
   ═══════════════════════════════════════ */

function createFlowParticles() {
  const count = 60
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 16
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
  g.addColorStop(0, 'rgba(34,197,94,1)')
  g.addColorStop(1, 'rgba(34,197,94,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 16, 16)

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    map: new THREE.CanvasTexture(canvas),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
  })

  return new THREE.Points(geo, mat)
}

function updateFlowParticles(connection) {
  const pos = _flowParticles.geometry.attributes.position.array
  const count = pos.length / 3
  _flowTime += 0.02

  const from = connection.fromPos
  const to = connection.toPos
  const points = getCurvePoints(from, to)
  const totalLen = points.length

  for (let i = 0; i < count; i++) {
    const t = ((i / count) + _flowTime) % 1
    const idx = Math.floor(t * (totalLen - 1))
    const p = points[idx]
    if (p) {
      pos[i * 3]     = p.x + (Math.random() - 0.5) * 0.05
      pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.05
      pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.05
    }
  }

  _flowParticles.geometry.attributes.position.needsUpdate = true
  _flowParticles.visible = true
}

/* ═══════════════════════════════════════
   ADD CONNECTION (valid)
   ═══════════════════════════════════════ */

function addConnection(fromKey, toKey, fromPos, toPos) {
  const conn = { fromKey, toKey, fromPos: fromPos.clone(), toPos: toPos.clone(), active: true }
  _connections.push(conn)

  // Create permanent glowing line
  const points = getCurvePoints(fromPos, toPos)
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const mat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.5,
  })
  conn.line = new THREE.Line(geo, mat)
  _scene.add(conn.line)

  // Glow line
  const glowMat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.1,
  })
  conn.glow = new THREE.Line(geo.clone(), glowMat)
  conn.glow.scale.setScalar(1.05)
  _scene.add(conn.glow)

  // Flow particles for this connection
  const particles = createFlowParticles()
  conn.particles = particles
  _scene.add(particles)

  conn._flowTime = Math.random() * 100

  console.log(
    `%c🔗  CONNECTION: ${fromKey} → ${toKey} — VALID`,
    'color: #22c55e; font-family: monospace;'
  )

  // Check if all nodes are connected → trigger Safari
  checkAllConnected()
}

/* ═══════════════════════════════════════
   INVALID BURST (orange)
   ═══════════════════════════════════════ */

function triggerInvalidBurst(fromPos, toPos) {
  const mid = new THREE.Vector3().copy(fromPos).add(toPos).multiplyScalar(0.5)

  // Create burst particles
  const count = 40
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const vel = []

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = mid.x + (Math.random() - 0.5) * 0.1
    pos[i * 3 + 1] = mid.y + (Math.random() - 0.5) * 0.1
    pos[i * 3 + 2] = mid.z + (Math.random() - 0.5) * 0.1
    vel.push({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3,
      z: (Math.random() - 0.5) * 0.3,
    })
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 16
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
  g.addColorStop(0, 'rgba(255,85,0,1)')
  g.addColorStop(1, 'rgba(255,85,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 16, 16)

  const mat = new THREE.PointsMaterial({
    size: 0.2,
    map: new THREE.CanvasTexture(canvas),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 1,
  })

  const burst = new THREE.Points(geo, mat)
  _scene.add(burst)

  console.log(
    '%c🔥  [Schema Error]: Matrix Mismatch',
    'color: #FF5500; font-size: 13px; font-weight: bold; font-family: monospace;'
  )

  // Animate burst
  const startTime = performance.now()

  function tick() {
    const t = Math.min((performance.now() - startTime) / 800, 1)
    const ease = 1 - Math.pow(1 - t, 2)
    const p = burst.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      p[i * 3]     += vel[i].x * (1 - t * 0.5)
      p[i * 3 + 1] += vel[i].y * (1 - t * 0.5)
      p[i * 3 + 2] += vel[i].z * (1 - t * 0.5)
    }

    burst.geometry.attributes.position.needsUpdate = true
    mat.opacity = 1 - ease

    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      _scene.remove(burst)
      geo.dispose()
      mat.dispose()
    }
  }

  tick()
}

/* ═══════════════════════════════════════
   CONNECTION CHECK → Safari trigger
   ═══════════════════════════════════════ */

function checkAllConnected() {
  const connectedFrom = new Set(_connections.map(c => c.fromKey))
  const connectedTo = new Set(_connections.map(c => c.toKey))
  const all = new Set([...connectedFrom, ...connectedTo])

  // Trigger Safari when 3+ unique nodes are connected
  if (all.size >= 3 && !window.__safariTriggered) {
    window.__safariTriggered = true
    // Will be handled by main.js / safari.js
    document.dispatchEvent(new CustomEvent('connections-ready'))
  }
}

/**
 * Called from main.js animation loop.
 */
export function updateConnections() {
  if (_connections.length === 0) return

  for (const conn of _connections) {
    if (!conn.active) continue
    conn._flowTime = (conn._flowTime || 0) + 0.02

    const points = getCurvePoints(conn.fromPos, conn.toPos)
    const totalLen = points.length

    if (conn.particles) {
      const pos = conn.particles.geometry.attributes.position.array
      const count = pos.length / 3

      for (let i = 0; i < count; i++) {
        const t = ((i / count) + conn._flowTime) % 1
        const idx = Math.floor(t * (totalLen - 1))
        const p = points[idx]
        if (p) {
          pos[i * 3]     = p.x + (Math.random() - 0.5) * 0.05
          pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.05
          pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.05
        }
      }
      conn.particles.geometry.attributes.position.needsUpdate = true
    }
  }
}

/* ═══════════════════════════════════════
   PUBLIC: triggerConnection (for testing)
   ═══════════════════════════════════════ */

export function triggerConnection(fromKey, toKey, nodeRefs, useRight = true) {
  const from = nodeRefs.find(n => n.data.key === fromKey)
  const to = nodeRefs.find(n => n.data.key === toKey)
  if (!from || !to) return
  // Compute endpoint 3D position
  function ep(pos, right) {
    const w4 = new THREE.Vector4(pos.x, pos.y, pos.z, 1)
    w4.applyMatrix4(_camera.matrixWorldInverse).applyMatrix4(_camera.projectionMatrix)
    const ndx = w4.x / w4.w, ndy = w4.y / w4.w
    const sx = (ndx * 0.5 + 0.5) * window.innerWidth
    const off = right ? 178 : -178
    const c4 = new THREE.Vector4((((sx+off)/window.innerWidth)*2-1)*w4.w, ndy*w4.w, w4.z, w4.w)
    c4.applyMatrix4(_camera.projectionMatrixInverse).applyMatrix4(_camera.matrixWorld)
    return new THREE.Vector3(c4.x/c4.w, c4.y/c4.w, c4.z/c4.w)
  }
  const fromPos = ep(from.obj.position, useRight)
  const toPos = ep(to.obj.position, useRight)
  if (isValid(fromKey, toKey)) {
    addConnection(fromKey, toKey, fromPos, toPos)
  } else {
    triggerInvalidBurst(fromPos, toPos)
  }
}

/**
 * Clean up all connections.
 */
export function clearConnections() {
  for (const conn of _connections) {
    if (conn.line) _scene.remove(conn.line)
    if (conn.glow) _scene.remove(conn.glow)
    if (conn.particles) _scene.remove(conn.particles)
  }
  _connections = []
  window.__safariTriggered = false
}

/**
 * Expose global connection test helper for devtools.
 */
window.__testConnection = (fromKey, toKey) => {
  if (window.__floatingNodeRefs) {
    triggerConnection(fromKey, toKey, window.__floatingNodeRefs)
  }
}
