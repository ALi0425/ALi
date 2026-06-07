/**
 * ═══════════════════════════════════════════
 *  State 02 — Explosion + Grid Adsorption + Node Floating + Reset
 *
 *  Double-click OR MediaPipe trigger → particles burst outward,
 *  snap to 4rem grid intersection points via camera projection,
 *  nodes float freely with fluid repulsion.
 *  Escape key resets everything back to State 01.
 * ═══════════════════════════════════════════
 */

import * as THREE from 'three'
import { setState, getState, STATES, reset as resetStateMachine } from './state.js'
import { openTerminal, closeTerminal } from './terminal.js'
import { startDrag, setDragTarget, clearDragTarget } from './connections.js'

/* ── Constants ── */
const GRID_SIZE       = 64     // 4rem ≈ 64px
const BURST_DURATION  = 1000   // ms — phase 1
const SETTLE_DURATION = 1200   // ms — phase 2
const TOTAL_DURATION  = BURST_DURATION + SETTLE_DURATION
const FLOAT_STAGGER   = 120    // ms delay between node re-appearances

/* ── Module-level state ── */
let _triggered = false

/* ── Fibonacci (shared with sphere.js logic) ── */
function fibonacciPoints(count, radius) {
  const pts = new Float32Array(count * 3)
  const phi = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const θ = 2 * Math.PI * i * phi
    pts[i * 3]     = r * Math.cos(θ) * radius
    pts[i * 3 + 1] = y * radius
    pts[i * 3 + 2] = r * Math.sin(θ) * radius
  }
  return pts
}

/* ── Cubic‑bezier(0.1, 1, 0.1, 1) approximation ── */
function convergeEase(t) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - Math.pow(1 - t, 2.5)
}

/* ── Ease-out cubic ── */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/* ═══════════════════════════════════════
   PUBLIC: INIT
   ═══════════════════════════════════════ */

export function initExplosion(scene, sphere, camera) {
  let clickTimer = null
  const DOUBLE_CLICK_DELAY = 280

  document.addEventListener('click', () => {
    if (getState() !== STATES.IDLE) return

    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
      startExplosion(scene, sphere, camera)
      return
    }

    clickTimer = setTimeout(() => { clickTimer = null }, DOUBLE_CLICK_DELAY)
  })

  // Global callback for MediaPipe
  window.__triggerExplosion = () => {
    if (getState() !== STATES.IDLE) return
    startExplosion(scene, sphere, camera)
  }

  // Reset on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getState() !== STATES.IDLE) {
      resetExplosion(sphere)
    }
  })

  return {
    startExplosion: () => startExplosion(scene, sphere, camera),
    resetExplosion: () => resetExplosion(sphere),
  }
}

/* ═══════════════════════════════════════
   START EXPLOSION
   ═══════════════════════════════════════ */

function startExplosion(scene, sphere, camera) {
  if (_triggered) return
  _triggered = true

  if (!setState(STATES.EXPLODE)) return

  console.log(
    '%c💥  KERNEL_MODULES DECOUPLING  💥',
    'color: #22c55e; font: bold 14px monospace;'
  )

  // ── Hide UI ──
  const guide = document.getElementById('guide-hint')
  if (guide) guide.style.opacity = '0'
  const sysInfo = document.getElementById('system-info')
  if (sysInfo) sysInfo.style.opacity = '0'

  // ── Hide ALL personal info on sphere, show fixed name top‑right ──
  sphere.infoRefs.forEach((ref) => {
    ref.el.style.transition = 'opacity 0.5s ease'
    ref.el.style.opacity = '0'
  })
  if (sphere.nameFixedEl) {
    sphere.nameFixedEl.style.opacity = '1'
  }

  // ── Detach sphere from rotation ──
  sphere.group.rotation.x = 0
  sphere.group.rotation.y = 0
  sphere.group.rotation.z = 0
  sphere.group.scale.setScalar(1)

  // ── Allocate velocity & target buffers ──
  const count = sphere.particlePos.length / 3
  sphere.velocities = new Float32Array(count * 3)
  sphere.targets    = new Float32Array(count * 3)

  computeGridTargets(sphere, camera)
  initBurstVelocities(sphere)

  // ── Fade nodes out ──
  sphere.nodeRefs.forEach(({ el }) => {
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
    el.style.opacity = '0'
    el.style.transform = 'scale(0.8)'
  })

  runExplosionAnimation(sphere, camera)
}

