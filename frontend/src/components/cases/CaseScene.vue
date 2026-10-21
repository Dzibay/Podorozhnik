<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SteelScene from './SteelScene.vue'

/**
 * Уникальная сцена первого экрана кейса. Всё нарисовано кодом (SVG/CSS),
 * слегка следует за курсором через --px/--py.
 */
const props = defineProps({
  scene: { type: String, required: true },
})

const root = ref(null)

/* Детерминированный «рандом», чтобы сцена не прыгала между рендерами */
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rnd = seeded(7)
const stars = Array.from({ length: 70 }, () => ({
  x: rnd() * 100,
  y: rnd() * 100,
  s: 0.6 + rnd() * 1.8,
  d: rnd() * 6,
}))

const zodiac = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sign) => `${sign}︎`) // текстовые глифы, а не эмодзи

/* crowd: 270 точек, каждая ≈ 100 регистраций */
const crowd = Array.from({ length: 270 }, (_, i) => ({ i, d: (rnd() * 0.6 + (i / 270) * 2.4).toFixed(2) }))

/* village: дома разной высоты, окна загораются в своём ритме */
const houses = Array.from({ length: 9 }, (_, i) => ({
  x: i * 11 + 1,
  w: 8 + (i % 3),
  h: 14 + ((i * 7) % 10),
  windows: Array.from({ length: 2 + (i % 3) }, () => ({ d: (rnd() * 8).toFixed(2), dur: (5 + rnd() * 5).toFixed(2) })),
}))

const facades = Array.from({ length: 18 }, (_, i) => ({ i, d: ((i % 6) * 0.12 + Math.floor(i / 6) * 0.25).toFixed(2) }))

function onMove(event) {
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
  el.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
}

onMounted(() => {
  if (window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', onMove, { passive: true })
})

onUnmounted(() => window.removeEventListener('pointermove', onMove))
</script>

<template>
  <div ref="root" class="scene" :class="`scene--${props.scene}`" aria-hidden="true">
    <!-- Металлоконструкции: 3D-каркас цеха собирается из балок -->
    <SteelScene v-if="scene === 'steel'" />

    <!-- Перегородки: стеклянные панели в алюминиевых рамах -->
    <div v-else-if="scene === 'glass'" class="glass">
      <span v-for="n in 7" :key="n" class="glass__panel" :style="{ '--n': n }">
        <span class="glass__sheen" />
        <span v-if="n === 4" class="glass__door" />
      </span>
      <span class="glass__floor" />
    </div>

    <!-- Астра: небо, кольцо зодиака, Солнце и Луна на орбитах -->
    <div v-else-if="scene === 'orbit'" class="orbit">
      <span
        v-for="(star, i) in stars"
        :key="i"
        class="orbit__star"
        :style="{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.s}px`, height: `${star.s}px`, animationDelay: `${star.d}s` }"
      />
      <div class="orbit__system">
        <span class="orbit__ring orbit__ring--1" />
        <span class="orbit__ring orbit__ring--2" />
        <span class="orbit__ring orbit__ring--3">
          <span v-for="(sign, i) in zodiac" :key="sign" class="orbit__sign" :style="{ '--i': i }">{{ sign }}</span>
        </span>
        <span class="orbit__path orbit__path--sun"><span class="orbit__sun" /></span>
        <span class="orbit__path orbit__path--moon"><span class="orbit__moon" /></span>
        <span class="orbit__core" />
      </div>
    </div>

    <!-- Школа: зал заполняется людьми — каждая точка ≈ 100 регистраций -->
    <div v-else-if="scene === 'crowd'" class="crowd">
      <span v-for="dot in crowd" :key="dot.i" class="crowd__dot" :style="{ animationDelay: `${dot.d}s` }" />
    </div>

    <!-- SUP: волны, солнце и доска -->
    <div v-else-if="scene === 'waves'" class="waves">
      <span class="waves__sun" />
      <svg class="waves__board" viewBox="0 0 160 40">
        <path d="M6 26c20-10 128-10 148 0-20 8-128 8-148 0Z" fill="currentColor" />
        <path d="M80 2v22M70 24h20" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
      <svg v-for="n in 3" :key="n" class="waves__wave" :class="`waves__wave--${n}`" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0 60 Q 75 20 150 60 T 300 60 T 450 60 T 600 60 T 750 60 T 900 60 T 1050 60 T 1200 60 V120 H0 Z" />
      </svg>
    </div>

    <!-- Интерьеры: чертёж квартиры рисуется линиями -->
    <svg v-else-if="scene === 'plan'" class="plan" viewBox="0 0 600 420" fill="none">
      <g class="plan__walls">
        <path pathLength="100" d="M40 40h520v340H40z" />
        <path pathLength="100" d="M300 40v150M300 250v130M40 220h170M260 220h40M420 40v110M420 210v170M420 210h140" />
      </g>
      <g class="plan__doors">
        <path pathLength="100" d="M210 220a50 50 0 0 1 50-50" />
        <path pathLength="100" d="M300 190a60 60 0 0 1 60 60" />
        <path pathLength="100" d="M420 150a60 60 0 0 1 60 60" />
      </g>
      <g class="plan__furniture">
        <rect pathLength="100" x="70" y="70" width="120" height="70" />
        <rect pathLength="100" x="70" y="260" width="80" height="80" rx="40" />
        <rect pathLength="100" x="330" y="280" width="60" height="70" />
        <rect pathLength="100" x="450" y="70" width="80" height="50" />
        <rect pathLength="100" x="330" y="70" width="60" height="100" />
        <rect pathLength="100" x="460" y="250" width="70" height="100" />
      </g>
      <g class="plan__dims">
        <path pathLength="100" d="M40 18h520M40 12v12M560 12v12" />
        <text x="300" y="12">12 400</text>
        <path pathLength="100" d="M582 40v340M576 40h12M576 380h12" />
        <text x="592" y="214" transform="rotate(90 592 214)">8 100</text>
      </g>
    </svg>

    <!-- Кухни: фасады раскрываются один за другим -->
    <div v-else-if="scene === 'facades'" class="facades">
      <span v-for="f in facades" :key="f.i" class="facades__cell" :style="{ animationDelay: `${f.d}s` }">
        <span class="facades__handle" />
      </span>
      <span class="facades__light" />
    </div>

    <!-- Посёлок: в окнах загорается свет -->
    <svg v-else-if="scene === 'village'" class="village" viewBox="0 0 100 50" preserveAspectRatio="xMidYMax meet">
      <circle
        v-for="(star, i) in stars.slice(0, 40)"
        :key="i"
        class="village__star"
        :cx="star.x"
        :cy="star.y * 0.3"
        :r="star.s * 0.12"
        :style="{ animationDelay: `${star.d}s` }"
      />
      <g v-for="(h, i) in houses" :key="i" class="village__house">
        <path :d="`M${h.x} 50V${50 - h.h}l${h.w / 2} -${h.w / 2.4} ${h.w / 2} ${h.w / 2.4}V50Z`" />
        <rect
          v-for="(w, j) in h.windows"
          :key="j"
          class="village__window"
          :x="h.x + 1.4 + (j % 2) * (h.w / 2 - 0.4)"
          :y="50 - h.h + 3 + Math.floor(j / 2) * 5"
          :width="h.w / 2 - 2.4"
          height="3"
          :style="{ animationDelay: `${w.d}s`, animationDuration: `${w.dur}s` }"
        />
      </g>
      <path class="village__ground" d="M0 50h100" />
    </svg>
  </div>
</template>
