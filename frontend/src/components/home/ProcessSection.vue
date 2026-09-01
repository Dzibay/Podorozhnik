<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { process } = homeCopy
const phases = process.phases

const activePhase = ref(2)
const titleRef = ref(null)
const stageRef = ref(null)
let fitObserver = null

const current = computed(() => phases[activePhase.value])

function fitTitle() {
  const title = titleRef.value
  const stage = stageRef.value
  if (!title || !stage) return

  const maxW = stage.clientWidth
  if (maxW <= 0) return

  title.style.removeProperty('font-size')

  let lo = 16
  let hi = 120
  let best = lo

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    title.style.fontSize = `${mid}px`
    if (title.scrollWidth <= maxW) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  title.style.fontSize = `${best}px`
}

onMounted(async () => {
  if (document.fonts?.ready) await document.fonts.ready
  fitTitle()
  requestAnimationFrame(fitTitle)
  fitObserver = new ResizeObserver(fitTitle)
  if (stageRef.value) fitObserver.observe(stageRef.value)
  window.addEventListener('resize', fitTitle, { passive: true })
})

onUnmounted(() => {
  fitObserver?.disconnect()
  window.removeEventListener('resize', fitTitle)
})
</script>

<template>
  <section
    id="process"
    class="section section--process"
    data-section="process"
    data-blob-zone="process"
  >
    <div class="container">
      <p class="kicker">{{ process.kicker }}</p>

      <div ref="stageRef" class="process-head">
        <h2 ref="titleRef" class="process-head__title">{{ process.title }}</h2>
      </div>

      <div class="process-rail" role="tablist" aria-label="Фазы процесса">
        <button
          v-for="(phase, index) in phases"
          :id="`process-tab-${phase.id}`"
          :key="phase.id"
          type="button"
          class="process-rail__item"
          :class="{ 'process-rail__item--active': activePhase === index }"
          role="tab"
          :aria-selected="activePhase === index"
          :aria-controls="`process-panel-${phase.id}`"
          :data-process-phase="index"
          data-process-marker
          @mouseenter="activePhase = index"
          @focus="activePhase = index"
          @click="activePhase = index"
        >
          {{ phase.title }}
        </button>
      </div>

      <div
        class="process-track"
        data-blob-zone-anchor="process-track"
        aria-hidden="true"
      >
        <div class="process-track__groove" />
      </div>

      <article
        :id="`process-panel-${current.id}`"
        class="process-card"
        role="tabpanel"
        :aria-labelledby="`process-tab-${current.id}`"
      >
        <div class="process-card__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="12"
              y="14"
              width="24"
              height="24"
              rx="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M12 22h24M22 14v24"
              stroke="currentColor"
              stroke-width="1.5"
              opacity="0.5"
            />
          </svg>
        </div>
        <div class="process-card__body">
          <h3 class="process-card__title">{{ current.title }}</h3>
          <p class="process-card__tagline">{{ current.tagline }}</p>
          <p class="process-card__text">{{ current.text }}</p>
          <ul class="process-card__tags">
            <li v-for="tag in current.tags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