/* ═══════════════════════════════════════
   GRID TARGETS  (camera‑accurate projection)
   ═══════════════════════════════════════ */

function computeGridTargets(sphere, camera) {
  const pos = sphere.particlePos
  const count = pos.length / 3
  const targets = sphere.targets
  const w = window.innerWidth
  const h = window.innerHeight
  const vec = new THREE.Vector3()
  const occupancy = new Map()

  // Pre‑build grid intersection list
  const gridPoints = []
  for (let gx = 0; gx <= w; gx += GRID_SIZE) {
    for (let gy = 0; gy <= h; gy += GRID_SIZE) {
      gridPoints.push({ x: gx, y: gy })
    }
  }

  for (let i = 0; i < count; i++) {
    vec.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
    vec.project(camera)

    // NDC → pixel
    let sx = (vec.x * 0.5 + 0.5) * w
    let sy = (-vec.y * 0.5 + 0.5) * h
    sx = Math.max(0, Math.min(w, sx))
    sy = Math.max(0, Math.min(h, sy))

    // Snap to nearest 64‑px grid intersection
    let gx = Math.round(sx / GRID_SIZE) * GRID_SIZE
    let gy = Math.round(sy / GRID_SIZE) * GRID_SIZE
    gx = Math.max(0, Math.min(w, gx))
    gy = Math.max(0, Math.min(h, gy))

    // Collision‑spread: spiral outward when grid cell taken
    let finalX = gx, finalY = gy
    let attempts = 0
    while (occupancy.has(`${finalX},${finalY}`) && attempts < 24) {
      attempts++
      const step = Math.ceil(attempts / 4) * GRID_SIZE
      const dir = attempts % 4
      if (dir === 0)      { finalX = gx + step; finalY = gy }
      else if (dir === 1) { finalX = gx; finalY = gy + step }
      else if (dir === 2) { finalX = gx - step; finalY = gy }
      else                { finalX = gx; finalY = gy - step }
      finalX = Math.max(0, Math.min(w, finalX))
      finalY = Math.max(0, Math.min(h, finalY))
    }
    occupancy.set(`${finalX},${finalY}`, true)

    // Pixel → NDC → 3D (preserve depth from project())
    const ndx = (finalX / w) * 2 - 1
    const ndy = -(finalY / h) * 2 + 1
    vec.set(ndx, ndy, Math.min(vec.z, 0.99))
    vec.unproject(camera)

    targets[i * 3]     = vec.x
    targets[i * 3 + 1] = vec.y
    targets[i * 3 + 2] = vec.z * 0.3
  }
}

function initBurstVelocities(sphere) {
  const pos = sphere.particlePos
  const count = pos.length / 3
  const vel = sphere.velocities

  for (let i = 0; i < count; i++) {
    const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
    const len = Math.sqrt(pos[ix] ** 2 + pos[iy] ** 2 + pos[iz] ** 2) || 1
    const speed = 0.5 + Math.random() * 0.6
    vel[ix] = (pos[ix] / len) * speed
    vel[iy] = (pos[iy] / len) * speed
    vel[iz] = (pos[iz] / len) * speed
  }
}

/* ═══════════════════════════════════════
   TWO‑PHASE ANIMATION
   ═══════════════════════════════════════ */

