<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { promise } = homeCopy

const nodes = [
  { label: 'Продукт', morph: 'rise', place: 'top' },
  { label: 'Система', morph: 'core', place: 'left' },
  { label: 'Рост', morph: 'expand', place: 'right' },
]

const titleRef = ref(null)
const stageRef = ref(null)
let fitObserver = null

function fitTitle() {
  const title = titleRef.value
  const stage = stageRef.value
  if (!title || !stage) return

  const maxW = stage.clientWidth
  if (maxW <= 0) return

  title.style.removeProperty('font-size')

  let lo = 16
  let hi = 180
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
    id="promise"
    class="section section--promise"
    data-section="promise"
    data-blob-zone="heal"
  >
    <div class="container">
      <p class="kicker">{{ promise.kicker }}</p>
      <h2 class="visually-hidden">{{ promise.title }}</h2>

      <div class="promise-split">
        <div class="promise-before" aria-hidden="true">
          <p class="promise-split__label">Было</p>
          <div class="promise-before__words">
            <span class="promise-before__word promise-before__word--1">продукт</span>
            <span class="promise-before__word promise-before__word--2">система</span>
            <span class="promise-before__word promise-before__word--3">рост</span>
          </div>
        </div>

        <div class="promise-divider" aria-hidden="true" />

        <div
          class="promise-after"
          data-blob-zone-anchor="promise"
          data-blob="calm"
          data-blob-anchor
        >
          <p class="promise-split__label promise-split__label--accent">Стало</p>

          <div class="promise-cycle">
            <div ref="stageRef" class="promise-after__stage">
              <p
                ref="titleRef"
                class="promise-after__title"
                data-blob="ring"
                data-blob-anchor
                tabindex="0"
              >
                Один цикл
              </p>
            </div>

            <div class="promise-triangle">
              <svg
                class="promise-triangle__svg"
                viewBox="0 0 280 190"
                aria-hidden="true"
              >
                <polygon
                  points="140,14 16,176 264,176"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.2"
                />
                <circle cx="140" cy="14" r="5" fill="currentColor" />
                <circle cx="16" cy="176" r="5" fill="currentColor" />
                <circle cx="264" cy="176" r="5" fill="currentColor" />
              </svg>

              <button
                v-for="node in nodes"
                :key="node.label"
                type="button"
                class="promise-node"
                :class="`promise-node--${node.place}`"
                :data-blob="node.morph"
                data-blob-anchor
              >
                {{ node.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p class="promise__lead">{{ promise.lead }}</p>
    </div>
  </section>
</template>
