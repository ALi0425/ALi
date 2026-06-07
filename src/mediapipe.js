/**
 * ═══════════════════════════════════════════
 *  MediaPipe Hands — Gesture Detection
 *
 *  Dynamic CDN loading of @mediapipe/tasks-vision,
 *  HandLandmarker model, camera lifecycle, and
 *  fist‑to‑open palm gesture recognition.
 *
 *  HTTPS required for camera (localHost exempt).
 *  Fallback: double‑click (in explosion.js).
 * ═══════════════════════════════════════════
 */

/* ── CDN URLs (primary + fallback) ── */
const CDN_PRIMARY = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/vision_bundle.js'
const CDN_FALLBACK = 'https://unpkg.com/@mediapipe/tasks-vision@0.10.18/wasm/vision_bundle.js'
const WASM_DIR = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/'
const MODEL_CDN = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'

/* ── Gesture thresholds ── */
const OPEN_PALM_THRESHOLD = 0.55
const DETECTION_INTERVAL  = 150   // ms (~6.6 fps)

/* ── Module state ── */
let _handLandmarker    = null
let _stream            = null
let _rafId             = null
let _lastDetectTime    = 0
let _gestureState      = 'CLOSED'
let _gestureTriggered  = false
let _isRunning         = false
let _modelLoadAttempted = false

/* ── Camera indicator helper ── */
function setIndicator(state, msg) {
  const el = document.getElementById('camera-indicator')
  if (!el) return
  const dot = el.querySelector('span')
  let label = el.querySelector('.indicator-text')
  if (!label) {
    label = document.createElement('span')
    label.classList.add('indicator-text')
    el.appendChild(label)
  }

  const styles = {
    offline: { color: '#525252', bg: '#525252', text: msg || 'CAMERA: OFFLINE' },
    standby: { color: '#eab308', bg: '#eab308', text: msg || 'CAMERA: STANDBY' },
    denied:  { color: '#ef4444', bg: '#ef4444', text: msg || 'CAMERA: BLOCKED' },
    loading: { color: '#eab308', bg: '#eab308', text: msg || 'CAMERA: LOADING…' },
    live:    { color: '#22c55e', bg: '#22c55e', text: msg || 'CAMERA: LIVE' },
  }
  const s = styles[state] || styles.offline
  el.style.color = s.color
  if (dot) {
    dot.style.background = s.bg
    dot.style.boxShadow = `0 0 6px ${s.bg}`
  }
  label.textContent = s.text
}

/* ═══════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════ */

export async function initMediaPipe() {
  // ── Security check: camera needs HTTPS or localhost ──
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const isFile = location.protocol === 'file:'

  if (!isLocalhost && !isFile && location.protocol !== 'https:') {
    console.warn(
      '%c📷  CAMERA: HTTPS REQUIRED — camera access only works on HTTPS or localhost. ' +
      'Gesture recognition unavailable; double‑click fallback active.',
      'color: #eab308; font-family: monospace;'
    )
    setIndicator('denied', 'CAMERA: NEED HTTPS')
    makeGuideHintClickable(true)  // show clickable but will fail gracefully
    return
  }

  // ── Probe camera ──
  const hasCam = await probeCamera()

  if (!hasCam) {
    console.log('%c📷  CAMERA: NOT DETECTED', 'color: #525252; font-family: monospace;')
    setIndicator('offline', 'CAMERA: UNavailable')
    return
  }

  setIndicator('standby', 'CAMERA: 点击激活')
  console.log('%c📷  CAMERA: DETECTED — click hint to activate', 'color: #eab308; font-family: monospace;')

  makeGuideHintClickable(false)
}

/* ═══════════════════════════════════════
   CAMERA PROBE
   ═══════════════════════════════════════ */

async function probeCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some(d => d.kind === 'videoinput')
  } catch {
    return false
  }
}

/* ═══════════════════════════════════════
   CLICK‑TO‑ACTIVATE
   ═══════════════════════════════════════ */

function makeGuideHintClickable(httpsOnly) {
  const hint = document.getElementById('guide-hint')
  if (!hint) return

  hint.style.cursor = 'pointer'
  hint.style.pointerEvents = 'auto'
  hint.title = httpsOnly ? '需要 HTTPS 才能使用摄像头' : '点击激活摄像头'

  const handler = async () => {
    hint.removeEventListener('click', handler)
    hint.style.cursor = 'default'
    // Even on HTTPS-only mode, try (will fail gracefully in startCamera)
    await startCamera()
  }
  hint.addEventListener('click', handler)

  // Also camera indicator
  const indicator = document.getElementById('camera-indicator')
  if (indicator) {
    indicator.style.cursor = 'pointer'
    indicator.style.pointerEvents = 'auto'
    const indHandler = async () => {
      indicator.removeEventListener('click', indHandler)
      indicator.style.cursor = 'default'
      await startCamera()
    }
    indicator.addEventListener('click', indHandler)
  }
}

/* ═══════════════════════════════════════
   START CAMERA
   ═══════════════════════════════════════ */

