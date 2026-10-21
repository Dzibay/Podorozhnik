<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { formatMetric } from '../../data/cases'

/** Число метрики, которое отсчитывается от нуля при появлении на экране */
const props = defineProps({
  metric: { type: Object, required: true },
  duration: { type: Number, default: 1600 },
})

const root = ref(null)
const text = ref(formatMetric(props.metric, 0))
let observer = null
let timer = 0

function run() {
  const start = performance.now()
  const target = props.metric.value
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / props.duration)
    const eased = 1 - Math.pow(1 - t, 4)
    text.value = formatMetric(props.metric, Math.round(target * eased))
    if (t < 1) timer = setTimeout(tick, 16)
  }
  tick()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
    text.value = formatMetric(props.metric)
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    run()
  })
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(timer)
})
</script>

<template>
  <span ref="root" class="case-counter">{{ text }}</span>
</template>
