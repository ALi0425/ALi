/**
 * ═══════════════════════════════════════════
 *  Three.js Scene Setup
 * ═══════════════════════════════════════════
 */

import * as THREE from 'three'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'

export function createScene(container, mobile) {
  // ── Scene ──
  const scene = new THREE.Scene()

  // ── Camera ──
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0.5, mobile ? 5.0 : 11)
  camera.lookAt(0, 0, 0)

  // ── WebGL Renderer ──
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // ── CSS2D Renderer (for node labels) ──
  const labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  labelRenderer.domElement.style.left = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelRenderer.domElement.classList.add('css2d-renderer')
  container.appendChild(labelRenderer.domElement)

  return { scene, camera, renderer, labelRenderer }
}
