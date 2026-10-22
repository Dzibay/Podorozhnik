<script setup>
import { computed, ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо стратегии: бюджет квартала раскладывается по каналам и месяцам,
 * над столбиками — ожидаемые заявки, рядом — приоритеты по порядку.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const grown = ref(0) // сколько месяцев выросло
const steps = ref(0)
const done = ref(false)

const totals = computed(() => props.scenario.months.map((_, m) => props.scenario.channels.reduce((s, c) => s + c.budget[m], 0)))
const max = computed(() => Math.max(...totals.value))
const fmt = new Intl.NumberFormat('ru-RU')

function build(scenario) {
  grown.value = 0
  steps.value = 0
  done.value = false
  const t = timeline().wait(500)
  scenario.months.forEach((_, i) => t.wait(700).do(() => (grown.value = i + 1)))
  scenario.steps.forEach((_, i) => t.wait(600).do(() => (steps.value = i + 1)))
  t.wait(700).do(() => (done.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4500, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-plan" aria-hidden="true">
    <div class="pd-app pd-plan__win">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.title }}</span>
      </div>
      <div class="pd-plan__body">
        <div class="pd-plan__chart">
          <div v-for="(month, m) in scenario.months" :key="month" class="pd-plan__col" :class="{ 'is-on': m < grown }">
            <span class="pd-plan__leads">{{ scenario.leads[m] }}</span>
            <span class="pd-plan__stack" :style="{ '--h': `${(totals[m] / max) * 100}%` }">
              <i
                v-for="(ch, c) in scenario.channels"
                :key="ch.name"
                :style="{ flexGrow: ch.budget[m], '--c': `var(--pd-c${c})` }"
              />
            </span>
            <span class="pd-plan__month">{{ month }}</span>
            <span class="pd-plan__sum">{{ fmt.format(Math.round(totals[m] / 1000)) }} тыс ₽</span>
          </div>
        </div>
        <ul class="pd-plan__legend">
          <li v-for="(ch, c) in scenario.channels" :key="ch.name"><i :style="{ '--c': `var(--pd-c${c})` }" />{{ ch.name }}</li>
        </ul>
        <ol class="pd-plan__steps">
          <li v-for="(step, i) in scenario.steps" :key="step" :class="{ 'is-in': i < steps }">
            <span>{{ i + 1 }}</span>{{ step }}
          </li>
        </ol>
      </div>
    </div>
    <Transition name="pd-pop">
      <div v-if="done" class="pd-toast"><span class="pd-toast__dot" />{{ scenario.result }}</div>
    </Transition>
  </div>
</template>
