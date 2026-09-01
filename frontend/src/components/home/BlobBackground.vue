<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)

let raf = 0
let ctx = null
let width = 0
let height = 0
let pointerActive = false

// Контур пятна: точки по эллипсу, каждая со своей пружиной.
const POINT_COUNT = 24
const points = []

for (let i = 0; i < POINT_COUNT; i++) {
  points.push({
    angle: (i / POINT_COUNT) * Math.PI * 2,
    ext: 0,
    vel: 0,
    wobSpeed: 0.55 + ((i * 7) % 5) * 0.14,
    wobPhase: i * 1.7,
    wobAmp: 0.035 + ((i * 3) % 4) * 0.012,
  })
}

const ANCHOR_X = 0.5
const ANCHOR_Y = 0.44
const FILL_CORE = 'rgba(130, 168, 12, 0.36)'
const FILL_HALO = 'rgba(130, 168, 12, 0.085)'

let hovering = false
let cursorX = 0
let cursorY = 0
let smoothCurX = 0
let smoothCurY = 0
let attractX = 0
let attractY = 0

// Режимы-морфы: heart | deflate | scatter | split | calm | ring | rise | core | expand
let mode = null
let modeTarget = 0
let modeMix = 0
let anchorEl = null
let anchorOffX = 0
let anchorOffY = 0
let healMix = 0
let inHealZone = false
let mergePulse = 0
// «Светильник»: курсор в правой половине экрана внутри promise-зоны.
let lampMix = 0
// «Триада»: три связанные капли в секции capabilities.
let inTriadZone = false
let triadMix = 0
let triadPulse = 0
let triadWasVisible = false
let triadSectionEl = null
let triadObserver = null
let healAnchorEl = null
let healSectionEl = null
let healObserver = null
let healWasVisible = false
// «Прогресс-река»: пятно превращается в жидкую шкалу процесса.
let inProcessZone = false
let processMix = 0
let processFill = 2
let processTarget = 2
let processWasVisible = false
let processSectionEl = null
let processObserver = null
// Финальный CTA: пятно ждёт в правой половине в форме мягкого сердца.
let inCtaZone = false
let ctaMix = 0
let ctaAnchorEl = null
let ctaSectionEl = null
let ctaObserver = null

// Полярная таблица формы сердца
const HEART_SAMPLES = 720
const heartRadii = new Float32Array(HEART_SAMPLES)

{
  const acc = new Float32Array(HEART_SAMPLES)
  const cnt = new Float32Array(HEART_SAMPLES)
  const steps = 4096
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const cy = -y
    const ang = (Math.atan2(cy, x) + Math.PI * 2) % (Math.PI * 2)
    const idx = Math.floor((ang / (Math.PI * 2)) * HEART_SAMPLES) % HEART_SAMPLES
    acc[idx] += Math.hypot(x, cy)
    cnt[idx] += 1
  }
  let last = 17
  for (let i = 0; i < HEART_SAMPLES * 2; i++) {
    const idx = i % HEART_SAMPLES
    if (cnt[idx] > 0) {
      heartRadii[idx] = acc[idx] / cnt[idx]
      last = heartRadii[idx]
    } else {
      heartRadii[idx] = last
    }
  }
}

function heartRadius(angle) {
  const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const f = (norm / (Math.PI * 2)) * HEART_SAMPLES
  const i0 = Math.floor(f) % HEART_SAMPLES
  const i1 = (i0 + 1) % HEART_SAMPLES
  const frac = f - Math.floor(f)
  return heartRadii[i0] * (1 - frac) + heartRadii[i1] * frac
}

