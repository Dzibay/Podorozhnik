<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'

const { calculator: calc, pricing } = homeCopy
const selected = ref(new Set(calc.defaults))

/** Сколько ролей закрывает тариф: 1 → «Трафик», 2 → «Трафик + Сайт», 3–4 → «Под ключ», 5 → «IT-партнёр» */
function planFor(count) {
  if (count === 0) return null
  if (count === 1) return pricing.plans[0]
  if (count === 2) return pricing.plans[1]
  if (count <= 4) return pricing.plans[2]
  return pricing.plans[3]
}

const own = computed(() =>
  calc.roles.filter((role) => selected.value.has(role.id)).reduce((sum, role) => sum + role.salary, 0) * calc.taxFactor,
)
const plan = computed(() => planFor(selected.value.size))
const ours = computed(() => (plan.value ? Number(plan.value.price.replace(/\D/g, '')) : 0))
const saving = computed(() => Math.max(0, own.value - ours.value) * 12)
const ratio = computed(() => (own.value ? Math.max(0.06, ours.value / own.value) : 0))

function toggle(id) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

/** Плавная «прокрутка» чисел при каждом изменении */
const shown = ref({ own: own.value, ours: ours.value, saving: saving.value })
let frame = 0
watch([own, ours, saving], ([o, u, s]) => {
  cancelAnimationFrame(frame)
  const from = { ...shown.value }
  const startAt = performance.now()
  const tick = (now) => {
    const t = Math.min(1, (now - startAt) / 700)
    const e = 1 - Math.pow(1 - t, 3)
    shown.value = {
      own: from.own + (o - from.own) * e,
      ours: from.ours + (u - from.ours) * e,
      saving: from.saving + (s - from.saving) * e,
    }
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(frame))

const rub = (value) => `${Math.round(value / 1000).toLocaleString('ru-RU')} 000 ₽`.replace(/^0 000/, '0')
</script>

<template>
  <section id="calculator" class="sec calc" data-section="calculator">
    <div class="container">
      <header class="sec__head">
        <div>
          <p v-reveal class="kicker">{{ calc.kicker }}</p>
          <h2 v-reveal class="h-2">{{ calc.titleStart }} <em>{{ calc.titleAccent }}</em></h2>
        </div>
        <p v-reveal class="sec__lead">{{ calc.lead }}</p>
      </header>

      <div v-reveal class="calc__box">
        <fieldset class="calc__roles">
          <legend class="mono">Кого нанимаете в штат</legend>
          <button
            v-for="role in calc.roles"
            :key="role.id"
            type="button"
            class="calc__role"
            :class="{ 'is-on': selected.has(role.id) }"
            :aria-pressed="selected.has(role.id)"
            @click="toggle(role.id)"
          >
            <span class="calc__check" aria-hidden="true" />
            <span class="calc__role-name">{{ role.name }}</span>
            <span class="calc__role-sum mono">{{ (role.salary / 1000).toFixed(0) }} 000 ₽</span>
          </button>
        </fieldset>

        <div class="calc__result" aria-live="polite">
          <div class="calc__line">
            <p class="mono">{{ calc.ownLabel }}</p>
            <p class="calc__num calc__num--own">{{ rub(shown.own) }}</p>
            <span class="calc__bar"><span style="--w: 1" /></span>
            <p class="calc__note">{{ calc.ownNote }}</p>
          </div>

          <div class="calc__line">
            <p class="mono">
              {{ calc.ourLabel }}
              <span v-if="plan" class="calc__plan">тариф «{{ plan.name }}»</span>
            </p>
            <p class="calc__num calc__num--ours">от {{ rub(shown.ours) }}</p>
            <span class="calc__bar calc__bar--ours"><span :style="{ '--w': ratio }" /></span>
            <p class="calc__note">{{ calc.ourNote }}</p>
          </div>

          <div class="calc__saving">
            <p class="mono">{{ calc.savingLabel }}</p>
            <p class="calc__saving-num">{{ rub(shown.saving) }}</p>
            <a class="button button--brand" :href="contacts.phoneTel">
              <span class="live-dot" aria-hidden="true" />
              Обсудить по телефону
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
