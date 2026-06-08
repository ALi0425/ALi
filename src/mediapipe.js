/**
 * ═══════════════════════════════════════════
 *  MediaPipe Hands — Gesture Detection
 *
 *  Loads @mediapipe/tasks-vision via <script> tag,
 *  initializes HandLandmarker, detects fist→open palm.
 *
 *  Requires HTTPS (or localhost) for camera access.
 *  Fallback: double‑click (in explosion.js).
 * ═══════════════════════════════════════════
 */

/* ── CDN URLs ── */
const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/vision_bundle.js'
const WASM_DIR   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/'
const MODEL_URL  = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'

const OPEN_PALM_THRESHOLD = 0.55
const DETECTION_INTERVAL  = 150

let _handLandmarker   = null
let _stream           = null
let _rafId            = null
let _lastDetectTime   = 0
let _gestureState     = 'CLOSED'
let _gestureTriggered = false
let _isRunning        = false

/* ── Camera indicator helper ── */
function setIndicator(state, msg) {
  const el = document.getElementById('camera-indicator')
  if (!el) return
  const dot = el.querySelector('span')
  let label = el.querySelector('.indicator-text')
  if (!label) { label = document.createElement('span'); label.classList.add('indicator-text'); el.appendChild(label) }
  const styles = {
    offline: { color: '#525252', bg: '#525252', text: msg || 'CAMERA: OFFLINE' },
    standby: { color: '#eab308', bg: '#eab308', text: msg || 'CAMERA: STANDBY' },
    denied:  { color: '#ef4444', bg: '#ef4444', text: msg || 'CAMERA: BLOCKED' },
    loading: { color: '#eab308', bg: '#eab308', text: msg || 'CAMERA: LOADING…' },
    live:    { color: '#22c55e', bg: '#22c55e', text: msg || 'CAMERA: LIVE' },
  }
  const s = styles[state] || styles.offline
  el.style.color = s.color
  if (dot) { dot.style.background = s.bg; dot.style.boxShadow = `0 0 6px ${s.bg}` }
  label.textContent = s.text
}

/* ═══════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════ */

export async function initMediaPipe() {
  // HTTPS check
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  if (!isLocalhost && location.protocol !== 'https:') {
    console.log('%c📷  HTTPS required for camera access. Double‑click fallback active.', 'color: #eab308; font-family: monospace;')
    setIndicator('denied', 'CAMERA: NEED HTTPS')
    return
  }

  // Probe camera
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (!devices.some(d => d.kind === 'videoinput')) {
      console.log('%c📷  No camera found.', 'color: #525252; font-family: monospace;')
      setIndicator('offline', 'CAMERA: NOT FOUND')
      return
    }
  } catch {
    console.log('%c📷  Camera probe failed.', 'color: #525252; font-family: monospace;')
    setIndicator('offline', 'CAMERA: UNavailable')
    return
  }

  setIndicator('standby', 'CAMERA: 点击激活')
  console.log('%c📷  Camera detected. Click hint text to activate.', 'color: #eab308; font-family: monospace;')

  // Make guide hint clickable
  const hint = document.getElementById('guide-hint')
  if (hint) {
    hint.style.cursor = 'pointer'
    hint.style.pointerEvents = 'auto'
    hint.title = '点击激活摄像头'
    const handler = () => { hint.removeEventListener('click', handler); startCamera() }
    hint.addEventListener('click', handler)
  }

  const ind = document.getElementById('camera-indicator')
  if (ind) {
    ind.style.cursor = 'pointer'
    ind.style.pointerEvents = 'auto'
    const handler = () => { ind.removeEventListener('click', handler); startCamera() }
    ind.addEventListener('click', handler)
  }
}

/* ═══════════════════════════════════════
   START CAMERA + LOAD MODEL
   ═══════════════════════════════════════ */

