<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

/** Кастомный курсор: точка + кольцо с инерцией, подпись из data-cursor. */
const enabled = ref(false)
const root = ref(null)
const dot = ref(null)
const ring = ref(null)
const label = ref('')
const state = ref('')

let raf = 0
const pos = { x: -100, y: -100 }
const lag = { x: -100, y: -100 }

function onMove(event) {
  pos.x = event.clientX
  pos.y = event.clientY
  if (state.value === 'hidden') state.value = ''
}

function onOver(event) {
  const target = event.target.closest('[data-cursor], a, button, summary, label, input, textarea')
  if (!target) {
    state.value = ''
    label.value = ''
    return
  }
  if (target.matches('input, textarea')) {
    state.value = 'hidden'
    return
  }
  const text = target.getAttribute('data-cursor')
  label.value = text || ''
  state.value = text ? 'label' : 'hover'
}

function onLeave() {
  state.value = 'hidden'
}

function tick() {
  lag.x += (pos.x - lag.x) * 0.18
  lag.y += (pos.y - lag.y) * 0.18
  if (dot.value) dot.value.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
  if (ring.value) ring.value.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced) return
  enabled.value = true
  document.documentElement.classList.add('has-cursor')
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  document.documentElement.classList.remove('has-cursor')
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerover', onOver)
  document.documentElement.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <div
    v-if="enabled"
    ref="root"
    class="cursor"
    :class="state && `cursor--${state}`"
    aria-hidden="true"
  >
    <div ref="ring" class="cursor__ring-wrap" style="position: absolute; top: 0; left: 0">
      <div class="cursor__ring">{{ state === 'label' ? label : '' }}</div>
    </div>
    <div ref="dot" style="position: absolute; top: 0; left: 0">
      <div class="cursor__dot" />
    </div>
  </div>
</template>
