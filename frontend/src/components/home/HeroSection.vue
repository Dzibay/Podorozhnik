<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { hero } = homeCopy

const containerRef = ref(null)
const wordRef = ref(null)

let fitObserver = null

function fitHeroWord() {
  const container = containerRef.value
  const word = wordRef.value
  if (!container || !word) return

  const maxW = container.clientWidth
  if (maxW <= 0) return

  word.style.removeProperty('font-size')
  word.style.display = 'inline-block'
  word.style.width = 'auto'
  word.style.maxWidth = 'none'

  let lo = 24
  let hi = 320
  let best = lo

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    word.style.fontSize = `${mid}px`
    if (word.scrollWidth <= maxW) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  word.style.removeProperty('display')
  word.style.removeProperty('width')
  word.style.removeProperty('max-width')
  word.style.removeProperty('font-size')
  container.style.setProperty('--hero-fit-size', `${best}px`)
}

onMounted(async () => {
  if (document.fonts?.ready) await document.fonts.ready
  fitHeroWord()
  requestAnimationFrame(fitHeroWord)
  fitObserver = new ResizeObserver(fitHeroWord)
  if (containerRef.value) fitObserver.observe(containerRef.value)
  window.addEventListener('resize', fitHeroWord, { passive: true })
})

onUnmounted(() => {
  fitObserver?.disconnect()
  window.removeEventListener('resize', fitHeroWord)
})
</script>

<template>
  <section id="hero" class="hero" data-section="hero">
    <div ref="containerRef" class="container hero__content">
      <div class="hero__stage">
        <h1 ref="wordRef" class="hero__word">{{ hero.brandWord }}</h1>
      </div>

      <div class="hero__copy">
        <p class="hero__lead">
          От идеи до реализации<br />
          и продаж
        </p>
        <div class="hero__cta-wrap" data-blob="heart">
          <AppButton
            :href="routes.contacts"
            variant="outline"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            {{ hero.cta }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
