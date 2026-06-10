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
import { updateConnections } from './connections.js'

/* ── Constants ── */
const GRID_SIZE       = 64     // 4rem ≈ 64px
const BURST_DURATION  = 1000   // ms — phase 1
const SETTLE_DURATION = 1200   // ms — phase 2
const TOTAL_DURATION  = BURST_DURATION + SETTLE_DURATION
const FLOAT_STAGGER   = 50     // ms delay between node re-appearances

/* ── Module-level state ── */
let _triggered = false
let _activeCamera = null

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
  _activeCamera = camera
  let clickTimer = null
  const DOUBLE_CLICK_DELAY = 280

  document.addEventListener('click', () => {
    if (getState() !== STATES.IDLE) return
    if (clickTimer) {
      clearTimeout(clickTimer); clickTimer = null
      startExplosion(scene, sphere, camera)
      return
    }
    clickTimer = setTimeout(() => { clickTimer = null }, DOUBLE_CLICK_DELAY)
  })

  // Mobile: touch‑tap → same double‑tap logic
  document.addEventListener('touchstart', (e) => {
    if (getState() !== STATES.IDLE) return
    if (e.touches.length > 1) return  // pinch, not tap
    if (clickTimer) {
      clearTimeout(clickTimer); clickTimer = null
      e.preventDefault()  // prevent zoom
      startExplosion(scene, sphere, camera)
      return
    }
    clickTimer = setTimeout(() => { clickTimer = null }, DOUBLE_CLICK_DELAY)
  }, { passive: false })

  // Mobile: swipe up → explode, swipe down → implode
  let _touchY = null
  let _touchContactOpen = false
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      _touchY = e.touches[0].clientY
      // Save whether contact was open at touch START
      const cel = document.getElementById('contact-overlay')
      _touchContactOpen = !!(cel && (cel.getAttribute('style') || '').includes('opacity: 1'))
    }
  }, { passive: true })
  document.addEventListener('touchend', (e) => {
    if (_touchY === null) return
    const dy = _touchY - (e.changedTouches?.[0]?.clientY || _touchY)
    _touchY = null
    const state = getState()
    // Skip entire swipe if contact was open at touch start (user is scrolling contact page)
    if (_touchContactOpen) { _touchContactOpen = false; return }
    // Also skip if terminal is open
    const termEl = document.getElementById('terminal-overlay')
    if (termEl && termEl.classList.contains('active')) return
    _touchContactOpen = false
    if (dy > 50 && state === STATES.IDLE) {
      // Swipe up → explode
      startExplosion(scene, sphere, camera)
    } else if (dy > 50 && state === STATES.FLOATING) {
      // Swipe up in floating → contact page
      window.dispatchEvent(new CustomEvent('open-contact'))
    } else if (dy < -50 && state === STATES.FLOATING) {
      // Swipe down → implode (return to sphere)
      resetExplosion(sphere)
    }
  }, { passive: true })

  // Global callback for MediaPipe
  window.__triggerExplosion = () => {
    if (getState() !== STATES.IDLE) return
    startExplosion(scene, sphere, camera)
  }

  // Reset on Escape (skip if contact overlay is open)
  window.addEventListener('keydown', (e) => {
    const co = document.getElementById('contact-overlay')
    const coOpen = co && (co.getAttribute('style') || '').includes('opacity: 1')
    if (e.key === 'Escape' && getState() !== STATES.IDLE && !coOpen) {
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
  if (guide) guide.style.display = 'none'
  const sysInfo = document.getElementById('system-info')
  if (sysInfo) sysInfo.style.display = 'none'

  // ── Hide ALL sphere labels, show fixed name ──
  sphere.infoRefs.forEach((ref) => {
    ref.el.style.transition = 'opacity 0.5s ease'
    ref.el.style.opacity = '0'
  })
  if (sphere.tagRefs) {
    sphere.tagRefs.forEach((ref) => {
      ref.el.style.transition = 'opacity 0.5s ease'
      ref.el.style.opacity = '0'
    })
  }
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
  a1: ['GraphRAG', 'n8n工作流编排', 'LLM数据提取'],
  a2: ['元数据逆向解析', '多层嵌套交互画布', 'LLM智能评估'],
  b1: ['跨部门资源协同调度', '复杂B端业务流程解构', '大规模资产纳管'],
  b2: ['合规化线上双审流程', '人才自动分配机制'],
  b3: ['存量功能逻辑重构', '多单位权限划分', '多模块业务集成'],
}

/* ── (Bubbles rendered via fixed overlay) ── */

function initNodeFloating(sphere, camera) {
  window.__floatingNodeRefs = sphere.nodeRefs
  const group = sphere.group
  group.rotation.set(0, 0, 0)
  group.scale.setScalar(1)
  group.position.set(0, 0, 0)

  // Hide CSS2DObject versions (keep on sphere group but hidden)
  sphere.nodeRefs.forEach(ref => { ref.obj.visible = false })

  // Create floating overlay for card elements
  const overlay = document.getElementById('card-overlay') || (()=>{
    const d = document.createElement('div')
    d.id = 'card-overlay'
    d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10'
    document.body.appendChild(d)
    return d
  })()
  overlay.innerHTML = ''

  const isMobile = window.innerWidth < 768
  const base3D = isMobile
    ? [[0, 2.8],[0, 1.4],[0, 0],[0,-1.4],[0,-2.8]]
    : [[-3.0,2.0],[3.0,2.0],[0,0],[-3.0,-2.0],[3.0,-2.0]]
  const _vec3 = new THREE.Vector3()

  const nodes = sphere.nodeRefs.map((ref, i) => {
    const key = ref.data.key
    const [bx, by] = base3D[i % base3D.length]

    // Create overlay card element
    const cardEl = document.createElement('div')
    cardEl.className = 'project-label card'
    cardEl.dataset.key = key
    cardEl.style.cssText = 'pointer-events:auto;position:fixed;opacity:0'
    const showLeft = !['b1','b2','b3'].includes(key)
    const showRight = !['a1','a2'].includes(key)
    cardEl.innerHTML = [
      showLeft ? '<span class="endpoint left" data-key="'+key+'"></span>' : '',
      '<div class="pl-body"><span class="pl-title">'+ref.data.label+'</span><span class="pl-desc">'+ref.data.desc+'</span></div>',
      showRight ? '<span class="endpoint right" data-key="'+key+'"></span>' : '',
    ].join('')
    overlay.appendChild(cardEl)

    // Pre-compute screen position from 3D
    // Pre-compute screen target for entry animation
    const halfW = window.innerWidth / 2, halfH = window.innerHeight / 2
    const scale = 68
    const targetY = halfH - by * scale

    return {
      ref,
      el: cardEl,
      key,
      bx, by,
      _targetY: targetY,
      _dragOffsetX: 0,
      _dragOffsetY: 0,
      floatPhase: (i / sphere.nodeRefs.length) * Math.PI * 2,
      appeared: false,
      bubbles: [],
      dragging: false,
      _pinned: false,
    }
  })

  sphere._floatingNodes = nodes
  sphere._floatTime = 0

  nodes.forEach((node, i) => {
    setTimeout(() => {
      const el = node.el
      const key = node.ref.data.key
      // Spring entry: fast elastic drop
      el.style.top = '-180px'
      el.style.opacity = '0'
      requestAnimationFrame(() => {
        el.style.transition =
          'top 0.4s cubic-bezier(0.22, 0.8, 0.15, 1.5), opacity 0.25s ease'
        el.style.top = node._targetY + 'px'
        el.style.opacity = '1'
      })
      node.appeared = true

      // Event listeners (once per element lifetime)
      if (el.dataset._listeners) return
      el.dataset._listeners = '1'

      /* ── State 03: Hover Iridescent ── */
      el.addEventListener('mouseenter', () => {
        if (node.dragging) return
        el.classList.add('iridescent')
        showBubbles(node, key)
        // Dim all OTHER cards
        document.querySelectorAll('.project-label.card').forEach(other => {
          if (other !== el) other.style.opacity = '0.3'
        })
      })

      el.addEventListener('mouseleave', () => {
        el.classList.remove('iridescent')
        hideBubbles(node)
        // Restore ALL cards
        document.querySelectorAll('.project-label.card').forEach(other => {
          other.style.opacity = '1'
        })
      })

      /* ── Mobile: long‑press → show bubbles + ripple ── */
      let longTouch = null
      let _rippleNodes = null
      let _wasLongPress = false
      el.addEventListener('touchstart', () => {
        _wasLongPress = false
        longTouch = setTimeout(() => {
          _wasLongPress = true
          el.classList.add('iridescent')
          showBubbles(node, key)
          // Ripple: push other nodes away
          if (sphere._floatingNodes) {
            const cx = parseFloat(el.style.left) || 0
            const cy = parseFloat(el.style.top) || 0
            _rippleNodes = []
            sphere._floatingNodes.forEach(other => {
              if (other.key === key) return
              const ox = parseFloat(other.el.style.left) || 0
              const oy = parseFloat(other.el.style.top) || 0
              const dx = ox - cx, dy = oy - cy
              const dist = Math.sqrt(dx*dx + dy*dy) || 1
              const force = Math.max(0, 150 - dist) / 150 * 80
              other._dragOffsetX = (dx/dist) * force
              other._dragOffsetY = (dy/dist) * force
              _rippleNodes.push(other)
            })
          }
        }, 600)
      }, { passive: true })
      el.addEventListener('touchend', () => {
        clearTimeout(longTouch)
        el.classList.remove('iridescent')
        hideBubbles(node)
        if (_rippleNodes) {
          _rippleNodes.forEach(n => { n._dragOffsetX = 0; n._dragOffsetY = 0 })
          _rippleNodes = null
        }
      }, { passive: true })

      /* ── State 03: Click → Terminal (skip after long‑press) ── */
      el.addEventListener('click', (e) => {
        if (_wasLongPress) { _wasLongPress = false; return }
        if (e.target.closest('.endpoint')) return
        if (node._justDragged) { node._justDragged = false; return }
        node.dragging = false
        e.stopPropagation()
        openTerminal(key)
      })

      /* ── State 04: Endpoint drag → connection ── */
      const endpoints = el.querySelectorAll('.endpoint')
      endpoints.forEach(ep => {
        ep.addEventListener('mousedown', (e) => {
          e.stopPropagation()
          const r = node.el.getBoundingClientRect()
          const isR = ep.classList.contains('right')
          const dotX = r.left + (isR ? r.width + 8 : -8)
          const dotY = r.top + r.height / 2
          startDrag(key, dotX, dotY)
        })
        ep.addEventListener('mouseenter', () => {
          const r = node.el.getBoundingClientRect()
          const isR = ep.classList.contains('right')
          const dotX = r.left + (isR ? r.width + 8 : -8)
          const dotY = r.top + r.height / 2
          setDragTarget(key, dotX, dotY)
        })
        ep.addEventListener('mouseleave', () => {
          clearDragTarget()
        })
      })

      /* ── Simple pixel drag ── */
      const body = el.querySelector('.pl-body') || el

      body.addEventListener('mousedown', (e) => {
        if (e.target.closest('.endpoint') || e.target.closest('.bubble')) return
        const startX = e.clientX, startY = e.clientY
        const initLeft = parseFloat(el.style.left) || 0
        const initTop  = parseFloat(el.style.top)  || 0
        let moved = false
        node.dragging = false

        const onMove = (ev) => {
          const dx = ev.clientX - startX, dy = ev.clientY - startY
          if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            moved = true; node.dragging = true
            el.style.cursor = 'grabbing'
            el.style.transition = 'none'
          }
          if (moved) {
            el.style.left = (initLeft + dx) + 'px'
            el.style.top  = (initTop  + dy) + 'px'
            el.style.transform = 'translate(-50%, -50%)'
            node._pinLeft = initLeft + dx
            node._pinTop  = initTop + dy
          }
        }

        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          if (moved) {
            node.dragging = false; node._pinned = true
            node._justDragged = true
            el.style.cursor = 'grab'; el.style.transition = ''
            setTimeout(() => { node._justDragged = false }, 100)
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

/* ── Bubble overlay (fixed, never affects card layout) ── */
let _bubbleOverlay = null
function ensureBubbleOverlay() {
  if (!_bubbleOverlay) {
    _bubbleOverlay = document.createElement('div')
    _bubbleOverlay.id = 'bubble-overlay'
    _bubbleOverlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200'
    document.body.appendChild(_bubbleOverlay)
  }
  return _bubbleOverlay
}

/* ── Show bubbles via fixed overlay ── */
function showBubbles(node, key) {
  const caps = CAPABILITIES[key]
  if (!caps || node.bubbles.length > 0) return

  const overlay = ensureBubbleOverlay()
  const rect = node.el.getBoundingClientRect()
  // Card center in screen coords
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const isMobile = window.innerWidth < 768
  const gap = isMobile ? 40 : 80

  // All bubbles above the card, evenly spread horizontally
  const bubbleWidth = isMobile ? 100 : 140
  const totalWidth = caps.length * bubbleWidth + (caps.length - 1) * 10
  const startX = cx - totalWidth / 2 + bubbleWidth / 2

  const offsets = caps.map((_, i) => ({
    left: startX + i * (bubbleWidth + 10),
    top: cy - rect.height / 2 - gap,
    transform: 'translateX(-50%)',
  }))

  caps.forEach((text, i) => {
    const bubble = document.createElement('div')
    bubble.className = 'bubble'
    bubble.textContent = `◈ ${text}`
    const pos = offsets[i] || offsets[0]
    bubble.style.left = pos.left + 'px'
    bubble.style.top = pos.top + 'px'
    bubble.style.transform = pos.transform
    bubble.style.position = 'fixed'
    overlay.appendChild(bubble)
    node.bubbles.push(bubble)

    requestAnimationFrame(() => {
      setTimeout(() => bubble.classList.add('visible'), i * 100)
    })
  })
}

/* ── Hide/remove bubbles ── */
function hideBubbles(node) {
  node.bubbles.forEach(b => {
    b.classList.remove('visible')
    b.classList.add('hiding')
    setTimeout(() => b.remove(), 300)
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

  const w = window.innerWidth, h = window.innerHeight
  const halfW = w / 2, halfH = h / 2
  const scale = 68

  const mobile = window.innerWidth < 768
  const xPos = mobile ? [0, 0, 0, 0, 0] : [-3.0, 3.0, 0, -3.0, 3.0]
  const yPos = mobile ? [2.8, 1.4, 0, -1.4, -2.8] : [2.0, 2.0, 0, -2.0, -2.0]

  for (const node of nodes) {
    if (!node.appeared || node.dragging) continue

    const idx = nodes.indexOf(node)
    const x3d = xPos[idx] || 0
    const y3d = yPos[idx] || 0
    const floatY = Math.sin(time * 1.2 + node.floatPhase) * 3

    if (node._pinned) {
      // Pinned: keep dragged left/top, add float via transform
      const floatPx = Math.sin(time * 1.2 + node.floatPhase) * 2
      if (node._pinLeft !== undefined) {
        node.el.style.left = node._pinLeft + 'px'
        node.el.style.top  = node._pinTop + 'px'
      }
      node.el.style.transform = 'translate(-50%, calc(-50% + ' + floatPx + 'px))'
    } else {
      // Normal: base position + float + ripple offset
      const sx = halfW + x3d * scale + (node._dragOffsetX || 0)
      const sy = halfH - y3d * scale + (node._dragOffsetY || 0)
      node.el.style.left = sx + 'px'
      node.el.style.top = (sy + floatY) + 'px'
      node.el.style.transform = 'translate(-50%, -50%)'
    }
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

  // Clear pinned flags from all nodes
  if (sphere._floatingNodes) {
    sphere._floatingNodes.forEach(n => { n._pinned = false; n.dragging = false })
  }
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

  // 3. Restore ALL sphere labels
  sphere.infoRefs.forEach((ref) => { ref.el.style.opacity = '1' })
  if (sphere.tagRefs) sphere.tagRefs.forEach((ref) => { ref.el.style.opacity = '1' })

  // 4. Clear overlays
  if (_bubbleOverlay) _bubbleOverlay.innerHTML = ''
  const cardOverlay = document.getElementById('card-overlay')
  if (cardOverlay) cardOverlay.remove()

  // 5. Restore CSS2DObjects visibility and sphere positions
  sphere.nodeRefs.forEach((ref, i) => {
    const body = ref.el.querySelector('.pl-body')
    if (body) {
      const t = body.querySelector('.pl-title')
      const d = body.querySelector('.pl-desc')
      if (t) t.textContent = ref.data.label
      if (d) d.textContent = ref.data.desc
    }
    ref.el.className = 'project-label'
    ref.el.style.cssText = ''
    ref.obj.visible = true
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
  if (guide) guide.style.display = ''
  const sysInfo = document.getElementById('system-info')
  if (sysInfo) sysInfo.style.display = ''

  // 8. Transition state machine
  resetStateMachine()

  console.log(
    '%c⏣  KERNEL_REINTEGRATION: Complete — State 01 restored',
    'color: #22c55e; font-family: monospace;'
  )
}
