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
const ROTATE_SPEED_Y = 0.0018
const BREATHE_AMPL   = 0.025
const BREATHE_SPEED  = 0.4

/* ── Personal Info — only name + capability tags ── */
const INFO_DATA = (mobile) => [
  { text: '李晶晶', fontSize: mobile ? 22 : 80, weight: '700', color: '#ffffff', glow: '0 0 80px rgba(34,197,94,0.6)', x: 0, y: 0, z: mobile ? 1.2 : 4.8, isName: true },
]

const TAG_DATA = [
  { text: '国产ERP 信息化项目',   fontSize: 30, color: '#ffffff' },
  { text: '全程项目管理',        fontSize: 24, color: '#22c55e' },
  { text: 'n8n低代码平台',       fontSize: 34, color: '#22c55e', glow: '0 0 20px rgba(34,197,94,0.4)' },
  { text: 'vibe coding全栈交付', fontSize: 26, color: '#ffffff' },
  { text: '4年企业级B端系统',    fontSize: 28, color: '#ffffff' },
  { text: '华北理工大学',         fontSize: 20, color: '#ffffff' },
  { text: '工作流自动化',        fontSize: 28, color: '#22c55e' },
  { text: 'RAG与知识图谱',       fontSize: 32, color: '#22c55e', glow: '0 0 20px rgba(34,197,94,0.4)' },
  { text: '业务逻辑抽象',        fontSize: 22, color: '#ffffff' },
  { text: '大型项目协同',        fontSize: 26, color: '#ffffff' },
  { text: '结构化文档编制',       fontSize: 22, color: '#ffffff' },
  { text: '工作流编排',          fontSize: 24, color: '#22c55e' },
  { text: '28岁',               fontSize: 22, color: '#ffffff' },
  { text: '多模态增量清洗',       fontSize: 24, color: '#ffffff' },
  { text: '复杂业务流程解构',     fontSize: 26, color: '#ffffff' },
  { text: '权限协同与资源调配',   fontSize: 28, color: '#ffffff' },
  { text: '大模型落地产品',       fontSize: 34, color: '#22c55e', glow: '0 0 20px rgba(34,197,94,0.4)' },
]

/* ── Project Data ── */
const PROJECT_DATA = [
  { label: 'OmniSight 知识图谱与蓝海分析', key: 'a1', desc: 'n8n · GraphRAG · LLM' },
  { label: 'RARE 逆向资产与智能评估',    key: 'a2', desc: '元数据逆向 · 嵌套画布 · LLM' },
  { label: '科技管理应用',              key: 'b1', desc: '3期项目 · 7项一级功能' },
  { label: '巡查问题在线管理',           key: 'b2', desc: '4项一级功能 · 业务逻辑抽象' },
  { label: '项目管理应用',              key: 'b3', desc: '复杂业务解构 · 53家单位' },
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

export function createSphere(scene, mobile) {
  const group = new THREE.Group()

  const PC = mobile ? 200 : 1200
  const SR = mobile ? 1.2 : 4.8

  /* ── Particles ── */
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(
    fibonacciPoints(PC, SR), 3
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

  INFO_DATA(mobile).forEach((data) => {
    const el = createInfoLabel(data)
    const obj = new CSS2DObject(el)
    obj.position.set(data.x, data.y, data.z)
    group.add(obj)
    infoRefs.push({ obj, el, data })
    if (data.isName) nameRef = { obj, el, data }
  })

  /* ── CAPABILITY TAGS — scattered on sphere surface ── */
  const tagPositions = fibonacciPoints(TAG_DATA.length, SR * 1.04)
  const tagRefs = []

  const tagScale = mobile ? 0.4 : 1
  TAG_DATA.forEach((data, i) => {
    const el = document.createElement('span')
    el.textContent = data.text
    el.style.cssText = `
      font-family: 'Space Mono', 'Courier New', monospace;
      font-size: ${Math.round(data.fontSize * tagScale)}px;
      font-weight: 300;
      color: ${data.color};
      text-shadow: ${data.glow || '0 0 8px rgba(34,197,94,0.15)'};
      pointer-events: none; user-select: none; white-space: nowrap;
      letter-spacing: 0.02em; line-height: 1.2;
    `
    const obj = new CSS2DObject(el)
    obj.position.set(tagPositions[i * 3], tagPositions[i * 3 + 1], tagPositions[i * 3 + 2])
    group.add(obj)
    tagRefs.push({ obj, el, data })
  })

  /* ── Fixed name for State 02 — removed per user request ── */
  const nameFixedEl = null

  /* ── PROJECT LABELS ── */
  const projPositions = fibonacciPoints(PROJECT_DATA.length, SR * 1.02)
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
