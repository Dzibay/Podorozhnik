<script setup>
import { computed, ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо воронки сделок: карточки появляются в «Новых» и едут по этапам,
 * под доской — лента событий (звонок, напоминание, документ).
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const where = ref({}) // id карточки → индекс колонки
const events = ref([])
const done = ref(false)

const byColumn = computed(() =>
  props.scenario.columns.map((_, c) => props.scenario.cards.filter((card) => where.value[card.id] === c)),
)

function build(scenario) {
  where.value = {}
  events.value = []
  done.value = false
  const t = timeline().wait(400)
  scenario.moves.forEach((move) => {
    t.do(() => {
      where.value = { ...where.value, [move.card]: move.to }
      if (move.event) events.value = [move.event, ...events.value].slice(0, 3)
    }).wait(move.pause || 800)
  })
  t.wait(200).do(() => (done.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4500, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-crm" aria-hidden="true">
    <div class="pd-app pd-crm__win">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.title }}</span>
      </div>
      <div class="pd-crm__board" :style="{ '--cols': scenario.columns.length }">
        <div v-for="(col, c) in scenario.columns" :key="col" class="pd-crm__col">
          <span class="pd-crm__head">{{ col }} <b>{{ byColumn[c].length }}</b></span>
          <TransitionGroup name="pd-msg" tag="div" class="pd-crm__cards">
            <div v-for="card in byColumn[c]" :key="card.id" class="pd-crm__card" :class="{ 'is-last': c === scenario.columns.length - 1 }">
              <strong>{{ card.name }}</strong>
              <span>{{ card.meta }}</span>
              <em v-if="card.sum">{{ card.sum }}</em>
            </div>
          </TransitionGroup>
        </div>
      </div>
      <TransitionGroup name="pd-msg" tag="ul" class="pd-crm__feed">
        <li v-for="ev in events" :key="ev.text">
          <span class="pd-crm__icon">{{ ev.icon }}</span>
          <span>{{ ev.text }}</span>
        </li>
      </TransitionGroup>
    </div>
    <Transition name="pd-pop">
      <div v-if="done" class="pd-toast"><span class="pd-toast__dot" />{{ scenario.result }}</div>
    </Transition>
  </div>
</template>