function runExplosionAnimation(sphere, camera) {
  const pos = sphere.particlePos
  const vel = sphere.velocities
  const tgt = sphere.targets
  const count = pos.length / 3
  const startTime = performance.now()

  function tick() {
    const elapsed = performance.now() - startTime
    const t = Math.min(elapsed / TOTAL_DURATION, 1)

    if (elapsed < BURST_DURATION) {
      /* ── Phase 1: Fluid Burst ── */
      const phase = elapsed / BURST_DURATION
      const decel = 1 - phase * 0.5

      for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
        pos[ix] += vel[ix] * decel
        pos[iy] += vel[iy] * decel
        pos[iz] += vel[iz] * decel
      }
      sphere.particleMat.opacity = 0.75 * (1 - phase * 0.2)
    } else {
      /* ── Phase 2: Grid Settle ── */
      setState(STATES.SETTLE)
      const settleT = (elapsed - BURST_DURATION) / SETTLE_DURATION
      const ease = convergeEase(settleT)

      for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
        pos[ix] += (tgt[ix] - pos[ix]) * ease * 0.15
        pos[iy] += (tgt[iy] - pos[iy]) * ease * 0.15
        pos[iz] += (tgt[iz] - pos[iz]) * ease * 0.15
      }

      sphere.particleMat.opacity = Math.max(0.2, 0.6 * (1 - ease * 0.7))
      sphere.particleMat.size    = Math.max(0.05, 0.18 * (1 - ease * 0.8))
    }

    sphere.particleGeo.attributes.position.needsUpdate = true

    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      // ── Complete ──
      sphere.particleMat.opacity = 0.2
      sphere.particleMat.size    = 0.05
      setState(STATES.FLOATING)

      console.log(
        `%c◈  Particles adsorbed: ${count}/${count}`,
        'color: #22c55e; font-family: monospace;'
      )
      console.log(
        '%c[Schema Error]: Matrix Mismatch',
        'color: #ef4444; font-family: monospace;'
      )

      initNodeFloating(sphere, camera)
    }
  }

  tick()
}

/* ═══════════════════════════════════════
   NODE FLOATING
   ═══════════════════════════════════════ */

/* ── Capability bubbles data ── */
const CAPABILITIES = {
  a1: ['n8n工作流自动化', 'GraphRAG双库分流', 'JSON Mode提取'],
  a2: ['元数据逆向解析', '嵌套交互画布', '强Schema校验'],
  b1: ['20+业务流程拆解', '纳管12805项成果', '效率提升60%+'],
  b2: ['万级数据高效协同', '14家二级单位协同'],
  doc: ['技术规范书', '可行性研究报告', '需规说明书'],
}

/* ── Bubble positions (relative offsets from card center) ── */
const BUBBLE_POSITIONS = [
  { top: '-60px', left: '50%', transform: 'translateX(-50%)' },
  { top: '50%',   left: '-30px', transform: 'translateX(-100%) translateY(-50%)' },
  { top: '50%',   right: '-30px', transform: 'translateX(100%) translateY(-50%)' },
]

