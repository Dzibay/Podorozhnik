<script setup>
import { computed, reactive, watch } from 'vue'
import { contacts } from '../../data/site'
import { productEstimateNote } from '../../data/products'
import { track } from '../../analytics/tracker'

/**
 * Калькулятор рутины: люди × часы в неделю × доля, которую снимает
 * автоматизация. Задачи независимы, доли складываются как вероятности:
 * 1 − Π(1 − доля). Деньги — освобождённые часы × стоимость часа.
 */
const props = defineProps({
  calc: { type: Object, required: true },
  slug: { type: String, required: true },
})

const state = reactive({ people: 0, hours: 0, rate: 0, on: [] })

function reset() {
  state.people = props.calc.people.value
  state.hours = props.calc.hours.value
  state.rate = props.calc.rate.value
  state.on = props.calc.tasks.map((t) => t.on)
}
watch(() => props.calc, reset, { immediate: true })

const share = computed(() => 1 - props.calc.tasks.reduce((k, t, i) => (state.on[i] ? k * (1 - t.share) : k), 1))
const hoursYear = computed(() => Math.round(state.people * state.hours * 52 * share.value))
const money = computed(() => hoursYear.value * state.rate)
// рабочий месяц — 168 часов: сколько ставок освобождается
const fte = computed(() => hoursYear.value / (168 * 12))

const num = new Intl.NumberFormat('ru-RU')
function rub(value) {
  if (value >= 1e6) return `${num.format(Math.round(value / 1e5) / 10)} млн ₽`
  if (value >= 1e3) return `${num.format(Math.round(value / 1e3))} тыс ₽`
  return `${num.format(Math.round(value))} ₽`
}

function onCall() {
  track('click_phone', { place: 'product-calc', product: props.slug, saving: Math.round(money.value) })
}
</script>

<template>
  <section class="lp-section ns-calc" id="lp-calc">
    <div class="lp-wrap">
      <p class="lp-kicker">Калькулятор экономии</p>
      <div class="lp-section__head">
        <h2>{{ calc.title }}</h2>
        <p class="lp-lead">{{ calc.lead }}</p>
      </div>

      <div class="ns-calc__grid">
        <div class="ns-calc__inputs">
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Сотрудников на этих задачах</span>
              <output>{{ state.people }}</output>
            </span>
            <input v-model.number="state.people" type="range" :min="calc.people.min" :max="calc.people.max" step="1" />
          </label>
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Часов в неделю у каждого</span>
              <output>{{ state.hours }} ч</output>
            </span>
            <input v-model.number="state.hours" type="range" :min="calc.hours.min" :max="calc.hours.max" step="1" />
          </label>
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Стоимость часа сотрудника</span>
              <output>{{ num.format(state.rate) }} ₽</output>
            </span>
            <input v-model.number="state.rate" type="range" :min="calc.rate.min" :max="calc.rate.max" :step="calc.rate.step" />
          </label>

          <fieldset class="ns-leaks">
            <legend>Что про вас</legend>
            <label v-for="(task, i) in calc.tasks" :key="task.label" class="ns-leak" :class="{ 'is-on': state.on[i] }">
              <input v-model="state.on[i]" type="checkbox" />
              <span class="ns-leak__box" aria-hidden="true" />
              <span class="ns-leak__text">
                <strong>{{ task.label }}</strong>
                <span>{{ task.hint }}</span>
              </span>
              <span class="ns-leak__share">−{{ Math.round(task.share * 100) }}%</span>
            </label>
          </fieldset>
        </div>

        <div class="ns-calc__result" aria-live="polite">
          <p class="ns-calc__label">Можно вернуть за год</p>
          <p class="ns-calc__money">{{ share ? `≈ ${rub(money)}` : '0 ₽' }}</p>
          <dl class="ns-calc__facts">
            <div>
              <dt>{{ num.format(hoursYear) }}</dt>
              <dd>часов рутины в год уходит на систему</dd>
            </div>
            <div>
              <dt>{{ fte.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) }}</dt>
              <dd>ставки освобождается под работу с клиентами</dd>
            </div>
          </dl>
          <p v-if="!share" class="ns-calc__ok">Отметьте хотя бы один пункт слева — или позвоните, разберём, где у вас уходит время.</p>
          <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall">
            <span class="live-dot" aria-hidden="true" />
            Разобрать мои процессы
          </a>
          <p class="ns-note">{{ productEstimateNote }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
