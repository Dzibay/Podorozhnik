<script setup>
import { computed, ref } from 'vue'
import { perf } from '../../../utils/perf'
import { useScrollProgress } from '../useScrollProgress'

/**
 * Живой сайт: ноутбук и телефон с реальными скриншотами, которые сами
 * прокручиваются. Сцена «раскладывается» из наклона по мере прокрутки
 * и слегка поворачивается за курсором.
 *
 * В облегчённом режиме — только телефон без анимаций: экран листается пальцем,
 * а длинный скриншот разрезан на куски, чтобы телефон не держал в памяти одну огромную картинку.
 */
const props = defineProps({
  site: { type: Object, required: true },
  url: { type: String, default: '' },
})

const root = ref(null)
const stage = ref(null)
const progress = useScrollProgress(root)
const unfold = computed(() => Math.min(1, progress.value / 0.42))

/* соотношение сторон скриншота: высота / ширина */
const desktopRatio = computed(() => props.site.desktop.h / props.site.desktop.w)
const mobileRatio = computed(() => props.site.mobile.h / props.site.mobile.w)

const TILE = 1800
const tiles = computed(() => {
  const { src, w, h, tiles: count } = props.site.mobile
  if (!count) return [{ src, w, h }]
  return Array.from({ length: count }, (_, i) => ({
    src: src.replace('-mobile.webp', `-m${i}.webp`),
    w,
    h: Math.min(TILE, h - i * TILE),
  }))
})

const tilt = ref({ x: 0, y: 0 })
function onMove(event) {
  const rect = stage.value.getBoundingClientRect()
  tilt.value = {
    x: (event.clientX - rect.left) / rect.width - 0.5,
    y: (event.clientY - rect.top) / rect.height - 0.5,
  }
}
function onLeave() {
  tilt.value = { x: 0, y: 0 }
}
</script>

<template>
  <section ref="root" class="cp-sec cp-site">
    <div class="container">
      <div class="cp-site__head">
        <div>
          <p v-reveal class="kicker">Живой сайт</p>
          <h2 v-reveal class="cp-h2">
            {{ site.title[0] }}<br />
            <span class="cp-accent">{{ site.title[1] }}</span>
          </h2>
        </div>
        <div v-reveal class="cp-site__side">
          <p class="cp-text">{{ site.text }}</p>
          <a v-if="url" class="cp-site__link mono" :href="url" target="_blank" rel="noopener noreferrer" data-cursor="Открыть">
            <span class="live-dot" aria-hidden="true" />
            {{ site.label }} ↗
          </a>
        </div>
      </div>

      <div v-if="perf.lite" class="cp-site__solo">
        <div class="cp-phone cp-phone--solo">
          <div class="cp-phone__view cp-phone__scroll" tabindex="0" :aria-label="`Сайт ${site.label} — мобильная версия, можно листать`">
            <img
              v-for="(tile, i) in tiles"
              :key="tile.src"
              :src="tile.src"
              :width="tile.w"
              :height="tile.h"
              :alt="i === 0 ? `Сайт ${site.label} — мобильная версия` : ''"
              :loading="i < 2 ? 'eager' : 'lazy'"
              decoding="async"
            />
          </div>
          <span class="cp-phone__notch" aria-hidden="true" />
        </div>
        <p class="cp-site__hint mono">↕ Листайте экран телефона</p>
      </div>

      <div
        v-else
        ref="stage"
        class="cp-site__stage"
        :style="{ '--u': unfold.toFixed(3), '--tx': tilt.x.toFixed(3), '--ty': tilt.y.toFixed(3) }"
        @pointermove="onMove"
        @pointerleave="onLeave"
      >
        <div class="cp-site__glow" aria-hidden="true" />
        <div class="cp-site__rig">
          <div class="cp-laptop">
            <div class="cp-laptop__screen">
              <div class="cp-laptop__bar">
                <i /><i /><i />
                <span class="cp-laptop__url mono">{{ site.label }}</span>
              </div>
              <div class="cp-laptop__view" :style="{ '--ratio': desktopRatio, '--view': 0.625 }">
                <img
                  class="cp-shot"
                  :src="site.desktop.src"
                  :width="site.desktop.w"
                  :height="site.desktop.h"
                  :alt="`Сайт ${site.label} — версия для компьютера`"
                  loading="lazy"
                  decoding="async"
                  :style="{ animationDuration: `${Math.round(desktopRatio * 7)}s` }"
                />
              </div>
            </div>
            <div class="cp-laptop__base" />
          </div>

          <div class="cp-phone">
            <div class="cp-phone__view" :style="{ '--ratio': mobileRatio, '--view': 2.05 }">
              <img
                class="cp-shot"
                :src="site.mobile.src"
                :width="site.mobile.w"
                :height="site.mobile.h"
                :alt="`Сайт ${site.label} — мобильная версия`"
                loading="lazy"
                decoding="async"
                :style="{ animationDuration: `${Math.round(mobileRatio * 4)}s` }"
              />
            </div>
            <span class="cp-phone__notch" aria-hidden="true" />
          </div>

          <span v-for="(chip, i) in site.chips" :key="chip" class="cp-site__chip mono" :class="`cp-site__chip--${i}`">
            {{ chip }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
