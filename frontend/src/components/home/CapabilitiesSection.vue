<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import { serviceGroups, getServicesByGroup } from '../../data/services'

const { capabilities } = homeCopy

const morphs = {
  product: 'rise',
  system: 'core',
  growth: 'expand',
}

const groups = serviceGroups.map((group, index) => ({
  ...group,
  morph: morphs[group.id],
  triadAnchor: `triad-${index}`,
  items: getServicesByGroup(group.id),
}))

const listRef = ref(null)
let fitObserver = null

function fitLines() {
  const list = listRef.value
  if (!list) return

  for (const title of list.querySelectorAll('.cap-line__title')) {
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
  <section
    id="capabilities"
    class="section section--capabilities"
    data-section="capabilities"
    data-blob-zone="triad"
  >
    <div class="container">
      <p class="kicker">{{ capabilities.kicker }}</p>
      <h2 class="visually-hidden">{{ capabilities.title }}</h2>

      <ul ref="listRef" class="cap-lines">
        <li
          v-for="group in groups"
          :key="group.id"
          class="cap-line"
          :data-blob="group.morph"
          :data-blob-zone-anchor="group.triadAnchor"
          data-blob-anchor
          tabindex="0"
        >
          <div class="cap-line__stage">
            <h3 class="cap-line__title">{{ group.title }}</h3>
          </div>
          <ul class="cap-line__services">
            <li v-for="item in group.items" :key="item.slug">
              <RouterLink :to="routes.service(item.slug)">{{ item.shortTitle }}</RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <p class="cap-lines__lead">{{ capabilities.lead }}</p>
    </div>
  </section>
</template>
