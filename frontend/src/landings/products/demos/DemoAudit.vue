<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо проверки: пункты чек-листа проверяются по очереди, у каждого —
 * статус и короткий вывод, в конце — итог (деньги или время).
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const checked = ref(0)
const current = ref(-1)
const total = ref(false)

function build(scenario) {
  checked.value = 0
  current.value = -1
  total.value = false
  const t = timeline().wait(400)
  scenario.items.forEach((_, i) => {
    t.do(() => (current.value = i))
      .wait(650)
      .do(() => (checked.value = i + 1))
      .wait(250)
  })
  t.wait(300).do(() => {
    current.value = -1
    total.value = true
  })
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4500, onEnd: () => emit('done') })
load(props.scenario)

const marks = { ok: '✓', warn: '!', bad: '×' }
</script>

<template>
  <div ref="root" class="pd-demo pd-audit" aria-hidden="true">
    <div class="pd-app pd-audit__win">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.target }}</span>
      </div>
      <div class="pd-audit__progress">
        <span>{{ scenario.head }}</span>
        <b>{{ checked }} / {{ scenario.items.length }}</b>
        <i :style="{ '--p': checked / scenario.items.length }" />
      </div>
      <ul class="pd-audit__list">
        <li
          v-for="(item, i) in scenario.items"
          :key="item.label"
          class="pd-check"
          :class="{ [`is-${item.status}`]: i < checked, 'is-active': i === current }"
        >
          <span class="pd-check__mark">{{ i < checked ? marks[item.status] : '' }}</span>
          <span class="pd-check__text">
            <strong>{{ item.label }}</strong>
            <span>{{ i < checked ? item.note : i === current ? 'Проверяем…' : '' }}</span>
          </span>
        </li>
      </ul>
    </div>
    <Transition name="pd-pop">
      <div v-if="total" class="pd-audit__total">
        <span>{{ scenario.total.label }}</span>
        <strong>{{ scenario.total.value }}</strong>
        <em>{{ scenario.total.note }}</em>
      </div>
    </Transition>
  </div>
</template>