// Целевая точка контура для активного морфа (смещение от центра).
function shapePoint(p, rx, ry) {
  const cos = Math.cos(p.angle)
  const sin = Math.sin(p.angle)

  switch (mode) {
    case 'heart': {
      const hr = heartRadius(p.angle) * rx * 0.052
      return { x: cos * hr, y: sin * hr }
    }
    case 'deflate':
      // Сдувается: плоская широкая лужица.
      return { x: cos * rx * 1.28, y: sin * ry * 0.3 }
    case 'scatter':
      // Ядро сжимается, капли рисуются отдельно.
      return { x: cos * rx * 0.58, y: sin * ry * 0.62 }
    case 'split':
      // Половинка: рисуется дважды с разъездом.
      return { x: cos * rx * 0.6, y: sin * ry * 0.8 }
    case 'calm':
      return { x: cos * rx * 1.06, y: sin * ry * 1.06 }
    case 'ring':
      return { x: cos * rx * 1.14, y: sin * ry * 0.78 }
    case 'rise':
      return { x: cos * rx * 0.78, y: sin * ry * 1.32 }
    case 'core':
      return { x: cos * rx * 0.68, y: sin * ry * 0.68 }
    case 'expand':
      return { x: cos * rx * 1.24, y: sin * ry * 1.24 }
    default:
      return { x: cos * rx, y: sin * ry }
  }
}

function setMode(name, el) {
  if (name !== mode) {
    // Мягкий перезапуск морфа при переключении между целями.
    modeMix *= 0.35
    mode = name
  }
  anchorEl = el
  modeTarget = 1
}

function ensureHealNodes() {
  if (!healAnchorEl) {
    healAnchorEl = document.querySelector('[data-blob-zone-anchor="promise"]')
  }
  if (healObserver && !healSectionEl) {
    const section = document.querySelector('[data-blob-zone="heal"]')
    if (section) {
      healSectionEl = section
      healObserver.observe(section)
    }
  }
  if (triadObserver && !triadSectionEl) {
    const section = document.querySelector('[data-blob-zone="triad"]')
    if (section) {
      triadSectionEl = section
      triadObserver.observe(section)
    }
  }
  if (processObserver && !processSectionEl) {
    const section = document.querySelector('[data-blob-zone="process"]')
    if (section) {
      processSectionEl = section
      processObserver.observe(section)
    }
  }
  if (ctaObserver && !ctaSectionEl) {
    const section = document.querySelector('[data-blob-zone="cta"]')
    if (section) {
      ctaSectionEl = section
      ctaObserver.observe(section)
    }
  }
  if (!ctaAnchorEl) {
    ctaAnchorEl = document.querySelector('[data-blob-zone-anchor="cta"]')
  }
}

function triadAnchorPoints() {
  return ['triad-0', 'triad-1', 'triad-2']
    .map((id) => document.querySelector(`[data-blob-zone-anchor="${id}"]`))
    .filter(Boolean)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width * 0.32, y: r.top + r.height * 0.5 }
    })
}

function drawTriadNetwork(cx, cy, rx, ry, t, mix) {
  const anchors = triadAnchorPoints()
  if (anchors.length < 3) return false

  const pulse = triadPulse
  const pts = anchors.map((p) => ({
    x: cx * pulse + p.x * (1 - pulse * 0.85),
    y: cy * pulse + p.y * (1 - pulse * 0.85),
  }))

  if (pulse > 0.01) triadPulse *= 0.93

  const sizes = [0.24, 0.19, 0.21]
  const pairs = [[0, 1], [1, 2], [0, 2]]

  ctx.globalAlpha = mix * 0.55
  for (const [a, b] of pairs) {
    const sway = Math.sin(t * 0.9 + a) * 3
    ctx.beginPath()
    ctx.moveTo(pts[a].x, pts[a].y + sway)
    ctx.quadraticCurveTo(
      (pts[a].x + pts[b].x) / 2 + Math.sin(t * 0.7) * 8,
      (pts[a].y + pts[b].y) / 2,
      pts[b].x,
      pts[b].y - sway,
    )
    ctx.lineWidth = Math.max(1.5, rx * 0.04)
    ctx.strokeStyle = FILL_CORE
    ctx.stroke()
  }

  pts.forEach((p, i) => {
    const breathe = 1 + Math.sin(t * 1.1 + i * 1.4) * 0.06
    const w = rx * sizes[i] * breathe * mix
    const h = ry * sizes[i] * 1.1 * breathe * mix
    ctx.globalAlpha = mix * 0.14
    paintDroplet(p.x, p.y, w * 1.6, h * 1.6, 0)
    ctx.globalAlpha = mix * 0.42
    paintDroplet(p.x, p.y, w, h, (i - 1) * 0.2)
  })

  ctx.globalAlpha = 1
  return true
}

