<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { prefersReducedMotion } from './useScrollProgress'

/** Обёртка 3D-сцены: three.js грузится отдельным чанком только на этой странице */
const canvas = ref(null)
let api = null
let disposed = false

function onMove(event) {
  api?.setPointer(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5)
}

onMounted(async () => {
  const styles = getComputedStyle(canvas.value)
  const { mountSteel } = await import('./steelFrame')
  if (disposed || !canvas.value) return
  try {
    api = mountSteel(canvas.value, {
      accent: styles.getPropertyValue('--case-accent').trim() || '#ff5a1f',
      bg: styles.getPropertyValue('--case-bg').trim() || '#101215',
      reduced: prefersReducedMotion(),
    })
  } catch {
    // без WebGL остаётся просто фон страницы
    return
  }
  window.addEventListener('pointermove', onMove, { passive: true })
})

onUnmounted(() => {
  disposed = true
  window.removeEventListener('pointermove', onMove)
  api?.dispose()
})
</script>

<template>
  <div class="steel">
    <canvas ref="canvas" class="steel__canvas" />
  </div>
</template>
