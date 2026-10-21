<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'
import { cases } from '../../data/cases'
import { routes } from '../../data/site'

const { casesBlock } = homeCopy
const root = ref(null)
const track = ref(null)
let frame = 0
let enabled = false

/** Вертикальный скролл двигает ленту кейсов по горизонтали */
function update() {
  frame = 0
  const el = root.value
  if (!el || !track.value) return
  const rect = el.getBoundingClientRect()
  const total = rect.height - window.innerHeight
  const p = Math.min(1, Math.max(0, -rect.top / total))
  const shift = track.value.scrollWidth - track.value.clientWidth
  track.value.style.transform = `translate3d(${-shift * p}px, 0, 0)`
  el.style.setProperty('--p', p.toFixed(4))
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

function setHeight() {
  const el = root.value
  if (!el || !track.value) return
  enabled = window.innerWidth > 960 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.classList.toggle('cases--pinned', enabled)
  if (!enabled) {
    el.style.height = ''
    track.value.style.transform = ''
    return
  }
  const shift = track.value.scrollWidth - track.value.clientWidth
  el.style.height = `${window.innerHeight + shift}px`
  update()
}

onMounted(() => {
  setHeight()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', setHeight)
  document.fonts?.ready.then(setHeight)
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', setHeight)
})
</script>

<template>
  <section id="cases" ref="root" class="cases" data-section="cases">
    <div class="cases__pin">
      <div class="container cases__head">
        <div>
          <p class="kicker">{{ casesBlock.kicker }}</p>
          <h2 class="h-1">
            {{ casesBlock.titleStart }}<br />
            <em>{{ casesBlock.titleAccent }}</em>
          </h2>
        </div>
        <div class="cases__aside">
          <p class="sec__lead">{{ casesBlock.lead }}</p>
          <RouterLink :to="routes.cases" class="button button--outline">{{ casesBlock.all }}</RouterLink>
        </div>
      </div>

      <div class="cases__viewport">
        <div ref="track" class="cases__track">
          <RouterLink
            v-for="(item, index) in cases"
            :key="item.slug"
            :to="routes.case(item.slug)"
            class="case"
            data-spot
            data-cursor="Кейс"
          >
            <span class="case__top">
              <span class="mono case__num">{{ String(index + 1).padStart(2, '0') }} / {{ String(cases.length).padStart(2, '0') }}</span>
              <span class="mono case__niche">{{ item.nicheLabel }}</span>
            </span>
            <span class="case__metric">{{ item.preview.metric }}</span>
            <span class="case__result">{{ item.preview.result }}</span>
            <span class="case__title">{{ item.title }}</span>
            <span class="case__metrics">
              <span v-for="metric in item.metrics.slice(0, 3)" :key="metric.label" class="case__m">
                <b>{{ metric.value }}</b>
                <small>{{ metric.label }}</small>
              </span>
            </span>
            <span class="case__more mono">Читать кейс →</span>
          </RouterLink>
        </div>
      </div>

      <div class="container cases__progress" aria-hidden="true">
        <span />
      </div>
    </div>
  </section>
</template>
