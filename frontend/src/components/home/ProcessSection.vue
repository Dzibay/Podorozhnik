<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { process } = homeCopy
const list = ref(null)
const current = ref(0)
let frame = 0

/** Линия заполняется по мере скролла, активный шаг — тот, что у середины экрана */
function update() {
  frame = 0
  const el = list.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const mid = window.innerHeight * 0.55
  const p = Math.min(1, Math.max(0, (mid - rect.top) / rect.height))
  el.style.setProperty('--fill', p.toFixed(4))
  const items = [...el.children]
  let index = 0
  items.forEach((item, i) => {
    if (item.getBoundingClientRect().top < mid) index = i
  })
  current.value = index
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section id="process" class="sec process" data-section="process">
    <div class="container process__layout">
      <div class="process__aside">
        <p v-reveal class="kicker">{{ process.kicker }}</p>
        <h2 v-reveal class="h-1">{{ process.titleStart }} <em>{{ process.titleAccent }}</em></h2>
        <p class="process__counter" aria-hidden="true">
          <span class="process__counter-num">0{{ current + 1 }}</span>
          <span class="mono">/ 0{{ process.phases.length }}</span>
        </p>
      </div>

      <ol ref="list" class="process__list">
        <li
          v-for="(phase, index) in process.phases"
          :key="phase.id"
          class="process__step"
          :class="{ 'is-active': index <= current }"
        >
          <span class="process__dot" aria-hidden="true" />
          <p class="mono process__tagline">Шаг {{ index + 1 }} · {{ phase.tagline }}</p>
          <h3 class="process__name">{{ phase.title }}</h3>
          <p class="process__text">{{ phase.text }}</p>
          <ul class="process__tags">
            <li v-for="tag in phase.tags" :key="tag">{{ tag }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>