async function startCamera() {
  if (_isRunning) return
  _isRunning = true
  setIndicator('loading', 'CAMERA: 请求权限…')

  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    })

    const video = window.__mediapipeVideo || document.createElement('video')
    video.setAttribute('playsinline', '')
    video.setAttribute('autoplay', '')
    video.muted = true
    video.srcObject = _stream
    video.style.position = 'fixed'
    video.style.opacity = '0'
    video.style.pointerEvents = 'none'
    video.style.width = '1px'
    video.style.height = '1px'
    video.id = 'mediapipe-video'
    if (!video.parentElement) document.body.appendChild(video)
    window.__mediapipeVideo = video

    await video.play()

    setIndicator('loading', 'CAMERA: 加载模型…')
    console.log('%c⏣  Loading HandLandmarker model from CDN…', 'color: #22c55e; font-family: monospace;')

    // Load model with timeout
    await loadHandLandmarkerWithTimeout(15000)

    setIndicator('live', 'CAMERA: LIVE')
    console.log('%c📷  CAMERA: LIVE — detection active', 'color: #22c55e; font-family: monospace;')

    // Hide guide hint
    const hint = document.getElementById('guide-hint')
    if (hint) {
      hint.style.opacity = '0'
      hint.style.pointerEvents = 'none'
    }

    startDetectionLoop(video)

  } catch (err) {
    _isRunning = false

    if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
      setIndicator('denied', 'CAMERA: 已拒绝')
      console.warn(
        '%c📷  CAMERA: PERMISSION DENIED — fallback to double-click',
        'color: #eab308; font-family: monospace;'
      )
    } else if (err.name === 'NotFoundError') {
      setIndicator('denied', 'CAMERA: 未找到')
      console.warn('%c📷  CAMERA: NOT FOUND', 'color: #eab308; font-family: monospace;')
    } else if (err.message?.includes('MediaPipe') || err.message?.includes('model')) {
      setIndicator('denied', 'CAMERA: 模型失败')
      console.warn('%c⚠  HandLandmarker load failed:', 'color: #eab308; font-family: monospace;', err.message)
    } else {
      setIndicator('denied', 'CAMERA: 错误')
      console.warn('%c📷  CAMERA ERROR:', 'color: #ef4444; font-family: monospace;', err.message)
    }
  }
}

/* ═══════════════════════════════════════
   LOAD HAND LANDMARKER (with timeout)
   ═══════════════════════════════════════ */

async function loadHandLandmarkerWithTimeout(ms) {
  if (_handLandmarker) return

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('model load timeout')), ms)
  )

  await Promise.race([
    loadHandLandmarker(),
    timeout,
  ])
}

async function loadHandLandmarker() {
  if (_modelLoadAttempted) throw new Error('model load previously failed')
  _modelLoadAttempted = true

  let VisionModule
  // Try primary CDN, fallback to secondary
  try {
    VisionModule = await import(/* @vite-ignore */ CDN_PRIMARY)
  } catch {
    console.log('%c⏣  Primary CDN failed, trying fallback…', 'color: #eab308; font-family: monospace;')
    VisionModule = await import(/* @vite-ignore */ CDN_FALLBACK)
  }

  const { FilesetResolver, HandLandmarker } = VisionModule

  const vision = await FilesetResolver.forVisionTasks(WASM_DIR)

  _handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_CDN,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  console.log(
    '%c✓  HandLandmarker loaded successfully',
    'color: #22c55e; font-family: monospace;'
  )
}

/* ═══════════════════════════════════════
   DETECTION LOOP
   ═══════════════════════════════════════ */

function startDetectionLoop(video) {
  if (_rafId) return
  let frameCount = 0

  function detect() {
    _rafId = requestAnimationFrame(detect)
    if (!_handLandmarker || _gestureTriggered) return

    const now = performance.now()
    if (now - _lastDetectTime < DETECTION_INTERVAL) return
    _lastDetectTime = now

    frameCount++
    try {
      const result = _handLandmarker.detectForVideo(video, now)
      if (result.landmarks && result.landmarks.length > 0) {
        processLandmarks(result.landmarks[0])
      } else {
        _gestureState = 'CLOSED'
      }
    } catch {
      // skip failed frames
    }
  }

  detect()
}

/* ═══════════════════════════════════════
   GESTURE DETECTION
   ═══════════════════════════════════════ */

function processLandmarks(landmarks) {
  if (_gestureTriggered) return

  const thumb = landmarks[4]
  const pinky = landmarks[20]
  const wrist = landmarks[0]
  const midMcp = landmarks[9]

  if (!thumb || !pinky || !wrist || !midMcp) return

  const span = Math.sqrt(
    (thumb.x - pinky.x) ** 2 +
    (thumb.y - pinky.y) ** 2 +
    (thumb.z - pinky.z) ** 2
  )

  const handSize = Math.sqrt(
    (wrist.x - midMcp.x) ** 2 +
    (wrist.y - midMcp.y) ** 2 +
    (wrist.z - midMcp.z) ** 2
  )

  if (handSize < 0.001) return

  const normalizedSpan = span / handSize
  const currentGesture = normalizedSpan > OPEN_PALM_THRESHOLD ? 'OPEN' : 'CLOSED'

  if (_gestureState === 'CLOSED' && currentGesture === 'OPEN') {
    _gestureTriggered = true
    console.log(
      '%c✋  GESTURE: PALM_OPEN — DECOUPLING KERNEL_MODULES',
      'color: #22c55e; font-family: monospace;'
    )
    stopCamera()
    if (window.__triggerExplosion) window.__triggerExplosion()
  }

  _gestureState = currentGesture
}

/* ═══════════════════════════════════════
   STOP CAMERA
   ═══════════════════════════════════════ */

function stopCamera() {
  _isRunning = false
  _gestureTriggered = false
  _gestureState = 'CLOSED'

  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null }
  if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null }

  const video = window.__mediapipeVideo
  if (video) { video.srcObject = null }
  setIndicator('offline', 'CAMERA: RELEASED')
}
