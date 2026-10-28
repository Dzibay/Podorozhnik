<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'
import { track } from '../../analytics/tracker'
import { workStatus } from '../../utils/workHours'
import HeroShader from './HeroShader.vue'

const { hero } = homeCopy
const rows = [['П', 'О', 'Д', 'О'], ['Р', 'О', 'Ж', 'Н', 'И', 'К']]

// в готовом HTML — «на связи»; в нерабочее время после загрузки честно пишем, когда перезвоним
const status = ref(hero.status)
const offline = ref(false)
const wordmark = ref(null)
const tickerIndex = ref(0)
let tickerTimer = 0
let frame = 0
let letters = []
const pointer = { x: -9999, y: -9999 }

/** Буквы рядом с курсором становятся тоньше — логотип «дышит» под рукой */
function animate() {
  for (const item of letters) {
    const rect = item.el.getBoundingClientRect()
    const dx = pointer.x - (rect.left + rect.width / 2)
    const dy = pointer.y - (rect.top + rect.height / 2)
    const near = Math.max(0, 1 - Math.hypot(dx, dy) / 420)
    const target = 820 - near * near * 560
    item.w += (target - item.w) * 0.12
    item.el.style.fontVariationSettings = `"wght" ${item.w.toFixed(0)}`
  }
  frame = requestAnimationFrame(animate)
}

function onPointer(event) {
  pointer.x = event.clientX
  pointer.y = event.clientY
}

function onLeave() {
  pointer.x = -9999
  pointer.y = -9999
}

function onCall() {
  track('click_phone', { place: 'hero' })
}

onMounted(() => {
  const now = workStatus()
  if (!now.online) {
    offline.value = true
    status.value = `Сейчас не в офисе — перезвоним ${now.back}`
  }

  tickerTimer = window.setInterval(() => {
    tickerIndex.value = (tickerIndex.value + 1) % hero.ticker.length
  }, 2200)

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced) return
  letters = [...wordmark.value.querySelectorAll('.hero__char')].map((el) => ({ el, w: 820 }))
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  frame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.clearInterval(tickerTimer)
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', onPointer)
  document.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <section id="hero" class="hero" data-section="hero" aria-label="Подорожник">
    <HeroShader />

    <div class="hero__inner container">
      <div class="hero__top">
        <p class="kicker hero__in" style="--d: 0.1s">{{ hero.kicker }}</p>
        <p class="hero__status mono hero__in" :class="{ 'hero__status--off': offline }" style="--d: 0.2s">
          <span class="live-dot" aria-hidden="true" />
          {{ status }}
        </p>
      </div>

      <h1 ref="wordmark" class="hero__wordmark">
        <!-- текст заголовка для поисковиков и экранных дикторов; буквы ниже рисует CSS из data-char,
             чтобы «П О Д О…» не попадало в текст заголовка -->
        <span class="visually-hidden">Подорожник — внешний отдел маркетинга и IT </span>
        <span v-for="(row, r) in rows" :key="r" class="hero__row" :class="`hero__row--${r}`" aria-hidden="true">
          <span
            v-for="(char, c) in row"
            :key="c"
            class="hero__char"
            :data-char="char"
            :style="{ '--c': r * 4 + c }"
          />
        </span>
      </h1>

      <div class="hero__bottom">
        <p class="hero__lead hero__in" style="--d: 0.75s">{{ hero.lead }}</p>

        <p class="hero__ticker hero__in" style="--d: 0.85s">
          <span class="mono">{{ hero.tickerPrefix }}</span>
          <span class="hero__ticker-window">
            <Transition name="tick" mode="out-in">
              <span :key="tickerIndex" class="hero__ticker-word">{{ hero.ticker[tickerIndex] }}</span>
            </Transition>
          </span>
        </p>

        <div class="hero__cta hero__in" style="--d: 0.95s">
          <a
            v-magnetic="0.25"
            class="button button--lg hero__call"
            :href="contacts.phoneTel"
            data-cursor="Звоним"
            @click="onCall"
          >
            <span class="live-dot" aria-hidden="true" />
            {{ hero.primary }}
            <span class="hero__call-num">{{ contacts.phoneDisplay }}</span>
          </a>
          <a v-magnetic="0.2" class="button button--outline button--lg" href="#cta">
            {{ hero.secondary }}
          </a>
        </div>
      </div>
    </div>

    <a class="hero__scroll mono" href="#niches" aria-label="К следующему разделу">
      <span class="hero__scroll-line" aria-hidden="true" />
      {{ hero.scroll }}
    </a>
  </section>
</template>
