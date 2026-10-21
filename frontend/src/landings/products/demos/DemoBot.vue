<script setup>
import { ref } from 'vue'
import { timeline, useDemoScript } from '../useDemoScript'

/**
 * Демо Телеграм-бота: переписка в телефоне — бот печатает, клиент жмёт кнопки,
 * в конце менеджеру приходит готовая карточка заявки.
 */
const props = defineProps({
  scenario: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const root = ref(null)
const messages = ref([])
const typing = ref(false)
const notify = ref(false)

function build(scenario) {
  messages.value = []
  typing.value = false
  notify.value = false
  const t = timeline().wait(500)
  scenario.chat.forEach((item, i) => {
    if (item.from === 'bot') {
      t.do(() => (typing.value = true))
        .wait(900)
        .do(() => {
          typing.value = false
          messages.value.push({ ...item, chosen: null })
        })
        .wait(item.buttons ? 900 : 700)
      return
    }
    // ответ клиента — нажатие кнопки предыдущего сообщения, если такая есть
    const prev = scenario.chat[i - 1]
    if (prev?.buttons?.includes(item.text)) {
      t.do(() => (messages.value.at(-1).chosen = item.text)).wait(380)
    }
    t.do(() => messages.value.push({ ...item })).wait(500)
  })
  t.wait(300).do(() => (notify.value = true))
  return t.steps
}

const { load } = useDemoScript(root, build, { hold: 4200, onEnd: () => emit('done') })
load(props.scenario)
</script>

<template>
  <div ref="root" class="pd-demo pd-bot" aria-hidden="true">
    <div class="pd-phone">
      <div class="pd-phone__bar">
        <span class="pd-phone__avatar">П</span>
        <span class="pd-phone__name">
          <strong>Помощник</strong>
          <small>{{ typing ? 'печатает…' : 'бот' }}</small>
        </span>
      </div>
      <div class="pd-chat">
        <div class="pd-chat__feed">
          <TransitionGroup name="pd-msg">
            <div v-for="(m, i) in messages" :key="i" class="pd-msg" :class="`pd-msg--${m.from}`">
              <p>{{ m.text }}</p>
              <div v-if="m.buttons" class="pd-msg__buttons">
                <span v-for="b in m.buttons" :key="b" :class="{ 'is-chosen': m.chosen === b }">{{ b }}</span>
              </div>
            </div>
          </TransitionGroup>
          <div v-if="typing" class="pd-msg pd-msg--bot pd-typing"><i /><i /><i /></div>
        </div>
      </div>
      <div class="pd-phone__input">Сообщение</div>
    </div>

    <Transition name="pd-pop">
      <div v-if="notify" class="pd-notify">
        <span class="pd-notify__from">Менеджеру · Телеграм</span>
        <strong>{{ scenario.notify.title }}</strong>
        <span v-for="line in scenario.notify.lines" :key="line">{{ line }}</span>
      </div>
    </Transition>
  </div>
</template>
