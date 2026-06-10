/**
 * ═══════════════════════════════════════════
 *  ali portfolio v5 — Kernel Entry
 *  All 4 States
 * ═══════════════════════════════════════════
 */

import './style.css'
import { createScene } from './scene.js'
import { createSphere, updateSphere } from './sphere.js'
import { createMouseTracker } from './interaction.js'
import { createStatusBar } from './status-bar.js'
import { initExplosion, updateFloatingNodes } from './explosion.js'
import { initMediaPipe } from './mediapipe.js'
import { initConnections, updateConnections, clearConnections } from './connections.js'
import { initSafari, resetSafari } from './safari.js'
import { mountScrollTrigger, unmountScrollTrigger, openContact } from './contact.js'
import { getState, STATES, onEnter } from './state.js'

// ── Bootstrap ──
async function main() {
  const container = document.getElementById('three-container')

  // 1. Three.js Scene
  const mobile = window.innerWidth < 768
  const { scene, camera, renderer, labelRenderer } = createScene(container, mobile)

  // 2. Particle Sphere + Nodes
  const sphere = createSphere(scene, mobile)
  const mouse  = createMouseTracker()

  // 3. UI Components
  createStatusBar()

  // 4. Interaction entry
  initExplosion(scene, sphere, camera)
  initMediaPipe()

  // 5. State 04: Connections + Safari
  initConnections()
  initSafari()

  // 6. State-aware cleanup
  onEnter(STATES.IDLE, () => {
    clearConnections()
    resetSafari()
  })

  // 7. Entrance reveal
  setTimeout(() => {
    revealElement('system-info')
    revealElement('camera-indicator')
    setTimeout(() => revealElement('guide-hint'), 1200)
  }, 400)

  // ── Animation Loop ──
  function animate() {
    requestAnimationFrame(animate)

    const state = getState()

    if (state === STATES.IDLE) {
      updateSphere(sphere, mouse)
      if (window.__contactMounted) {
        unmountScrollTrigger(window)
        window.__contactMounted = false
      }
    } else if (state === STATES.FLOATING) {
      updateFloatingNodes(sphere, 16)
      updateConnections()
      if (!window.__contactMounted) {
        mountScrollTrigger(window)
        window.__contactMounted = true
      }
      showMobileHint(true)
    }

    // Show/hide mobile floating hint
    if (state === STATES.IDLE) {
      showMobileHint(false)
    }

    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
  }

  animate()

  // ── Resize ──
  window.addEventListener('resize', () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    labelRenderer.setSize(w, h)
  })

  window.addEventListener('open-contact', () => openContact())
  window.addEventListener('contact-closed', () => {
    // If contact closed but state is IDLE, re-explode to show floating cards
    if (getState() === STATES.IDLE) window.__triggerExplosion?.()
  })

  console.log(
    '%c⏣  KERNEL ONLINE  ⏣',
    'color: #22c55e; font-size: 16px; font-weight: bold; font-family: monospace;'
  )
  console.log('%cSYSTEM_STATUS: AUTHORIZED_BY_JJ', 'color: #22c55e; font-family: monospace;')
  console.log('%cCURIOSITY: 100%  |  TEAMWORK: ACTIVE', 'color: #525252; font-family: monospace;')
}

function showMobileHint(visible) {
  const el = document.getElementById('mobile-hint')
  if (!el) return
  el.style.opacity = visible ? '1' : '0'
  el.classList.toggle('visible', visible)
}

function revealElement(id) {
  const el = document.getElementById(id)
  if (el) {
    el.style.opacity = ''
    el.classList.remove('opacity-0')
    if (id === 'guide-hint') {
      setTimeout(() => el.classList.add('animate-pulse'), 1200)
    }
  }
}

main().catch(console.error)
