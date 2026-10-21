<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { proof } = homeCopy
const root = ref(null)
const values = ref(proof.stats.map(() => 0))
let observer
let frame = 0

function run() {
  const startAt = performance.now()
  const duration = 1800
  const tick = (now) => {
    const t = Math.min(1, (now - startAt) / duration)
    const e = 1 - Math.pow(1 - t, 4)
    values.value = proof.stats.map((stat) => Math.round(stat.value * e))
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      run()
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section ref="root" class="sec sec--dark proof grain" data-section="proof">
    <div class="container">
      <p v-reveal class="kicker">{{ proof.kicker }}</p>
      <h2 v-reveal class="h-2 proof__title">
        {{ proof.titleStart }} <em>{{ proof.titleAccent }}</em>
      </h2>

      <dl class="proof__grid">
        <div v-for="(stat, index) in proof.stats" :key="stat.label" v-reveal class="proof__item" :style="{ '--i': index }">
          <dt class="proof__value">
            {{ values[index] }}<span class="proof__suffix">{{ stat.suffix }}</span>
          </dt>
          <dd class="proof__label">{{ stat.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
