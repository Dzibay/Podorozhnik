<script setup>
import { computed, ref } from 'vue'
import { prefersReducedMotion, useScrollProgress } from '../useScrollProgress'

/**
 * Путь клиента: секция закрепляется, а линия маршрута прорисовывается по мере прокрутки.
 * Точки зажигаются, когда до них доходит линия. Узкие экраны получают обычный список.
 */
const props = defineProps({
  journey: { type: Object, required: true },
})

const root = ref(null)
const progress = useScrollProgress(root, 'pin')
const reduced = prefersReducedMotion()

const W = 1200
const nodes = computed(() => {
  const n = props.journey.points.length
  return props.journey.points.map((point, i) => ({
    ...point,
    x: 80 + (i * (W - 160)) / (n - 1),
    y: i % 2 ? 110 : 290,
  }))
})

/* кривая из кубических сегментов: соседние сегменты одной длины, поэтому точка i стоит на доле i/(n-1) */
const path = computed(() =>
  nodes.value.reduce((d, p, i, all) => {
    if (!i) return `M${p.x} ${p.y}`
    const prev = all[i - 1]
    const mid = (prev.x + p.x) / 2
    return `${d} C${mid} ${prev.y} ${mid} ${p.y} ${p.x} ${p.y}`
  }, ''),
)

const draw = computed(() => (reduced ? 1 : Math.min(1, Math.max(0, (progress.value - 0.04) / 0.82))))

const dot = computed(() => {
  const all = nodes.value
  const segs = all.length - 1
  const t = draw.value * segs
  const i = Math.min(segs - 1, Math.floor(t))
  const u = t - i
  const a = all[i]
  const b = all[i + 1]
  const mid = (a.x + b.x) / 2
  const k = 1 - u
  return {
    x: k * k * k * a.x + 3 * k * k * u * mid + 3 * k * u * u * mid + u * u * u * b.x,
    y: k * k * k * a.y + 3 * k * k * u * a.y + 3 * k * u * u * b.y + u * u * u * b.y,
  }
})

const isLit = (i) => draw.value >= i / (nodes.value.length - 1) - 0.002
</script>

<template>
  <section
    ref="root"
    class="cp-sec cp-jrn"
    :class="{ 'cp-jrn--static': reduced }"
    :style="{ '--count': journey.points.length }"
  >
    <div class="cp-jrn__sticky">
      <div class="container">
        <div class="cp-jrn__head">
          <p v-reveal class="kicker">Путь клиента</p>
          <h2 v-reveal class="cp-h2">{{ journey.title }}</h2>
          <span class="cp-jrn__pct mono" aria-hidden="true">{{ String(Math.round(draw * 100)).padStart(3, '0') }}%</span>
        </div>

        <div class="cp-jrn__map">
          <svg class="cp-jrn__svg" :viewBox="`0 0 ${W} 400`" preserveAspectRatio="none" aria-hidden="true">
            <path class="cp-jrn__ghost" :d="path" pathLength="100" />
            <path class="cp-jrn__line" :d="path" pathLength="100" :style="{ strokeDashoffset: 100 - draw * 100 }" />
          </svg>

          <span
            class="cp-jrn__runner"
            aria-hidden="true"
            :style="{ left: `${(dot.x / W) * 100}%`, top: `${(dot.y / 400) * 100}%` }"
          />

          <ol class="cp-jrn__points">
            <li
              v-for="(point, i) in nodes"
              :key="point.title"
              class="cp-jrn__point"
              :class="[{ 'is-lit': isLit(i) }, i % 2 ? 'is-up' : 'is-down']"
              :style="{ left: `${(point.x / W) * 100}%`, top: `${(point.y / 400) * 100}%` }"
            >
              <span class="cp-jrn__node" />
              <div class="cp-jrn__card">
                <span class="cp-jrn__stat mono">{{ point.stat }}</span>
                <b>{{ point.title }}</b>
                <span>{{ point.text }}</span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>
