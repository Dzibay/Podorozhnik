<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо AI-ассистента: вопрос, поиск по базе знаний с подсветкой источников,
 * ответ печатается по словам, дальше — передача человеку готовой карточки.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const asked = ref(false)
const searching = ref(false)
const found = ref(0)
const words = ref(0)
const handoff = ref(false)

const answerWords = props.scenario.answer.split(' ')

function build(scenario) {
  asked.value = false
  searching.value = false
  found.value = 0
  words.value = 0
  handoff.value = false
  const t = timeline()
    .wait(400)
    .do(() => (asked.value = true))
    .wait(700)
    .do(() => (searching.value = true))
  scenario.sources.forEach((_, i) => t.wait(600).do(() => (found.value = i + 1)))
  t.wait(500).do(() => (searching.value = false))
  answerWords.forEach((_, i) => t.wait(55).do(() => (words.value = i + 1)))
  t.wait(700).do(() => (handoff.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4200, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-ai" aria-hidden="true">
    <div class="pd-ai__win">
      <div class="pd-ai__head">
        <span class="pd-ai__orb" :class="{ 'is-busy': searching }" />
        <strong>Ассистент</strong>
        <small>{{ searching ? 'ищу в базе знаний…' : 'на связи' }}</small>
      </div>

      <div class="pd-ai__feed">
        <Transition name="pd-msg">
          <div v-if="asked" class="pd-msg pd-msg--user"><p>{{ scenario.question }}</p></div>
        </Transition>

        <div class="pd-sources" :class="{ 'is-on': searching || found }">
          <span
            v-for="(src, i) in scenario.sources"
            :key="src"
            class="pd-source"
            :class="{ 'is-found': i < found }"
          >
            <i />{{ src }}
          </span>
        </div>

        <div v-if="words" class="pd-msg pd-msg--bot pd-ai__answer">
          <p>
            {{ answerWords.slice(0, words).join(' ') }}<span v-if="words < answerWords.length" class="pd-caret" />
          </p>
        </div>
      </div>
    </div>

    <Transition name="pd-pop">
      <div v-if="handoff" class="pd-notify pd-notify--ai">
        <span class="pd-notify__from">Передано сотруднику</span>
        <strong>{{ scenario.handoff.title }}</strong>
        <span v-for="line in scenario.handoff.lines" :key="line">{{ line }}</span>
      </div>
    </Transition>
  </div>
</template>
