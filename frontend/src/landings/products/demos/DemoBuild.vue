<script setup>
import { nextTick, ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо сборки сайта: страница складывается блок за блоком, сбоку —
 * журнал этапов и счётчик (конверсия, часы до запуска или число страниц).
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const page = ref(null)
const count = ref(0)
const value = ref(props.scenario.metric.from)
const done = ref(false)

const num = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

function build(scenario) {
  count.value = 0
  value.value = scenario.metric.from
  done.value = false
  if (page.value) page.value.scrollTop = 0
  const t = timeline().wait(500)
  scenario.blocks.forEach((block, i) => {
    t.do(() => {
      count.value = i + 1
      value.value = block.value
      // новые блоки уходят вниз окна — докручиваем, чтобы последний был виден
      nextTick(() => page.value?.scrollTo({ top: page.value.scrollHeight, behavior: 'smooth' }))
    }).wait(950)
  })
  t.wait(300).do(() => (done.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4500, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-build" aria-hidden="true">
    <div class="pd-app pd-build__win">
      <div class="pd-app__bar">
        <i /><i /><i />
        <span>{{ scenario.url }}</span>
      </div>
      <div ref="page" class="pd-build__page">
        <TransitionGroup name="pd-msg">
          <section
            v-for="block in scenario.blocks.slice(0, count)"
            :key="block.title"
            class="pd-blk"
            :class="`pd-blk--${block.kind}`"
          >
            <template v-if="block.kind === 'hero'">
              <strong>{{ block.title }}</strong>
              <span class="pd-sk" /><span class="pd-sk pd-sk--short" />
              <em class="pd-blk__btn">{{ block.cta }}</em>
            </template>
            <template v-else-if="block.kind === 'form'">
              <strong>{{ block.title }}</strong>
              <span class="pd-blk__input">Имя</span>
              <span class="pd-blk__input">Телефон</span>
              <em class="pd-blk__btn">{{ block.cta }}</em>
            </template>
            <template v-else-if="block.kind === 'price'">
              <strong>{{ block.title }}</strong>
              <span v-for="row in block.items" :key="row[0]" class="pd-blk__row">
                <span>{{ row[0] }}</span><b>{{ row[1] }}</b>
              </span>
            </template>
            <template v-else-if="block.kind === 'filters'">
              <strong>{{ block.title }}</strong>
              <span class="pd-blk__chips">
                <i v-for="(chip, i) in block.items" :key="chip" :class="{ 'is-on': i === 0 }">{{ chip }}</i>
              </span>
            </template>
            <template v-else>
              <strong>{{ block.title }}</strong>
              <span class="pd-blk__grid" :class="{ 'is-catalog': block.kind === 'catalog' }">
                <span v-for="item in block.items" :key="item" class="pd-blk__tile">
                  <i v-if="block.kind === 'catalog'" class="pd-blk__img" />
                  {{ item }}
                </span>
              </span>
            </template>
          </section>
        </TransitionGroup>
      </div>
    </div>

    <aside class="pd-build__side">
      <div class="pd-build__metric">
        <span>{{ scenario.metric.label }}</span>
        <strong>{{ num.format(value) }}<small> {{ scenario.metric.unit }}</small></strong>
      </div>
      <TransitionGroup name="pd-msg" tag="ul" class="pd-build__log">
        <li v-for="block in scenario.blocks.slice(0, count)" :key="block.title">
          <span class="pd-build__tick">✓</span>{{ block.note }}
        </li>
      </TransitionGroup>
    </aside>

    <Transition name="pd-pop">
      <div v-if="done" class="pd-toast"><span class="pd-toast__dot" />{{ scenario.result }}</div>
    </Transition>
  </div>
</template>
