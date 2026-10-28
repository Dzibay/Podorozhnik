<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { perf, useLite } from '../../utils/perf'
import { calmMotion } from './useScrollProgress'

/**
 * Обёртка 3D-сцены: three.js грузится отдельным чанком только на этой странице.
 * В облегчённом режиме вместо сцены — заранее отрендеренный кадр, three.js не скачивается вовсе.
 */
const lite = useLite()
const canvas = ref(null)
let api = null
let disposed = false

function onMove(event) {
  api?.setPointer(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5)
}

function stop() {
  window.removeEventListener('pointermove', onMove)
  api?.dispose()
  api = null
}

async function start() {
  await nextTick()
  if (!canvas.value) return
  const styles = getComputedStyle(canvas.value)
  const { mountSteel } = await import('./steelFrame')
  if (disposed || perf.lite || !canvas.value) return
  try {
    api = mountSteel(canvas.value, {
      accent: styles.getPropertyValue('--case-accent').trim() || '#ff5a1f',
      bg: styles.getPropertyValue('--case-bg').trim() || '#101215',
      reduced: calmMotion(),
    })
  } catch {
    // без WebGL остаётся просто фон страницы
    return
  }
  window.addEventListener('pointermove', onMove, { passive: true })
}

onMounted(() => {
  if (!perf.lite) start()
})

// если компьютер не справился и режим включился на ходу — меняем сцену на картинку
watch(
  () => perf.lite,
  (lite) => (lite ? stop() : start()),
)

onUnmounted(() => {
  disposed = true
  stop()
})
</script>

<template>
  <div class="steel" :class="{ 'steel--still': lite }">
    <img
      v-if="lite"
      class="steel__still"
      src="/img/cases/greydstroy-steel.webp"
      srcset="/img/cases/greydstroy-steel-640.webp 640w, /img/cases/greydstroy-steel.webp 1100w"
      sizes="(max-width: 960px) 100vw, 64vw"
      width="1100"
      height="1082"
      alt=""
      decoding="async"
    />
    <canvas v-else ref="canvas" class="steel__canvas" />
  </div>
</template>
