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
let heartTarget = 0
let heartMix = 0

// Полярная таблица формы сердца: радиус контура по углу (canvas, y вниз).
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

// Взаимодействия с элементами страницы: любой элемент с data-blob="<shape>".
function shapeFrom(node) {
  if (!node || !(node instanceof Element)) return null
  return node.closest('[data-blob]')?.dataset.blob ?? null
}

function onOver(event) {
  if (shapeFrom(event.target) === 'heart') heartTarget = 1
}

function onOut(event) {
  const from = shapeFrom(event.target)
  if (!from) return
  if (shapeFrom(event.relatedTarget) !== from) heartTarget = 0
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

function drawBlob(cx, cy, rx, ry, t) {
  // Позиции точек контура: органическая форма, при hover цели — морф в сердце.
  const heartScale = rx * 0.052
  const coords = points.map((p) => {
    const wob = Math.sin(t * p.wobSpeed + p.wobPhase) * rx * p.wobAmp * (1 - heartMix * 0.65)
    const r = 1 + (p.ext + wob) / rx
    const ox = Math.cos(p.angle) * rx * r
    const oy = Math.sin(p.angle) * ry * r
    if (heartMix < 0.001) {
      return { x: cx + ox, y: cy + oy }
    }
    const hr = heartRadius(p.angle) * heartScale
    const hx = Math.cos(p.angle) * hr
    const hy = Math.sin(p.angle) * hr
    return {
      x: cx + ox * (1 - heartMix) + hx * heartMix,
      y: cy + oy * (1 - heartMix) + hy * heartMix,
    }
  })

  const paint = (scale, fill) => {
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

  paint(1.55, FILL_HALO)
  paint(1, FILL_CORE)
}

function tick(now) {
  if (ctx && width > 0) {
    const t = now / 1000
    const { rx, ry } = blobRadii()

    heartMix += (heartTarget - heartMix) * 0.055

    // Центр: собственное блуждание + лёгкое смещение к курсору.
    const calm = 1 - heartMix * 0.7
    const driftX = (Math.sin(t * 0.42) * rx * 0.09 + Math.sin(t * 0.93 + 2.1) * rx * 0.04) * calm
    const driftY = (Math.cos(t * 0.35) * ry * 0.12 + Math.cos(t * 0.81 + 0.6) * ry * 0.05) * calm

    let cx = width * ANCHOR_X + driftX
    let cy = height * ANCHOR_Y + driftY

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

      if (hovering && heartMix < 0.5) {
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

        target *= 1 - heartMix * 2
      }

      p.vel += (target - p.ext) * 0.065
      p.vel *= 0.86
      p.ext += p.vel
    }

    ctx.clearRect(0, 0, width, height)
    drawBlob(cx, cy, rx, ry, t)
  }

  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    if (ctx && width > 0) {
      const { rx, ry } = blobRadii()
      drawBlob(width * ANCHOR_X, height * ANCHOR_Y, rx, ry, 0)
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
