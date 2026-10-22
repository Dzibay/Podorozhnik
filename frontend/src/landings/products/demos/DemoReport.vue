<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо сквозной аналитики: подключаются источники данных, таблица каналов
 * заполняется от расхода до выручки, лучшие и убыточные строки подсвечиваются.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const linked = ref(0)
const filled = ref(0) // сколько колонок заполнено: 1 — расход … 4 — выручка
const marked = ref(false)
const done = ref(false)

const fmt = new Intl.NumberFormat('ru-RU')
function rub(v) {
  if (v >= 1e6) return `${fmt.format(Math.round(v / 1e5) / 10)} млн`
  if (v >= 1e3) return `${fmt.format(Math.round(v / 1e3))} тыс`
  return fmt.format(v)
}
function romi(row) {
  return Math.round(((row.revenue - row.spend) / row.spend) * 100)
}

function build(scenario) {
  linked.value = 0
  filled.value = 0
  marked.value = false
  done.value = false
  const t = timeline().wait(400)
  scenario.sources.forEach((_, i) => t.wait(380).do(() => (linked.value = i + 1)))
  for (let c = 1; c <= 5; c++) t.wait(520).do(() => (filled.value = c))
  t.wait(700).do(() => (marked.value = true))
  t.wait(1300).do(() => (done.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4500, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-report" aria-hidden="true">
    <div class="pd-report__sources">
      <span v-for="(src, i) in scenario.sources" :key="src" :class="{ 'is-on': i < linked }">
        <i />{{ src }}
      </span>
    </div>

    <div class="pd-app pd-report__win">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.title }}</span>
      </div>
      <div class="pd-report__table">
        <div class="pd-report__row pd-report__row--head">
          <span>Канал</span><span>Расход</span><span>Заявки</span><span>Сделки</span><span>Выручка</span><span>ROMI</span>
        </div>
        <div
          v-for="(row, i) in scenario.rows"
          :key="row.channel"
          class="pd-report__row"
          :class="{ [`is-${row.tone}`]: marked && row.tone }"
          :style="{ '--d': `${i * 70}ms` }"
        >
          <span>{{ row.channel }}</span>
          <span :class="{ 'is-in': filled >= 1 }">{{ rub(row.spend) }}</span>
          <span :class="{ 'is-in': filled >= 2 }">{{ row.leads }}</span>
          <span :class="{ 'is-in': filled >= 3 }">{{ row.deals }}</span>
          <span :class="{ 'is-in': filled >= 4 }">{{ rub(row.revenue) }}</span>
          <b :class="{ 'is-in': filled >= 5 }">{{ romi(row) }}%</b>
        </div>
      </div>
      <TransitionGroup name="pd-msg" tag="ul" class="pd-report__notes">
        <template v-if="marked">
          <li v-for="note in scenario.notes" :key="note.text" :class="`is-${note.tone}`">{{ note.text }}</li>
        </template>
      </TransitionGroup>
    </div>

    <Transition name="pd-pop">
      <div v-if="done" class="pd-result"><span class="pd-result__check">✓</span>{{ scenario.result }}</div>
    </Transition>
  </div>
</template>
