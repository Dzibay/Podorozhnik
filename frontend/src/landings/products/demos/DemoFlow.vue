<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо автоматизации: данные бегут по цепочке систем, каждая загорается
 * и пишет строку в журнал, в конце — итог без ручной работы.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const current = ref(-1)
const logs = ref([])
const result = ref(false)

function build(scenario) {
  current.value = -1
  logs.value = []
  result.value = false
  const t = timeline().wait(400)
  scenario.nodes.forEach((node, i) => {
    t.do(() => (current.value = i))
      .wait(450)
      .do(() => logs.value.push({ time: `09:41:${String(12 + i * 3).padStart(2, '0')}`, ...node }))
      .wait(650)
  })
  t.wait(200).do(() => (result.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4000, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-flow" aria-hidden="true">
    <div class="pd-flow__chain" :style="{ '--n': scenario.nodes.length, '--p': Math.max(current, 0) }">
      <span class="pd-flow__wire"><span class="pd-flow__fill" /></span>
      <span v-if="current >= 0" class="pd-flow__packet" />
      <div
        v-for="(node, i) in scenario.nodes"
        :key="node.title"
        class="pd-node"
        :class="{ 'is-done': i < current || result, 'is-active': i === current && !result }"
      >
        <span class="pd-node__dot">{{ i + 1 }}</span>
        <span class="pd-node__title">{{ node.title }}</span>
      </div>
    </div>

    <div class="pd-log">
      <span class="pd-log__head">Журнал</span>
      <TransitionGroup name="pd-msg" tag="ul">
        <li v-for="line in logs" :key="line.title">
          <time>{{ line.time }}</time>
          <b>{{ line.title }}</b>
          <span>{{ line.log }}</span>
        </li>
      </TransitionGroup>
    </div>

    <Transition name="pd-pop">
      <div v-if="result" class="pd-result">
        <span class="pd-result__check">✓</span>
        {{ scenario.result }}
      </div>
    </Transition>
  </div>
</template>
