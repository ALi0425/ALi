/**
 * ═══════════════════════════════════════════
 *  Video Preload Module
 *
 *  Preloads project videos in the background so they're
 *  cached before the user opens a terminal card.
 *  Uses <link rel="preload"> to warm the browser cache
 *  without blocking the main thread.
 * ═══════════════════════════════════════════
 */

// WebM for desktop (VP9 efficient), MP4 for mobile (H.264 HW decode)
// Ordered by size descending — largest loads first to maximize cache time
const VIDEOS_WEBM = [
  'rv.webm',   // RARE               ~4.0 MB  (82s)
  'pb2.webm',  // 巡查问题在线管理   ~2.2 MB
  'tm.webm',   // 科技管理应用       ~2.0 MB
  'o.webm',    // OmniSight          ~1.3 MB
  'pm.webm',   // 项目管理应用       ~852 KB
]

const VIDEOS_MP4 = [
  'rv.mp4',    // RARE               ~3.9 MB
  'pb2.mp4',   // 巡查问题在线管理   ~1.6 MB
  'tm.mp4',    // 科技管理应用       ~1.4 MB
  'o.mp4',     // OmniSight          ~700 KB
  'pm.mp4',    // 项目管理应用       ~731 KB
]

let _preloaded = false

/**
 * Detect if this device is mobile (prefer MP4/H.264 for better HW decode).
 */
function _isMobile() {
  return window.innerWidth < 768
    || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Start preloading all project videos.
 * Safe to call multiple times — only runs once.
 * Skips preload on slow connections / save-data mode.
 */
export function preloadVideos() {
  if (_preloaded) return
  _preloaded = true

  // Respect user's bandwidth preferences
  if ('connection' in navigator) {
    const conn = navigator.connection
    if (conn.saveData) return
    if (conn.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) return
  }

  const base = import.meta.env.BASE_URL
  const videos = _isMobile() ? VIDEOS_MP4 : VIDEOS_WEBM
  let delay = 200

  // Add <link rel="preload"> elements staggered to avoid saturating connection.
  // The browser downloads these in the background and caches them,
  // so when the <video> element requests the same URL it's instant.
  videos.forEach(file => {
    const url = base + file
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'fetch'
    link.href = url
    link.crossOrigin = 'anonymous'
    // Stagger via setTimeout to avoid connection limit blocking
    setTimeout(() => document.head.appendChild(link), delay)
    delay += 400
  })
}
