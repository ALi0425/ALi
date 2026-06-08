/**
 * ═══════════════════════════════════════════
 *  3D Particle Sphere + Text Labels + Project Cards
 *  State 01 core — scattered personal info on surface
 * ═══════════════════════════════════════════
 */

import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { dampMouse } from './interaction.js'
import { getState, STATES } from './state.js'

/* ── Constants ── */
const PARTICLE_COUNT = 1200
const SPHERE_RADIUS  = 4.8
const ROTATE_SPEED_Y = 0.0018
const BREATHE_AMPL   = 0.025
const BREATHE_SPEED  = 0.4

/* ── Personal Info — only name + capability tags ── */
const INFO_DATA = [
  { text: '李晶晶', fontSize: 80, weight: '700', color: '#ffffff', glow: '0 0 80px rgba(34,197,94,0.6)', x: 0, y: 0, z: 4.8, isName: true },
]

const TAG_DATA = [
  '国产ERP 信息化项目', '全程项目管理', 'n8n低代码平台',
  'vibe coding全栈交付', '4年企业级B端系统', '华北理工大学',
  '工作流自动化', 'RAG与知识图谱', '业务逻辑抽象',
  '大型项目协同', '结构化文档编制', '工作流编排',
  '27岁', '多模态增量清洗', '复杂业务流程解构',
  '权限协同与资源调配', '大模型落地产品',
]

/* ── Project Data ── */
const PROJECT_DATA = [
  { label: 'OmniSight 策略导航',  key: 'a1',  desc: 'n8n · GraphRAG · JSON Mode' },
  { label: 'RARE 智能逆向',    key: 'a2',  desc: '元数据逆向 · 嵌套画布 · Schema' },
  { label: '科技管理 一/二期',    key: 'b1',  desc: '20+流程 · 12805项成果 · 60%+' },
  { label: '科技管理 应用三期',   key: 'b2',  desc: '万级数据 · 14家二级单位' },
  { label: '大厂正规军 交付物',   key: 'doc', desc: '技术规范 · 可研 · 需规' },
]

/* ── Fibonacci sphere point generator ── */
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

/* ── Create glow sprite texture ── */
function createGlowTexture() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(34,197,94,1)')
  g.addColorStop(0.15, 'rgba(34,197,94,0.7)')
  g.addColorStop(0.5, 'rgba(34,197,94,0.15)')
  g.addColorStop(1, 'rgba(34,197,94,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

/* ── Pure-text label for personal info ── */
function createInfoLabel(data) {
  const span = document.createElement('span')
  span.textContent = data.text
  span.style.cssText = `
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: ${data.fontSize}px;
    font-weight: ${data.weight};
    color: ${data.color};
    text-shadow: ${data.glow};
    pointer-events: none; user-select: none; white-space: nowrap;
    letter-spacing: 0.06em; line-height: 1.2;
  `
  if (data.isName) {
    span.style.backgroundColor = 'transparent'
  }
  return span
}

/* ── Project label — with border on sphere ── */
function createProjectLabel(data) {
  const div = document.createElement('div')
  div.className = 'project-label'
  div.dataset.key = data.key
  div.innerHTML = `
    <span class="endpoint left" data-key="${data.key}"></span>
    <div class="pl-body">
      <span class="pl-title">${data.label}</span>
      <span class="pl-desc">${data.desc}</span>
    </div>
    <span class="endpoint right" data-key="${data.key}"></span>
  `
  return div
}

/* ═══════════════════════════════════════
   MAIN SPHERE FACTORY
   ═══════════════════════════════════════ */

export function createSphere(scene) {
  const group = new THREE.Group()

  /* ── Particles ── */
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(
    fibonacciPoints(PARTICLE_COUNT, SPHERE_RADIUS), 3
  ))

  const mat = new THREE.PointsMaterial({
    size:        0.18,
    map:         createGlowTexture(),
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
    transparent: true,
    color:       new THREE.Color(0.133, 0.773, 0.369),
    opacity:     0.75,
    sizeAttenuation: true,
  })

  const particles = new THREE.Points(geo, mat)
  group.add(particles)

  /* ── Store original positions ── */
  const origPos = new Float32Array(geo.attributes.position.array)
  const particlePos = geo.attributes.position.array

  /* ── PERSONAL INFO — scattered on sphere front ── */
  const infoRefs = []
  let nameRef = null

  INFO_DATA.forEach((data) => {
    const el = createInfoLabel(data)
    const obj = new CSS2DObject(el)
    obj.position.set(data.x, data.y, data.z)
    group.add(obj)
    infoRefs.push({ obj, el, data })
    if (data.isName) nameRef = { obj, el, data }
  })

  /* ── CAPABILITY TAGS — scattered on sphere surface ── */
  const tagPositions = fibonacciPoints(TAG_DATA.length, SPHERE_RADIUS * 1.04)
  const tagRefs = []

  TAG_DATA.forEach((text, i) => {
    const span = document.createElement('span')
    span.textContent = text
    span.className = 'sphere-tag'
    const obj = new CSS2DObject(span)
    obj.position.set(tagPositions[i * 3], tagPositions[i * 3 + 1], tagPositions[i * 3 + 2])
    group.add(obj)
    tagRefs.push({ obj, el: span, text })
  })

  /* ── Fixed name for State 02 (top‑right, hidden initially) ── */
  const nameFixedEl = document.createElement('span')
  nameFixedEl.textContent = '李晶晶'
  nameFixedEl.style.cssText = `
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 16px; font-weight: 500;
    color: rgba(255,255,255,0.6);
    position: fixed; bottom: 80px; right: 32px;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.8s ease;
    pointer-events: none;
    letter-spacing: 0.06em;
  `
  document.body.appendChild(nameFixedEl)

  /* ── PROJECT LABELS ── */
  const projPositions = fibonacciPoints(PROJECT_DATA.length, SPHERE_RADIUS * 1.02)
  const nodeRefs = []

  PROJECT_DATA.forEach((data, i) => {
    const el = createProjectLabel(data)
    const obj = new CSS2DObject(el)
    obj.position.set(projPositions[i * 3], projPositions[i * 3 + 1], projPositions[i * 3 + 2])
    group.add(obj)
    nodeRefs.push({ obj, el, data, idx: i })
  })

  scene.add(group)

  return {
    group, particles, particleMat: mat, particleGeo: geo,
    origPos, particlePos,
    nodeRefs, infoRefs, nameRef, nameFixedEl, tagRefs,
    velocities: null, targets: null,
    exploding: false, explosionProgress: 0,
  }
}

/* ── Per-frame update (State 01 only) ── */
export function updateSphere(sphere, mouse) {
  if (getState() !== STATES.IDLE) return

  dampMouse(mouse, 0.055)

  sphere._autoRotY = (sphere._autoRotY || 0) + ROTATE_SPEED_Y
  sphere._wobbleX =
    (sphere._wobbleX || 0) + Math.sin(Date.now() * 0.0003) * 0.00015

  sphere.group.rotation.y = sphere._autoRotY + mouse.currentX * 0.08
  sphere.group.rotation.x = sphere._wobbleX + mouse.currentY * 0.08

  const breathe =
    1 + Math.sin(Date.now() * BREATHE_SPEED * 0.001) * BREATHE_AMPL
  sphere.group.scale.setScalar(breathe)

  sphere.particleMat.opacity =
    0.6 + Math.sin(Date.now() * 0.0015) * 0.15
}
