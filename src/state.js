/**
 * ═══════════════════════════════════════════
 *  Application State Machine
 *  Transitions: IDLE → EXPLODE → SETTLE → FLOATING
 *  FLOATING → IDLE (via reset / Escape)
 * ═══════════════════════════════════════════
 */

export const STATES = {
  IDLE:     'STATE_01_IDLE',       // Initial: sphere rotating, breathing
  EXPLODE:  'STATE_02_EXPLODE',    // Particles bursting outward
  SETTLE:   'STATE_02_SETTLE',     // Particles snapping to grid
  FLOATING: 'STATE_02_FLOATING',   // Nodes floating, particles settled on grid
}

/* ── Guard table: which transitions are valid ── */
const VALID_TRANSITIONS = {
  [STATES.IDLE]:     [STATES.EXPLODE],
  [STATES.EXPLODE]:  [STATES.SETTLE],
  [STATES.SETTLE]:   [STATES.FLOATING],
  [STATES.FLOATING]: [STATES.IDLE],
}

/* ── Module state ── */
let _current = STATES.IDLE
const _enterCallbacks = new Map()   // state → Set<fn>

/**
 * Returns the current state string.
 */
export function getState() {
  return _current
}

/**
 * Transition to a new state. Validates against guard table.
 * Triggers onEnter callbacks registered for the new state.
 * @param {string} next  — one of STATES values
 * @param {*} [payload]  — optional data passed to callbacks
 * @returns {boolean}    — true if transition succeeded
 */
export function setState(next, payload) {
  if (_current === next) return false

  const allowed = VALID_TRANSITIONS[_current]
  if (!allowed || !allowed.includes(next)) {
    console.warn(
      `%c⛔  STATE TRANSITION DENIED: ${_current} → ${next}`,
      'color: #ef4444; font-family: monospace;'
    )
    return false
  }

  const prev = _current
  _current = next
  console.log(
    `%c⏣  STATE: ${prev} → ${next}`,
    'color: #22c55e; font-family: monospace;'
  )

  // Fire callbacks
  const cbs = _enterCallbacks.get(next)
  if (cbs) {
    cbs.forEach(fn => { try { fn({ from: prev, to: next, payload }) } catch (e) { console.error(e) } })
  }

  return true
}

/**
 * Register a callback when a specific state is entered.
 * @param {string} state  — one of STATES values
 * @param {Function} fn   — callback receiving { from, to, payload }
 */
export function onEnter(state, fn) {
  if (!_enterCallbacks.has(state)) {
    _enterCallbacks.set(state, new Set())
  }
  _enterCallbacks.get(state).add(fn)
}

/**
 * Remove a previously registered callback.
 */
export function offEnter(state, fn) {
  _enterCallbacks.get(state)?.delete(fn)
}

/**
 * Check if current state is at least the given state.
 * Ordering: IDLE < EXPLODE < SETTLE < FLOATING
 */
const STATE_ORDER = [STATES.IDLE, STATES.EXPLODE, STATES.SETTLE, STATES.FLOATING]

export function isAtLeast(state) {
  return STATE_ORDER.indexOf(_current) >= STATE_ORDER.indexOf(state)
}

/**
 * Reset the state machine to IDLE (bypasses guard — used for hard reset).
 */
export function reset() {
  const prev = _current
  _current = STATES.IDLE
  const cbs = _enterCallbacks.get(STATES.IDLE)
  if (cbs) {
    cbs.forEach(fn => { try { fn({ from: prev, to: STATES.IDLE, payload: null }) } catch (e) { console.error(e) } })
  }
}
