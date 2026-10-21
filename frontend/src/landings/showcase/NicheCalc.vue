<script setup>
import { computed, reactive, watch } from 'vue'
import { contacts } from '../../data/site'
import { estimateNote } from '../../data/nicheShowcase'
import { track } from '../../analytics/tracker'

/**
 * Калькулятор потерь: заявки × конверсия × чек, и доля заявок, которая
 * утекает через отмеченные «дыры». Дыры независимы, поэтому складываются
 * как вероятности: 1 − Π(1 − доля).
 */
const props = defineProps({
  calc: { type: Object, required: true },
  slug: { type: String, required: true },
})

const state = reactive({ leads: 0, check: 0, close: 0, on: [] })

function reset() {
  state.leads = props.calc.leads.value
  state.check = props.calc.check.value
  state.close = props.calc.close.value
  state.on = props.calc.leaks.map((l) => l.on)
}
watch(() => props.calc, reset, { immediate: true })

const share = computed(() => 1 - props.calc.leaks.reduce((k, l, i) => (state.on[i] ? k * (1 - l.share) : k), 1))
const lostLeads = computed(() => Math.round(state.leads * share.value))
const lostDeals = computed(() => Math.round(state.leads * share.value * (state.close / 100) * 12))
const lostMoney = computed(() => state.leads * share.value * (state.close / 100) * state.check * 12)

const num = new Intl.NumberFormat('ru-RU')
function money(value) {
  if (value >= 1e6) return `${num.format(Math.round(value / 1e5) / 10)} млн ₽`
  if (value >= 1e3) return `${num.format(Math.round(value / 1e3))} тыс ₽`
  return `${num.format(Math.round(value))} ₽`
}

function onCall() {
  track('click_phone', { place: 'landing-calc', niche: props.slug, loss: Math.round(lostMoney.value) })
}
</script>

<template>
  <section class="lp-section ns-calc" id="lp-calc">
    <div class="lp-wrap">
      <p class="lp-kicker">Калькулятор потерь</p>
      <div class="lp-section__head">
        <h2>{{ calc.title }}</h2>
        <p class="lp-lead">{{ calc.lead }}</p>
      </div>

      <div class="ns-calc__grid">
        <div class="ns-calc__inputs">
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Заявок в месяц</span>
              <output>{{ num.format(state.leads) }}</output>
            </span>
            <input v-model.number="state.leads" type="range" :min="calc.leads.min" :max="calc.leads.max" :step="calc.leads.step" />
          </label>
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Средний чек</span>
              <output>{{ money(state.check) }}</output>
            </span>
            <input v-model.number="state.check" type="range" :min="calc.check.min" :max="calc.check.max" :step="calc.check.step" />
          </label>
          <label class="ns-range">
            <span class="ns-range__head">
              <span>Из заявки в договор</span>
              <output>{{ state.close }}%</output>
            </span>
            <input v-model.number="state.close" type="range" :min="calc.close.min" :max="calc.close.max" step="1" />
          </label>

          <fieldset class="ns-leaks">
            <legend>Что про вас</legend>
            <label v-for="(leak, i) in calc.leaks" :key="leak.label" class="ns-leak" :class="{ 'is-on': state.on[i] }">
              <input v-model="state.on[i]" type="checkbox" />
              <span class="ns-leak__box" aria-hidden="true" />
              <span class="ns-leak__text">
                <strong>{{ leak.label }}</strong>
                <span>{{ leak.hint }}</span>
              </span>
              <span class="ns-leak__share">−{{ Math.round(leak.share * 100) }}%</span>
            </label>
          </fieldset>
        </div>

        <div class="ns-calc__result" aria-live="polite">
          <p class="ns-calc__label">Уходит к конкурентам за год</p>
          <p class="ns-calc__money">{{ share ? `≈ ${money(lostMoney)}` : '0 ₽' }}</p>
          <dl class="ns-calc__facts">
            <div>
              <dt>{{ num.format(lostLeads) }}</dt>
              <dd>заявок в месяц теряются по дороге</dd>
            </div>
            <div>
              <dt>{{ num.format(lostDeals) }}</dt>
              <dd>договоров в год недополучаете</dd>
            </div>
          </dl>
          <p v-if="!share" class="ns-calc__ok">Отметьте хотя бы один пункт слева — или позвоните, проверим, правда ли дыр нет.</p>
          <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall">
            <span class="live-dot" aria-hidden="true" />
            Разобрать мои цифры
          </a>
          <p class="ns-note">{{ estimateNote }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