async function startCamera() {
  if (_isRunning) return
  _isRunning = true

  // 1. Start camera stream
  setIndicator('loading', 'CAMERA: 请求权限…')
  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    })
  } catch (err) {
    _isRunning = false
    setIndicator('denied', err.name === 'NotAllowedError' ? 'CAMERA: 已拒绝' : 'CAMERA: 错误')
    console.warn('%c📷  Camera denied. Use double‑click.', 'color: #eab308; font-family: monospace;')
    return
  }

  // 2. Create video element
  const video = document.createElement('video')
  video.setAttribute('playsinline', '')
  video.setAttribute('autoplay', '')
  video.muted = true
  video.srcObject = _stream
  video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px'
  video.id = 'mediapipe-video'
  document.body.appendChild(video)

  try { await video.play() } catch (e) { console.warn('video.play failed:', e); stopCamera(); return }

  // 3. Load MediaPipe library via dynamic import (bypass Vite)
  setIndicator('loading', 'CAMERA: 加载库…')
  console.log('%c⏣  Loading @mediapipe/tasks-vision…', 'color: #22c55e; font-family: monospace;')

  let VisionModule
  try {
    // Use Function constructor to prevent Vite from analyzing the import
    const dynamicImport = Function('url', 'return import(url)')
    VisionModule = await dynamicImport(VISION_URL)
  } catch (err) {
    console.warn('%c⚠  Library load failed:', 'color: #eab308; font-family: monospace;', err.message)
    setIndicator('denied', 'CAMERA: 加载失败')
    stopCamera()
    return
  }

  // 4. Initialize HandLandmarker
  setIndicator('loading', 'CAMERA: 加载模型…')
  console.log('%c⏣  Loading HandLandmarker model…', 'color: #22c55e; font-family: monospace;')

  try {
    const { FilesetResolver, HandLandmarker } = VisionModule
    const vision = await FilesetResolver.forVisionTasks(WASM_DIR)
    _handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
  } catch (err) {
    console.warn('%c⚠  Model load failed:', 'color: #eab308; font-family: monospace;', err.message)
    setIndicator('denied', 'CAMERA: 模型失败')
    stopCamera()
    return
  }

  // 5. Start detection loop
  setIndicator('live', 'CAMERA: LIVE')
  console.log('%c✋  Gesture detection active — open your palm!', 'color: #22c55e; font-family: monospace;')

  if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none' }
  startDetectionLoop(video)
}

/* ═══════════════════════════════════════
   DETECTION LOOP
   ═══════════════════════════════════════ */

function startDetectionLoop(video) {
  if (_rafId) return

  function detect() {
    _rafId = requestAnimationFrame(detect)
    if (!_handLandmarker || _gestureTriggered) return

    const now = performance.now()
    if (now - _lastDetectTime < DETECTION_INTERVAL) return
    _lastDetectTime = now

    try {
      const result = _handLandmarker.detectForVideo(video, now)
      if (result.landmarks && result.landmarks.length > 0) {
        processLandmarks(result.landmarks[0])
      } else {
        _gestureState = 'CLOSED'
      }
    } catch (e) {
      // skip bad frames
    }
  }
  detect()
}

/* ═══════════════════════════════════════
   GESTURE DETECTION
   ═══════════════════════════════════════ */

function processLandmarks(landmarks) {
  if (_gestureTriggered) return

  const thumb = landmarks[4], pinky = landmarks[20]
  const wrist = landmarks[0], midMcp = landmarks[9]
  if (!thumb || !pinky || !wrist || !midMcp) return

  const span = Math.sqrt(
    (thumb.x - pinky.x) ** 2 + (thumb.y - pinky.y) ** 2 + (thumb.z - pinky.z) ** 2
  )
  const handSize = Math.sqrt(
    (wrist.x - midMcp.x) ** 2 + (wrist.y - midMcp.y) ** 2 + (wrist.z - midMcp.z) ** 2
  )
  if (handSize < 0.001) return

  const normalized = span / handSize
  const current = normalized > OPEN_PALM_THRESHOLD ? 'OPEN' : 'CLOSED'

  if (_gestureState === 'CLOSED' && current === 'OPEN') {
    _gestureTriggered = true
    console.log('%c✋  PALM OPEN — triggering explosion!', 'color: #22c55e; font-family: monospace;')
    stopCamera()
    if (window.__triggerExplosion) window.__triggerExplosion()
  }
  _gestureState = current
}

/* ═══════════════════════════════════════
   STOP
   ═══════════════════════════════════════ */

function stopCamera() {
  _isRunning = false; _gestureTriggered = false; _gestureState = 'CLOSED'
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null }
  if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null }
  const v = document.getElementById('mediapipe-video')
  if (v) { v.srcObject = null; v.remove() }
  setIndicator('offline', 'CAMERA: RELEASED')
}