function initNodeFloating(sphere, camera) {
  window.__floatingNodeRefs = sphere.nodeRefs

  const nodes = sphere.nodeRefs.map((ref, i) => {
    const pos = ref.obj.position.clone()
    const dir = pos.clone().normalize()

    // Fixed positions — 3 rows, no overlap
    const rows = [
      { x: -3.5, y:  3.0, z:  0 },
      { x:  3.5, y:  3.0, z:  0 },
      { x:  0,   y:  0.5, z:  0 },
      { x: -3.5, y: -2.0, z:  0 },
      { x:  3.5, y: -2.0, z:  0 },
    ]
    const cfg = rows[i % rows.length]
    const scattered = new THREE.Vector3(cfg.x, cfg.y, cfg.z)

    // Set exact fixed position — no physics drift
    ref.obj.position.set(scattered.x, scattered.y, scattered.z)

    return {
      ref,
      pos3D: ref.obj.position,
      velocity: new THREE.Vector3(0, 0, 0),
      floatPhase: (i / sphere.nodeRefs.length) * Math.PI * 2,
      appeared: false,
      bubbles: [],
      dragging: false,
      dragOffset: new THREE.Vector3(),
    }
  })

  sphere._floatingNodes = nodes
  sphere._floatTime = 0

  nodes.forEach((node, i) => {
    setTimeout(() => {
      const el = node.ref.el
      const key = node.ref.data.key
      el.style.transition =
        'opacity 0.8s cubic-bezier(0.1, 1, 0.1, 1), transform 0.8s cubic-bezier(0.1, 1, 0.1, 1)'
      el.style.opacity = '1'
      el.style.transform = 'scale(1)'
      el.classList.add('card')
      node.appeared = true

      /* ── State 03: Hover Iridescent ── */
      el.addEventListener('mouseenter', () => {
        if (node.dragging) return
        el.classList.add('iridescent')
        showBubbles(node, key)
      })

      el.addEventListener('mouseleave', () => {
        el.classList.remove('iridescent')
        hideBubbles(node)
      })

      /* ── State 03: Click → Terminal ── */
      el.addEventListener('click', (e) => {
        if (e.target.closest('.endpoint')) return
        // Ensure drag flag is reset (safety for incomplete drags)
        node.dragging = false
        e.stopPropagation()
        openTerminal(key)
      })

      /* ── State 04: Endpoint drag → connection ── */
      const endpoints = el.querySelectorAll('.endpoint')
      endpoints.forEach(ep => {
        ep.addEventListener('mousedown', (e) => {
          e.stopPropagation()
          // Compute endpoint at card edge: tangent to sphere × card half‑width
          const pos = node.ref.obj.position
          const dir = pos.clone().normalize()
          // Tangent = cross(up, dir) for horizontal offset
          const up = new THREE.Vector3(0, 1, 0)
          const tangent = new THREE.Vector3().crossVectors(up, dir).normalize()
          const cardHalf3D = 0.35  // visual half‑width in 3D space at this distance
          const endpointPos = pos.clone().add(tangent.clone().multiplyScalar(
            ep.classList.contains('right') ? cardHalf3D : -cardHalf3D
          ))
          startDrag(key, endpointPos)
        })
        ep.addEventListener('mouseenter', () => {
          setDragTarget(key, node.ref.obj.position)
        })
        ep.addEventListener('mouseleave', () => {
          clearDragTarget()
        })
      })

      /* ── NEW: Drag card body to reposition ── */
      const body = el.querySelector('.pl-body') || el
      let dragStarted = false
      let startX = 0, startY = 0
      const startPos = new THREE.Vector3()

      body.addEventListener('mousedown', (e) => {
        if (e.target.closest('.endpoint') || e.target.closest('.bubble')) return
        dragStarted = false
        startX = e.clientX
        startY = e.clientY
        startPos.copy(node.pos3D)
        node.dragging = false

        const onMove = (ev) => {
          const dx = ev.clientX - startX
          const dy = ev.clientY - startY
          if (!dragStarted && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragStarted = true
            node.dragging = true
            el.style.cursor = 'grabbing'
            el.style.transition = 'none'
          }
          if (dragStarted) {
            // Convert pixel delta to 3D delta (approximate)
            const scale = 0.012
            node.pos3D.x = startPos.x + dx * scale
            node.pos3D.y = startPos.y - dy * scale
            // Zero out velocity so physics doesn't fight the drag
            node.velocity.set(0, 0, 0)
          }
        }

        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          if (dragStarted) {
            node.dragging = false
            el.style.cursor = 'grab'
            el.style.transition = ''
          }
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })

    }, FLOAT_STAGGER * i)
  })

  console.log(
    '%c◈  Nodes scattered: drag enabled, full‑page spread',
    'color: #22c55e; font-family: monospace;'
  )
}

