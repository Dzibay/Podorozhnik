<script setup>
import { computed, ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо поиска: запрос набирается в строке, появляется выдача.
 * ads — наше объявление сверху, клик и заявка менеджеру;
 * seo — месяц за месяцем сайт поднимается в выдаче, растёт трафик.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const typed = ref('')
const shown = ref(false)
const month = ref(-1)
const clicked = ref(false)
const lead = ref(false)
const stats = ref(0)

const ours = computed(() => props.scenario.results.find((r) => r.ours))
const others = computed(() => props.scenario.results.filter((r) => !r.ours))
const pos = computed(() => (month.value >= 0 ? props.scenario.months[month.value].pos : props.scenario.months?.[0]?.pos))

// в выдаче всегда четыре строки: наш сайт на своём месте или последним с номером позиции
const rows = computed(() => {
  if (props.scenario.mode === 'ads') return props.scenario.results
  const p = pos.value
  const list = others.value.slice(0, 3)
  if (p <= 4) list.splice(p - 1, 0, ours.value)
  else list.push(ours.value)
  return list
})

function build(scenario) {
  typed.value = ''
  shown.value = false
  month.value = -1
  clicked.value = false
  lead.value = false
  stats.value = 0
  const t = timeline().wait(400)
  for (let i = 1; i <= scenario.query.length; i++) t.wait(45).do(() => (typed.value = scenario.query.slice(0, i)))
  t.wait(350).do(() => (shown.value = true))
  if (scenario.mode === 'ads') {
    t.wait(1100).do(() => (clicked.value = true))
    t.wait(700).do(() => (lead.value = true))
    t.wait(500).do(() => (stats.value = 1))
  } else {
    t.wait(500).do(() => (month.value = 0))
    scenario.months.slice(1).forEach((_, i) => t.wait(900).do(() => (month.value = i + 1)))
    t.wait(500).do(() => (lead.value = true))
  }
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4000, onEnd: () => emit('done') })
load(props.scenario)

const maxVisits = computed(() => Math.max(...(props.scenario.months || [{ visits: 1 }]).map((m) => m.visits)))
</script>

<template>
  <div ref="root" class="pd-demo pd-search" aria-hidden="true">
    <div class="pd-app">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>ya.ru</span>
      </div>
      <div class="pd-search__body">
        <div class="pd-search__box">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span>{{ typed }}<i class="pd-search__caret" /></span>
        </div>

        <div v-if="scenario.mode === 'seo'" class="pd-search__month" :class="{ 'is-on': month >= 0 }">
          <span>{{ month >= 0 ? scenario.months[month].label : 'Старт' }}</span>
          <span>Позиция <b>{{ pos }}</b></span>
        </div>

        <TransitionGroup v-if="shown" name="pd-serp" tag="ol" class="pd-serp">
          <li
            v-for="(row, i) in rows"
            :key="row.url"
            class="pd-serp__item"
            :class="{ 'is-ours': row.ours, 'is-clicked': row.ours && clicked, 'is-far': row.ours && pos > 4 }"
            :style="{ '--d': `${i * 90}ms` }"
          >
            <span class="pd-serp__url">
              <em v-if="row.ad">Реклама</em>
              <b v-if="row.ours && scenario.mode === 'seo' && pos > 4">#{{ pos }}</b>
              {{ row.url }}
            </span>
            <strong>{{ row.title }}</strong>
            <span class="pd-serp__text">{{ row.text }}</span>
          </li>
        </TransitionGroup>

        <div v-if="scenario.mode === 'seo'" class="pd-visits">
          <span class="pd-visits__head">Переходы из поиска в месяц</span>
          <div class="pd-visits__bars">
            <span
              v-for="(m, i) in scenario.months"
              :key="m.label"
              :class="{ 'is-on': i <= month }"
              :style="{ '--h': `${(m.visits / maxVisits) * 100}%` }"
            ><b v-if="i === month">{{ m.visits }}</b></span>
          </div>
        </div>

        <dl v-else class="pd-search__stats" :class="{ 'is-on': stats }">
          <div v-for="item in scenario.stats" :key="item.label">
            <dt>{{ item.value }}</dt>
            <dd>{{ item.label }}</dd>
          </div>
        </dl>
      </div>
      <Transition name="pd-pop">
        <div v-if="lead" class="pd-toast"><span class="pd-toast__dot" />{{ scenario.toast }}</div>
      </Transition>
    </div>
  </div>
</template>