function clearMode() {
  modeTarget = 0
}

// Взаимодействия: любой элемент с data-blob="<shape>" (+ data-blob-anchor).
function blobElFrom(node) {
  if (!node || !(node instanceof Element)) return null
  return node.closest('[data-blob]')
}

function drawProcessBar(t, mix, cx, cy) {
  const track = document.querySelector('[data-blob-zone-anchor="process-track"]')
  if (!track) return false

  const r = track.getBoundingClientRect()
  const pad = 14
  const left = r.left + pad
  const right = r.right - pad
  const trackW = Math.max(1, right - left)
  const cyTrack = r.top + r.height / 2
  const ratio = processFill / 4
  const fillEnd = left + trackW * ratio

  const morph = mix
  const startX = cx * (1 - morph) + left * morph
  const endX = fillEnd

  const steps = Math.max(10, Math.floor((endX - startX) / 10))
  for (let i = 0; i <= steps; i++) {
    const p = steps === 0 ? 1 : i / steps
    const x = startX + (endX - startX) * p
    if (x > right + 4) break
    const wob = Math.sin(t * 2.2 + i * 0.45) * 2.5
    const rxL = r.height * 0.44 + Math.sin(t * 1.4 + i * 0.3) * 2
    const ryL = r.height * 0.38 + Math.cos(t * 1.8 + i * 0.25) * 1.5
    ctx.globalAlpha = mix * 0.14
    paintDroplet(x, cyTrack + wob, rxL * 1.55, ryL * 1.55, 0)
    ctx.globalAlpha = mix * 0.58
    paintDroplet(x, cyTrack + wob, rxL, ryL, 0)
  }

  for (let b = 0; b < 6; b++) {
    const span = Math.max(0, endX - left)
    if (span < 20) break
    const bx = left + span * (0.12 + b * 0.14)
    if (bx > endX - 8) continue
    const by = cyTrack + Math.sin(t * 1.6 + b * 1.2) * (r.height * 0.14)
    ctx.globalAlpha = mix * 0.38
    paintDroplet(bx, by, 3.5, 3.5, 0)
  }

  const markers = document.querySelectorAll('[data-process-marker]')
  const idx = Math.round(processFill)
  const marker = markers[idx]
  if (marker) {
    const mr = marker.getBoundingClientRect()
    const mx = mr.left + mr.width / 2
    const my = mr.bottom + 2
    const strandX = Math.min(endX, right)
    ctx.globalAlpha = mix * 0.7
    ctx.beginPath()
    ctx.moveTo(strandX, cyTrack - r.height * 0.26)
    ctx.quadraticCurveTo(
      strandX + Math.sin(t * 2.1) * 5,
      (cyTrack + my) * 0.52,
      mx,
      my - 6,
    )
    ctx.lineWidth = 2.5
    ctx.strokeStyle = 'rgba(150, 188, 14, 0.75)'
    ctx.stroke()
    ctx.globalAlpha = mix * 0.55
    paintDroplet(mx, my - 10, 7, 8, 0)
  }

  ctx.globalAlpha = 1
  return true
}

function onOver(event) {
  const phaseEl = event.target.closest('[data-process-phase]')
  if (phaseEl) {
    processTarget = Number(phaseEl.dataset.processPhase)
    return
  }
  const el = blobElFrom(event.target)
  if (!el) return
  setMode(el.dataset.blob, el.hasAttribute('data-blob-anchor') ? el : null)
}

