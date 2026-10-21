<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'
import BrandMark from '../ui/BrandMark.vue'

const { stack } = homeCopy
const root = ref(null)

/** Стартовые позиции «подрядчиков» вокруг центра (в долях экрана) */
const spots = [
  { x: -0.33, y: -0.24, r: -7 },
  { x: 0.31, y: -0.27, r: 5 },
  { x: -0.36, y: 0.2, r: 6 },
  { x: 0.34, y: 0.22, r: -6 },
  { x: 0.02, y: 0.33, r: 3 },
]

let frame = 0

const clamp = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => 1 - Math.pow(1 - t, 3)

function update() {
  frame = 0
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const total = rect.height - window.innerHeight
  const p = clamp(-rect.top / total)
  el.style.setProperty('--e', ease(clamp((p - 0.12) / 0.5)).toFixed(4))
  el.style.setProperty('--r', ease(clamp((p - 0.58) / 0.25)).toFixed(4))
  el.style.setProperty('--t', clamp((p - 0.3) / 0.2).toFixed(4))
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.value.style.setProperty('--e', 1)
    root.value.style.setProperty('--r', 1)
    root.value.style.setProperty('--t', 1)
    return
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  update()
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <section ref="root" class="stack" data-section="stack" aria-labelledby="stack-title">
    <div class="stack__pin">
      <div class="stack__grid" aria-hidden="true" />

      <div class="stack__head">
        <p class="kicker">{{ stack.kicker }}</p>
        <h2 id="stack-title" class="h-1 stack__title">
          <span class="stack__title-a">{{ stack.titleStart }}</span>
          <span class="stack__title-b">{{ stack.titleEnd }}</span>
        </h2>
        <p class="stack__lead">{{ stack.lead }}</p>
      </div>

      <ul class="stack__roles">
        <li
          v-for="(role, index) in stack.roles"
          :key="role.name"
          class="stack__role"
          :style="{ '--x': spots[index].x, '--y': spots[index].y, '--rot': `${spots[index].r}deg` }"
        >
          <span class="stack__role-name">{{ role.name }}</span>
          <span class="stack__role-quote">{{ role.quote }}</span>
        </li>
      </ul>

      <div class="stack__result">
        <BrandMark />
        <p class="h-2 stack__result-title">{{ stack.result.title }}</p>
        <p class="stack__result-text">{{ stack.result.text }}</p>
        <ul class="stack__points">
          <li v-for="point in stack.result.points" :key="point">{{ point }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>