/* ── Create/show capability bubbles ── */
function showBubbles(node, key) {
  const caps = CAPABILITIES[key]
  if (!caps || node.bubbles.length > 0) return

  const el = node.ref.el
  // Position parent must be relative for bubble positioning
  el.style.position = 'relative'

  caps.forEach((text, i) => {
    const bubble = document.createElement('div')
    bubble.className = 'bubble'
    bubble.textContent = `◈ ${text}`
    const pos = BUBBLE_POSITIONS[i] || BUBBLE_POSITIONS[0]
    Object.assign(bubble.style, pos)
    el.appendChild(bubble)
    node.bubbles.push(bubble)

    // Staggered appear
    requestAnimationFrame(() => {
      setTimeout(() => bubble.classList.add('visible'), i * 100)
    })
  })
}

/* ── Hide/remove bubbles ── */
function hideBubbles(node) {
  node.bubbles.forEach(b => {
    b.classList.remove('visible')
    setTimeout(() => b.remove(), 400)
  })
  node.bubbles = []
}

/**
 * Per‑frame update for floating nodes — call from main loop.
 */
export function updateFloatingNodes(sphere, deltaMs = 16) {
  if (!sphere._floatingNodes || getState() !== STATES.FLOATING) return

  const nodes = sphere._floatingNodes
  sphere._floatTime += deltaMs * 0.001
  const time = sphere._floatTime

  const REPULSION_RADIUS    = 3.0
  const REPULSION_STRENGTH  = 0.001
  const DAMPING             = 0.99
  const CENTER_ATTRACTION   = 0.00001
  const BOUNDARY            = 5.5
  const Y_MIN               = -3.0
  const Y_MAX               = 4.5

  // O(n²) repulsion — only 6 nodes, fine
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i].appeared) continue
    for (let j = i + 1; j < nodes.length; j++) {
      if (!nodes[j].appeared) continue
      const a = nodes[i].pos3D
      const b = nodes[j].pos3D
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < REPULSION_RADIUS && dist > 0.01) {
        const force = ((REPULSION_RADIUS - dist) / REPULSION_RADIUS) * REPULSION_STRENGTH
        const f = force / dist
        nodes[i].velocity.x -= dx * f
        nodes[i].velocity.y -= dy * f
        nodes[i].velocity.z -= dz * f
        nodes[j].velocity.x += dx * f
        nodes[j].velocity.y += dy * f
        nodes[j].velocity.z += dz * f
      }
    }
  }

  for (const node of nodes) {
    if (!node.appeared) continue

    node.velocity.x *= DAMPING
    node.velocity.y *= DAMPING
    node.velocity.z *= DAMPING

    node.velocity.x -= node.pos3D.x * CENTER_ATTRACTION
    node.velocity.y -= (node.pos3D.y - 0.5) * CENTER_ATTRACTION
    node.velocity.z -= node.pos3D.z * CENTER_ATTRACTION

    // Pre‑clamp velocity to prevent leaving boundary
    const nextX = node.pos3D.x + node.velocity.x
    const nextY = node.pos3D.y + node.velocity.y
    const nextZ = node.pos3D.z + node.velocity.z
    if (Math.abs(nextX) > BOUNDARY) node.velocity.x *= -0.3
    if (Math.abs(nextZ) > BOUNDARY) node.velocity.z *= -0.3
    if (nextY > Y_MAX || nextY < Y_MIN) node.velocity.y *= -0.3

    node.pos3D.x += node.velocity.x
    node.pos3D.y += node.velocity.y
    node.pos3D.z += node.velocity.z

    // Hard clamp — snap inside
    node.pos3D.x = Math.max(-BOUNDARY, Math.min(BOUNDARY, node.pos3D.x))
    node.pos3D.z = Math.max(-BOUNDARY, Math.min(BOUNDARY, node.pos3D.z))
    node.pos3D.y = Math.max(Y_MIN, Math.min(Y_MAX, node.pos3D.y))

    // ±5px floating oscillation
    node.pos3D.y += Math.sin(time * 1.2 + node.floatPhase) * 0.0008
  }
}

/* ═══════════════════════════════════════
   RESET → STATE 01
   ═══════════════════════════════════════ */