function onOut(event) {
  const el = blobElFrom(event.target)
  if (!el) return
  const toEl = blobElFrom(event.relatedTarget)
  if (toEl === el) return
  if (toEl) setMode(toEl.dataset.blob, toEl.hasAttribute('data-blob-anchor') ? toEl : null)
  else clearMode()
}

function onPointerMove(event) {
  cursorX = event.clientX
  cursorY = event.clientY
  if (!hovering) {
    smoothCurX = cursorX
    smoothCurY = cursorY
  }
  hovering = true
}

function onWindowLeave() {
  hovering = false
  clearMode()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function blobRadii() {
  const rx = Math.min(width * 0.27, 400)
  return { rx, ry: rx * 0.56 }
}

function buildCoords(cx, cy, rx, ry, t) {
  const lampEff = lampMix * (1 - modeMix) * (1 - triadMix)
  const ctaEff = ctaMix * (1 - modeMix) * (1 - processMix)
  return points.map((p) => {
    const wob = Math.sin(t * p.wobSpeed + p.wobPhase) * rx * p.wobAmp * (1 - modeMix * 0.6)
    const r = 1 + (p.ext + wob) / rx
    let ox = Math.cos(p.angle) * rx * r
    let oy = Math.sin(p.angle) * ry * r

    if (modeMix > 0.001 && mode) {
      const s = shapePoint(p, rx, ry)
      ox = ox * (1 - modeMix) + s.x * modeMix
      oy = oy * (1 - modeMix) + s.y * modeMix
    }

    if (ctaEff > 0.001) {
      // Мягкое сердце: форма сердца с сохранением живого дыхания контура.
      const hr = heartRadius(p.angle) * rx * 0.05
      ox = ox * (1 - ctaEff) + Math.cos(p.angle) * hr * ctaEff
      oy = oy * (1 - ctaEff) + Math.sin(p.angle) * hr * ctaEff
    }

    if (lampEff > 0.001) {
      // Купол светильника: высокий округлый верх, приплюснутый низ.
      const sin = Math.sin(p.angle)
      const lampX = Math.cos(p.angle) * rx * 1.1
      const lampY = sin * ry * (1.18 - 0.34 * sin)
      ox = ox * (1 - lampEff) + lampX * lampEff
      oy = oy * (1 - lampEff) + lampY * lampEff
    }

    return { x: cx + ox, y: cy + oy }
  })
}

function paintPath(coords, cx, cy, scale, fill) {
  ctx.beginPath()
  const pts = scale === 1
    ? coords
    : coords.map((c) => ({ x: cx + (c.x - cx) * scale, y: cy + (c.y - cy) * scale }))
  const n = pts.length
  let mx = (pts[n - 1].x + pts[0].x) / 2
  let my = (pts[n - 1].y + pts[0].y) / 2
  ctx.moveTo(mx, my)
  for (let i = 0; i < n; i++) {
    const next = pts[(i + 1) % n]
    mx = (pts[i].x + next.x) / 2
    my = (pts[i].y + next.y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function paintDroplet(x, y, rx, ry, tilt) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, tilt, 0, Math.PI * 2)
  ctx.fillStyle = FILL_CORE
  ctx.fill()
}

function drawScene(cx, cy, rx, ry, t) {
  const triadIdle = inTriadZone && !inProcessZone && triadMix > 0.08 && modeMix < 0.08 && !modeTarget
  const coords = buildCoords(cx, cy, rx, ry, t)
  const dim = healMix * (1 - lampMix) * 0.26
  // Сердце в CTA теплее обычного и разгорается при наведении на «Обсудить проект».
  const ctaGlow = ctaMix * (0.14 + (mode === 'heart' ? modeMix * 0.32 : 0))
  const bright = Math.min(
    1.6,
    (1 + lampMix * 0.5 + triadMix * 0.12 + ctaGlow) * (1 - dim) + healMix * 0.06,
  )

  if (mergePulse > 0.015) {
    const mp = mergePulse
    ctx.globalAlpha = mp * 0.55
    paintDroplet(cx - rx * 1.1 * mp, cy + ry * 0.15, rx * 0.22, ry * 0.28, 0.3)
    paintDroplet(cx + rx * 0.95 * mp, cy - ry * 0.35, rx * 0.18, ry * 0.24, -0.4)
    paintDroplet(cx + rx * 0.2 * mp, cy + ry * 0.85, rx * 0.16, ry * 0.2, 0.1)
    ctx.globalAlpha = 1
    mergePulse *= 0.955
  }

  if (mode === 'split' && modeMix > 0.01) {
    const sep = rx * 0.8 * modeMix
    const sway = Math.sin(t * 1.15) * rx * 0.035 * modeMix

    // Тонкая нить между половинами — истончается по мере разрыва.
    ctx.beginPath()
    ctx.moveTo(cx - sep, cy + sway)
    ctx.quadraticCurveTo(cx, cy - sway * 2.4, cx + sep, cy - sway)
    ctx.lineWidth = Math.max(2, rx * 0.1 * (1 - modeMix * 0.82))
    ctx.strokeStyle = FILL_CORE
    ctx.stroke()

    const left = coords.map((c) => ({ x: c.x - sep, y: c.y + sway }))
    const right = coords.map((c) => ({ x: c.x + sep, y: c.y - sway }))
    paintPath(left, cx - sep, cy + sway, 1.5, FILL_HALO)
    paintPath(right, cx + sep, cy - sway, 1.5, FILL_HALO)
    paintPath(left, cx - sep, cy + sway, 1, FILL_CORE)
    paintPath(right, cx + sep, cy - sway, 1, FILL_CORE)
    return
  }

  if (mode === 'deflate' && modeMix > 0.01) {
    ctx.globalAlpha = 1 - modeMix * 0.38
  }

  if (mode === 'ring' && modeMix > 0.01) {
    paintPath(coords, cx, cy, 1.85, FILL_HALO)
    paintPath(coords, cx, cy, 1.45, `rgba(130, 168, 12, ${0.06 * bright})`)
  }

  if (triadIdle) {
    drawTriadNetwork(cx, cy, rx, ry, t, triadMix)
    ctx.globalAlpha = triadMix * 0.08
    paintPath(coords, cx, cy, 1.55, FILL_HALO)
    ctx.globalAlpha = 1
    return
  }

  if (inProcessZone && processMix > 0.08) {
    if (drawProcessBar(t, processMix, cx, cy)) {
      if (processMix < 0.88) {
        ctx.globalAlpha = (1 - processMix) * 0.32
        paintPath(coords, cx, cy, 1.55, FILL_HALO)
        paintPath(coords, cx, cy, 1, FILL_CORE)
      }
      ctx.globalAlpha = 1
      return
    }
  }

  ctx.globalAlpha = Math.min(1, bright)
  paintPath(coords, cx, cy, 1.55, FILL_HALO)
  paintPath(coords, cx, cy, 1, FILL_CORE)
  if (bright > 1) {
    // Дополнительный проход — «включённый» светильник.
    ctx.globalAlpha = Math.min(1, (bright - 1) * 0.9)
    paintPath(coords, cx, cy, 1.2, FILL_HALO)
    paintPath(coords, cx, cy, 0.92, FILL_CORE)
  }
  ctx.globalAlpha = 1

  if (mode === 'scatter' && modeMix > 0.01) {
    const spread = modeMix
    ctx.globalAlpha = spread
    paintDroplet(
      cx + rx * 1.12 * spread + Math.sin(t * 1.35) * 14,
      cy - ry * 0.8 * spread + Math.cos(t * 1.05) * 11,
      rx * 0.3,
      ry * 0.38,
      0.4,
    )
    paintDroplet(
      cx - rx * 1.02 * spread + Math.cos(t * 1.2) * 12,
      cy + ry * 0.92 * spread + Math.sin(t * 0.9) * 10,
      rx * 0.24,
      ry * 0.3,
      -0.5,
    )
    ctx.globalAlpha = 1
  }
}

function tick(now) {
  if (ctx && width > 0) {
    ensureHealNodes()
    const t = now / 1000
    const { rx, ry } = blobRadii()

    modeMix += (modeTarget - modeMix) * 0.055
    if (!modeTarget && modeMix < 0.01) {
      mode = null
      anchorEl = null
    }

    healMix += ((inHealZone && !inTriadZone ? 1 : 0) - healMix) * 0.035
    triadMix += ((inTriadZone && !inProcessZone ? 1 : 0) - triadMix) * 0.04
    processMix += ((inProcessZone && !inCtaZone ? 1 : 0) - processMix) * 0.038
    processFill += (processTarget - processFill) * 0.075
    ctaMix += ((inCtaZone ? 1 : 0) - ctaMix) * 0.04

    const lampOn = inHealZone && !inTriadZone && !inProcessZone && hovering && cursorX > width * 0.52
    lampMix += ((lampOn ? 1 : 0) - lampMix) * 0.045

    // Центр: собственное блуждание + лёгкое смещение к курсору.
    const calm = (1 - modeMix * 0.7)
      * (0.72 + healMix * 0.28)
      * (1 - lampMix * 0.55)
      * (1 - triadMix * 0.35)
      * (1 - processMix * 0.72)
      * (1 - ctaMix * 0.5)
    const driftX = (Math.sin(t * 0.42) * rx * 0.09 + Math.sin(t * 0.93 + 2.1) * rx * 0.04) * calm
    const driftY = (Math.cos(t * 0.35) * ry * 0.12 + Math.cos(t * 0.81 + 0.6) * ry * 0.05) * calm

    let cx = width * ANCHOR_X + driftX
    let cy = height * ANCHOR_Y + driftY

    // Подплывание за элемент-якорь (data-blob-anchor) или за «светильник».
    let anchTX = 0
    let anchTY = 0
    let activeAnchor = null
    let anchorStrength = 0
    if (anchorEl) {
      activeAnchor = anchorEl
      anchorStrength = modeMix
    } else if (ctaMix > 0.02 && ctaAnchorEl) {
      activeAnchor = ctaAnchorEl
      anchorStrength = ctaMix * 0.96
    } else if (lampMix > 0.02 && !inTriadZone) {
      activeAnchor = healAnchorEl
      anchorStrength = lampMix * 0.92
    }
    if (activeAnchor) {
      const r = activeAnchor.getBoundingClientRect()
      const targetX = Math.min(Math.max(r.left + r.width / 2, rx * 0.6), width - rx * 0.6)
      const targetY = Math.min(Math.max(r.top + r.height / 2, ry * 0.8), height - ry * 0.8)
      anchTX = (targetX - width * ANCHOR_X) * anchorStrength
      anchTY = (targetY - height * ANCHOR_Y) * anchorStrength
    }
    anchorOffX += (anchTX - anchorOffX) * 0.07
    anchorOffY += (anchTY - anchorOffY) * 0.07
    cx += anchorOffX
    cy += anchorOffY

    smoothCurX += (cursorX - smoothCurX) * 0.06
    smoothCurY += (cursorY - smoothCurY) * 0.06

    let attTX = 0
    let attTY = 0
    if (hovering) {
      const dxa = smoothCurX - cx
      const dya = smoothCurY - cy
      const d = Math.hypot(dxa, dya) || 1
      const pull = Math.min(d, rx * 1.6) * 0.032 * calm
      attTX = (dxa / d) * pull * rx * 0.008
      attTY = (dya / d) * pull * rx * 0.008
    }
    attractX += (attTX - attractX) * 0.03
    attractY += (attTY - attractY) * 0.03
    cx += attractX
    cy += attractY

    // Деформация контура: вытягивание к курсору + локальный прогиб при контакте.
    const dxc = smoothCurX - cx
    const dyc = smoothCurY - cy
    const cursorDist = Math.hypot(dxc, dyc) || 1
    const ux = dxc / cursorDist
    const uy = dyc / cursorDist
    const reach = Math.min(width, height) * 0.6
    const stretchProx = hovering ? Math.max(0, 1 - cursorDist / reach) : 0
    const dentRadius = rx * 0.6

    for (const p of points) {
      const pxDir = Math.cos(p.angle)
      const pyDir = Math.sin(p.angle)
      const px = cx + pxDir * rx * (1 + p.ext / rx)
      const py = cy + pyDir * ry * (1 + p.ext / rx)

      let target = 0

      if (hovering && modeMix < 0.5) {
        // Вытягивание: только та часть контура, что смотрит на курсор.
        const align = pxDir * ux + pyDir * uy
        if (align > 0 && cursorDist > rx * 0.35) {
          target += align ** 3 * stretchProx * rx * 0.21
        }

        // Прогиб: точки рядом с курсором отступают внутрь.
        const dPoint = Math.hypot(smoothCurX - px, smoothCurY - py)
        if (dPoint < dentRadius) {
          const fear = (1 - dPoint / dentRadius) ** 2
          target -= fear * rx * 0.3
        }

        target *= Math.max(0, 1 - modeMix * 2) * (1 - lampMix * 0.75) * (1 - triadMix * 0.4) * (1 - processMix * 0.85) * (1 - ctaMix * 0.6)
      }

      p.vel += (target - p.ext) * 0.065
      p.vel *= 0.86
      p.ext += p.vel
    }

    ctx.clearRect(0, 0, width, height)
    drawScene(cx, cy, rx, ry, t)
  }

  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })

  healAnchorEl = document.querySelector('[data-blob-zone-anchor="promise"]')

  healObserver = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio > 0.22
      inHealZone = visible
      if (visible && !healWasVisible) {
        mergePulse = 1
        clearMode()
      }
      healWasVisible = visible
    },
    { threshold: [0, 0.22, 0.45, 0.7] },
  )

  triadObserver = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio > 0.18
      inTriadZone = visible
      if (visible && !triadWasVisible) {
        triadPulse = 1
        clearMode()
      }
      triadWasVisible = visible
    },
    { threshold: [0, 0.18, 0.4, 0.65] },
  )

  processObserver = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio > 0.15
      inProcessZone = visible
      if (visible && !processWasVisible) {
        clearMode()
        processTarget = 2
      }
      processWasVisible = visible
    },
    { threshold: [0, 0.15, 0.35, 0.6] },
  )

  ctaObserver = new IntersectionObserver(
    ([entry]) => {
      inCtaZone = entry.isIntersecting && entry.intersectionRatio > 0.25
    },
    { threshold: [0, 0.25, 0.5, 0.75] },
  )

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    if (ctx && width > 0) {
      const { rx, ry } = blobRadii()
      drawScene(width * ANCHOR_X, height * ANCHOR_Y, rx, ry, 0)
    }
    return
  }

  raf = requestAnimationFrame(tick)

  document.addEventListener('focusin', onOver)
  document.addEventListener('focusout', onOut)

  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (!finePointer) return

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', onWindowLeave)
  document.addEventListener('mouseover', onOver)
  document.addEventListener('mouseout', onOut)
  pointerActive = true
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  healObserver?.disconnect()
  triadObserver?.disconnect()
  processObserver?.disconnect()
  ctaObserver?.disconnect()
  cancelAnimationFrame(raf)
  document.removeEventListener('focusin', onOver)
  document.removeEventListener('focusout', onOut)
  if (!pointerActive) return
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('mouseleave', onWindowLeave)
  document.removeEventListener('mouseover', onOver)
  document.removeEventListener('mouseout', onOut)
})
</script>

<template>
  <div class="site-blob" aria-hidden="true">
    <canvas ref="canvasRef" class="site-blob__canvas" />
  </div>
</template>
