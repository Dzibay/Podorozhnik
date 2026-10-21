<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { calmMotion } from '../useScrollProgress'

/** До/после: шторка между старым и новым сайтом. При появлении сама показывает, что её можно тянуть */
defineProps({
  compare: { type: Object, required: true },
})

const root = ref(null)
const pos = ref(50)
const touched = ref(false)
let observer = null
let timer = 0

function hint() {
  const frames = [50, 78, 22, 50]
  const start = performance.now()
  const step = () => {
    if (touched.value) return
    const t = Math.min(1, (performance.now() - start) / 2600)
    const seg = Math.min(frames.length - 2, Math.floor(t * (frames.length - 1)))
    const local = t * (frames.length - 1) - seg
    const ease = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2
    pos.value = frames[seg] + (frames[seg + 1] - frames[seg]) * ease
    if (t < 1) timer = requestAnimationFrame(step)
  }
  timer = requestAnimationFrame(step)
}

function onInput(event) {
  touched.value = true
  pos.value = Number(event.target.value)
}

onMounted(() => {
  if (calmMotion()) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      hint()
    },
    { threshold: 0.6 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(timer)
})
</script>

<template>
  <section class="cp-sec cp-cmp">
    <div class="container">
      <div class="cp-cmp__head">
        <h2 v-reveal class="cp-h2">
          {{ compare.title[0] }}<br />
          <span class="cp-accent">{{ compare.title[1] }}</span>
        </h2>
        <p v-reveal class="cp-text">{{ compare.text }}</p>
      </div>

      <div
        ref="root"
        v-reveal
        class="cp-cmp__frame"
        :style="{ '--pos': `${pos}%`, aspectRatio: `${compare.w} / ${compare.h}` }"
      >
        <img
          class="cp-cmp__img"
          :src="compare.after.src"
          :srcset="compare.after.small && `${compare.after.small} 800w, ${compare.after.src} ${compare.w}w`"
          sizes="(max-width: 960px) 100vw, 75rem"
          :width="compare.w" :height="compare.h" alt="Новый сайт" loading="lazy" decoding="async" />
        <img
          class="cp-cmp__img cp-cmp__img--before"
          :src="compare.before.src"
          :srcset="compare.before.small && `${compare.before.small} 800w, ${compare.before.src} ${compare.w}w`"
          sizes="(max-width: 960px) 100vw, 75rem"
          :width="compare.w"
          :height="compare.h"
          alt="Старый сайт"
          loading="lazy"
          decoding="async"
        />
        <span class="cp-cmp__tag cp-cmp__tag--before mono">{{ compare.before.label }}</span>
        <span class="cp-cmp__tag cp-cmp__tag--after mono">{{ compare.after.label }}</span>
        <span class="cp-cmp__handle" aria-hidden="true">
          <span class="cp-cmp__knob">‹ ›</span>
        </span>
        <input
          class="cp-cmp__range"
          type="range"
          min="0"
          max="100"
          step="0.1"
          :value="pos"
          aria-label="Сравнить старый и новый сайт"
          @input="onInput"
        />
      </div>
    </div>
  </section>
</template>