export function resetExplosion(sphere) {
  if (getState() === STATES.IDLE) return

  console.log(
    '%c⏣  KERNEL_REINTEGRATION: Modules re-engaging…',
    'color: #22c55e; font-family: monospace;'
  )

  const pos = sphere.particlePos
  const orig = sphere.origPos
  const count = pos.length / 3

  sphere._floatingNodes = null

  const nodePositions = fibonacciPoints(sphere.nodeRefs.length, 4.8)

  const duration = 1500
  const startTime = performance.now()

  function tick() {
    const t = Math.min((performance.now() - startTime) / duration, 1)
    const ease = easeOutCubic(t)

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
      pos[ix] += (orig[ix] - pos[ix]) * ease * 0.12
      pos[iy] += (orig[iy] - pos[iy]) * ease * 0.12
      pos[iz] += (orig[iz] - pos[iz]) * ease * 0.12
    }

    sphere.particleGeo.attributes.position.needsUpdate = true
    sphere.particleMat.opacity = 0.2 + t * 0.55
    sphere.particleMat.size    = 0.05 + t * 0.13

    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      finishReset(sphere, nodePositions)
    }
  }

  tick()
}

function finishReset(sphere, nodePositions) {
  // 1. Snap particles to exact original positions
  const pos = sphere.particlePos
  const orig = sphere.origPos
  for (let i = 0; i < pos.length; i++) pos[i] = orig[i]
  sphere.particleGeo.attributes.position.needsUpdate = true

  // 2. Close terminal, hide fixed name
  closeTerminal()
  if (sphere.nameFixedEl) sphere.nameFixedEl.style.opacity = '0'

  // 3. Restore ALL sphere personal info
  sphere.infoRefs.forEach((ref) => {
    ref.el.style.opacity = '1'
  })

  // 4. Nuke all project nodes and rebuild from scratch
  sphere.nodeRefs.forEach((ref, i) => {
    // Completely reset the DOM element
    const parent = ref.el.parentNode
    const newEl = document.createElement('div')
    newEl.className = 'project-label'
    newEl.dataset.key = ref.data.key
    newEl.innerHTML = [
      '<span class="endpoint left" data-key="' + ref.data.key + '"></span>',
      '<div class="pl-body">',
      '  <span class="pl-title">' + ref.data.label + '</span>',
      '  <span class="pl-desc">' + ref.data.desc + '</span>',
      '</div>',
      '<span class="endpoint right" data-key="' + ref.data.key + '"></span>'
    ].join('\n')

    // Replace in CSS2DObject
    if (ref.obj.element && ref.obj.element.parentNode) {
      ref.obj.element.parentNode.replaceChild(newEl, ref.obj.element)
    }
    ref.obj.element = newEl
    ref.el = newEl

    // Reset position on sphere
    ref.obj.position.set(
      nodePositions[i * 3],
      nodePositions[i * 3 + 1],
      nodePositions[i * 3 + 2]
    )
  })

  // 5. Reset sphere group rotation to match accumulated rotation
  sphere.group.rotation.x = sphere._wobbleX || 0
  sphere.group.rotation.y = sphere._autoRotY || 0
  sphere.group.rotation.z = 0
  sphere.group.scale.setScalar(1)

  // 6. Clear explosion state
  sphere.exploding = false
  sphere.explosionProgress = 0
  sphere.velocities = null
  sphere.targets = null
  sphere._floatingNodes = null
  sphere._floatTime = 0
  _triggered = false

  // 7. Re‑show UI
  const guide = document.getElementById('guide-hint')
  if (guide) guide.style.opacity = ''
  const sysInfo = document.getElementById('system-info')
  if (sysInfo) sysInfo.style.opacity = ''

  // 8. Transition state machine
  resetStateMachine()

  console.log(
    '%c⏣  KERNEL_REINTEGRATION: Complete — State 01 restored',
    'color: #22c55e; font-family: monospace;'
  )
}
