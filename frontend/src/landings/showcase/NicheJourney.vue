<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { calmMotion, useScrollProgress } from '../../components/cases/useScrollProgress'

/**
 * Путь клиента ниши: строка поиска печатает запрос, а линия маршрута
 * дорисовывается по мере прокрутки и зажигает шаги. Без закрепления секции.
 */
const props = defineProps({
  journey: { type: Object, required: true },
})

const root = ref(null)
const list = ref(null)
const progress = useScrollProgress(list)
const draw = computed(() => Math.min(1, Math.max(0, (progress.value - 0.18) / 0.5)))
const isLit = (i) => draw.value >= i / Math.max(1, props.journey.steps.length - 1) - 0.01

// запрос печатается, когда поиск показался на экране
const typed = ref('')
let timer = 0
let observer = null
function type() {
  const text = props.journey.query
  let i = 0
  const step = () => {
    typed.value = text.slice(0, ++i)
    if (i < text.length) timer = setTimeout(step, 45 + Math.random() * 50)
  }
  step()
}
onMounted(() => {
  if (calmMotion() || typeof IntersectionObserver === 'undefined') {
    typed.value = props.journey.query
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    type()
  })
  observer.observe(root.value)
})
onUnmounted(() => {
  clearTimeout(timer)
  observer?.disconnect()
})
</script>

<template>
  <section class="lp-section ns-journey" id="lp-journey">
    <div class="lp-wrap">
      <p class="lp-kicker">Путь клиента</p>
      <div class="lp-section__head">
        <h2>{{ journey.title }}</h2>
        <p class="lp-lead">{{ journey.lead }}</p>
      </div>

      <div ref="root" class="ns-search" aria-hidden="true">
        <span class="ns-search__brand">Я</span>
        <span class="ns-search__query">{{ typed }}<span class="ns-search__caret" /></span>
        <span class="ns-search__btn">Найти</span>
      </div>

      <ol ref="list" class="ns-path" :style="{ '--draw': draw }">
        <li v-for="(step, i) in journey.steps" :key="step.stage" class="ns-path__step" :class="{ 'is-lit': isLit(i) }">
          <span class="ns-path__dot" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="ns-path__body">
            <p class="ns-path__stage">{{ step.stage }}</p>
            <h3>{{ step.title }}</h3>
            <div class="ns-path__cols">
              <p class="ns-path__leak"><span>Где теряем</span>{{ step.leak }}</p>
              <p class="ns-path__fix"><span>Что делаем</span>{{ step.fix }}</p>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
