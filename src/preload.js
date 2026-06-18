/**
 * ═══════════════════════════════════════════
 *  Video Preload Module
 *
 *  Preloads project videos in the background so they're
 *  cached before the user opens a terminal card.
 *  Uses hidden <video> elements for reliable browser caching
 *  (handles range requests properly, same cache key as
 *   the actual <video> elements in terminal.js).
 * ═══════════════════════════════════════════
 */

// Ordered by size descending — largest loads first
const VIDEOS_WEBM = [
  'rv.webm',   // RARE               ~4.0 MB
  'pb2.webm',  // 巡查问题在线管理   ~2.2 MB
  'tm.webm',   // 科技管理应用       ~2.0 MB
  'o.webm',    // OmniSight          ~1.3 MB
  'pm.webm',   // 项目管理应用       ~852 KB
]

const VIDEOS_MP4 = [
  'rv.mp4',    // RARE               ~4.4 MB
  'pb2.mp4',   // 巡查问题在线管理   ~2.2 MB
  'tm.mp4',    // 科技管理应用       ~2.1 MB
  'o.mp4',     // OmniSight          ~1.4 MB
  'pm.mp4',    // 项目管理应用       ~1.0 MB
]

let _preloaded = false
let _preloadElements = []

/** Detect mobile — prefer MP4 for hardware decode */
function _isMobile() {
  return window.innerWidth < 768
    || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Start preloading all project videos.
 * Safe to call multiple times — only runs once.
 */
export function preloadVideos() {
  if (_preloaded) return
  _preloaded = true

  // Respect save-data / slow connections
  if ('connection' in navigator) {
    const conn = navigator.connection
    if (conn.saveData) return
    if (conn.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) return
  }

  const base = import.meta.env.BASE_URL
  const videos = _isMobile() ? VIDEOS_MP4 : VIDEOS_WEBM
  let delay = 100

  // Create hidden <video> elements — most reliable way to populate
  // the browser's video cache with correct range-request cache keys.
  videos.forEach(file => {
    const url = base + file
    setTimeout(() => {
      const v = document.createElement('video')
      v.preload = 'auto'
      v.src = url
      v.muted = true
      v.playsInline = true
      // Hidden offscreen — never added to DOM to avoid layout
      v.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none'
      document.body.appendChild(v)
      v.load() // starts loading
      _preloadElements.push(v)
      // After load starts, remove from DOM to free resources.
      // Browser keeps the cached response even after element removal.
      v.addEventListener('canplay', () => {
        setTimeout(() => {
          if (v.parentNode) v.parentNode.removeChild(v)
        }, 1000)
      }, { once: true })
    }, delay)
    delay += 500
  })
}

/**
 * Cleanup preload elements (call on page unload if needed).
 */
export function cleanupPreloads() {
  _preloadElements.forEach(v => {
    if (v.parentNode) v.parentNode.removeChild(v)
  })
  _preloadElements = []
}
