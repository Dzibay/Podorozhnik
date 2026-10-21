<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо веб-сервиса: окно приложения собирается на глазах — меню, цифры
 * досчитываются, растёт график, появляются строки таблицы и уведомление.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const stage = ref(0) // 1 — каркас, 2 — цифры, 3 — график, 4 — таблица
const navActive = ref(-1)
const count = ref(0) // доля досчитанных цифр, 0..1
const rows = ref(0)
const toast = ref(false)

const fmt = new Intl.NumberFormat('ru-RU')
function kpiValue(kpi) {
  return fmt.format(Math.round(kpi.value * count.value))
}

function build(scenario) {
  stage.value = 0
  navActive.value = -1
  count.value = 0
  rows.value = 0
  toast.value = false
  const t = timeline()
    .wait(300)
    .do(() => (stage.value = 1))
  scenario.nav.forEach((_, i) => t.wait(160).do(() => (navActive.value = i)))
  t.wait(200).do(() => {
    navActive.value = 0
    stage.value = 2
  })
  for (let i = 1; i <= 14; i++) t.wait(60).do(() => (count.value = (1 - (1 - i / 14) ** 3)))
  t.wait(200).do(() => (stage.value = 3))
  t.wait(900).do(() => (stage.value = 4))
  scenario.rows.forEach((_, i) => t.wait(380).do(() => (rows.value = i + 1)))
  t.wait(600).do(() => (toast.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4000, onEnd: () => emit('done') })
load(props.scenario)

const max = Math.max(...props.scenario.bars)
</script>

<template>
  <div ref="root" class="pd-demo pd-saas" :class="`is-stage-${stage}`" aria-hidden="true">
    <div class="pd-app">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.product }}</span>
      </div>
      <div class="pd-app__body">
        <nav class="pd-app__nav">
          <span class="pd-app__logo">{{ scenario.product.slice(0, 1) }}</span>
          <span v-for="(item, i) in scenario.nav" :key="item" :class="{ 'is-active': i === navActive }">{{ item }}</span>
        </nav>
        <div class="pd-app__main">
          <div class="pd-kpis">
            <div v-for="kpi in scenario.kpis" :key="kpi.label" class="pd-kpi">
              <span>{{ kpi.label }}</span>
              <strong>{{ kpiValue(kpi) }}<small v-if="kpi.unit"> {{ kpi.unit }}</small></strong>
            </div>
          </div>
          <div class="pd-chart">
            <span
              v-for="(bar, i) in scenario.bars"
              :key="i"
              :style="{ '--h': `${(bar / max) * 100}%`, '--d': `${i * 45}ms` }"
            />
          </div>
          <div class="pd-table">
            <div v-for="(row, i) in scenario.rows" :key="i" class="pd-row" :class="{ 'is-in': i < rows }">
              <span>{{ row[0] }}</span>
              <span>{{ row[1] }}</span>
              <em :class="{ 'is-ok': i % 2 === 0 }">{{ row[2] }}</em>
            </div>
          </div>
        </div>
      </div>
      <Transition name="pd-pop">
        <div v-if="toast" class="pd-toast"><span class="pd-toast__dot" />{{ scenario.toast }}</div>
      </Transition>
    </div>
  </div>
</template>
