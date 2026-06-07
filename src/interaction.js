/**
 * ═══════════════════════════════════════════
 *  Mouse / Touch Tracker with Physics Damping
 * ═══════════════════════════════════════════
 */

export function createMouseTracker() {
  const state = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    // Device motion (fallback for mobile)
    deviceX: 0,
    deviceY: 0,
    useDevice: false,
  }

  // ── Mouse ──
  document.addEventListener('mousemove', (e) => {
    state.targetX = (e.clientX / window.innerWidth) * 2 - 1
    state.targetY = -(e.clientY / window.innerHeight) * 2 + 1
  })

  // ── Touch ──
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0]
    if (t) {
      state.targetX = (t.clientX / window.innerWidth) * 2 - 1
      state.targetY = -(t.clientY / window.innerHeight) * 2 + 1
    }
  }, { passive: true })

  // ── Device Orientation (mobile gyro) ──
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        state.deviceX = Math.max(-1, Math.min(1, e.gamma / 45))
        state.deviceY = Math.max(-1, Math.min(1, (e.beta - 45) / 45))
        state.useDevice = true
      }
    }, { passive: true })
  }

  return state
}

/**
 * Smoothly lerps mouse state — call each frame.
 * @param {object} mouse  — from createMouseTracker()
 * @param {number} factor — lerp speed (default 0.06)
 */
export function dampMouse(mouse, factor = 0.06) {
  const srcX = mouse.useDevice ? mouse.deviceX : mouse.targetX
  const srcY = mouse.useDevice ? mouse.deviceY : mouse.targetY
  mouse.currentX += (srcX - mouse.currentX) * factor
  mouse.currentY += (srcY - mouse.currentY) * factor
}
