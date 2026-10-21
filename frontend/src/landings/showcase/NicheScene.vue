<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { calmMotion, perf } from '../../utils/perf'

/**
 * 3D-сцена ниши. three.js и сама сцена грузятся отдельным чанком только здесь;
 * в облегчённом режиме вместо сцены — заранее отрендеренный кадр, three.js не скачивается.
 */
const props = defineProps({
  scene: { type: String, required: true },
  still: { type: String, required: true },
})

const loaders = {
  production: () => import('../scenes/production').then((m) => m.mountProduction),
  stroika: () => import('../scenes/stroika').then((m) => m.mountStroika),
  mebel: () => import('../scenes/mebel').then((m) => m.mountMebel),
  law: () => import('../scenes/law').then((m) => m.mountLaw),
  clinic: () => import('../scenes/clinic').then((m) => m.mountClinic),
  logistics: () => import('../scenes/logistics').then((m) => m.mountLogistics),
  school: () => import('../scenes/school').then((m) => m.mountSchool),
  village: () => import('../scenes/village').then((m) => m.mountVillage),
  garage: () => import('../scenes/garage').then((m) => m.mountGarage),
  cleaning: () => import('../scenes/cleaning').then((m) => m.mountCleaning),
  food: () => import('../scenes/food').then((m) => m.mountFood),
  beauty: () => import('../scenes/beauty').then((m) => m.mountBeauty),
}

const canvas = ref(null)
let api = null
let disposed = false
let token = 0

function onMove(event) {
  api?.setPointer(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5)
}

function stop() {
  token++
  window.removeEventListener('pointermove', onMove)
  api?.dispose()
  api = null
}

async function start() {
  const my = ++token
  await nextTick()
  if (!canvas.value || !loaders[props.scene]) return
  const mount = await loaders[props.scene]()
  // пока грузился чанк, могли уйти со страницы, сменить нишу или включить облегчённый режим
  if (disposed || my !== token || perf.lite || !canvas.value) return
  const styles = getComputedStyle(canvas.value)
  try {
    api = mount(canvas.value, {
      accent: styles.getPropertyValue('--lp-accent').trim() || '#ff6a1f',
      bg: styles.getPropertyValue('--lp-bg').trim() || '#101316',
      reduced: calmMotion(),
    })
  } catch {
    // без WebGL остаётся фон страницы
    return
  }
  window.addEventListener('pointermove', onMove, { passive: true })
}

onMounted(() => {
  if (!perf.lite) start()
})

watch(
  () => perf.lite,
  (lite) => (lite ? stop() : start()),
)

watch(
  () => props.scene,
  () => {
    stop()
    if (!perf.lite) start()
  },
)

onUnmounted(() => {
  disposed = true
  stop()
})
</script>

<template>
  <div class="ns-scene" aria-hidden="true">
    <img
      v-if="perf.lite"
      class="ns-scene__still"
      :src="`${still}.webp`"
      :srcset="`${still}-640.webp 640w, ${still}.webp 1100w`"
      sizes="(max-width: 960px) 100vw, 60vw"
      width="1100"
      height="1028"
      alt=""
      decoding="async"
    />
    <canvas v-else :key="scene" ref="canvas" class="ns-scene__canvas" />
  </div>
</template>
