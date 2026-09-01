<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { pain } = homeCopy

// Морф пятна для каждой боли: сдувается / расползается / разрывается.
const morphs = ['deflate', 'scatter', 'split']

const listRef = ref(null)
let fitObserver = null

function fitLines() {
  const list = listRef.value
  if (!list) return

  for (const title of list.querySelectorAll('.pain-line__title')) {
    const maxW = title.parentElement.clientWidth
    if (maxW <= 0) continue

    title.style.removeProperty('font-size')

    let lo = 16
    let hi = 220
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
}

onMounted(async () => {
  if (document.fonts?.ready) await document.fonts.ready
  fitLines()
  requestAnimationFrame(fitLines)
  fitObserver = new ResizeObserver(fitLines)
  if (listRef.value) fitObserver.observe(listRef.value)
  window.addEventListener('resize', fitLines, { passive: true })
})

onUnmounted(() => {
  fitObserver?.disconnect()
  window.removeEventListener('resize', fitLines)
})
</script>

<template>
  <section id="pain" class="section section--pain" data-section="pain">
    <div class="container">
      <p class="kicker">{{ pain.kicker }}</p>
      <h2 class="visually-hidden">{{ pain.title }}</h2>

      <ul ref="listRef" class="pain-lines">
        <li
          v-for="(item, index) in pain.items"
          :key="item.title"
          class="pain-line"
          :data-blob="morphs[index]"
          data-blob-anchor
          tabindex="0"
        >
          <div class="pain-line__stage">
            <h3 class="pain-line__title">{{ item.title }}</h3>
          </div>
          <p class="pain-line__note">{{ item.text }}</p>
        </li>
      </ul>

      <p class="pain-lines__lead">{{ pain.lead }}</p>
    </div>
  </section>
</template>
