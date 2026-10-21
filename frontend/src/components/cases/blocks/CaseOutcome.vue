<script setup>
import { computed } from 'vue'

/** Итоговая инфографика: «было» приглушённой полосой, «стало» — акцентной, справа разница */
const props = defineProps({
  outcome: { type: Object, required: true },
})

const numberFormat = new Intl.NumberFormat('ru-RU')
const fmt = (value, suffix = '') => `${numberFormat.format(value)}${suffix}`

function delta(row) {
  const { before, after, less } = row
  if (!before) return 'с нуля'
  if (less) {
    const ratio = before / Math.max(after, 0.0001)
    return ratio >= 2 ? `÷${Math.round(ratio * 10) / 10}` : `−${Math.round((1 - after / before) * 100)}%`
  }
  const ratio = after / before
  return ratio >= 2 ? `×${Math.round(ratio * 10) / 10}` : `+${Math.round((ratio - 1) * 100)}%`
}

const rows = computed(() =>
  props.outcome.rows.map((row) => {
    const max = Math.max(row.before, row.after) || 1
    return {
      ...row,
      b: row.before / max,
      a: row.after / max,
      delta: delta(row).replace('.', ','),
    }
  }),
)
</script>

<template>
  <section class="cp-sec cp-out">
    <div class="container cp-out__grid">
      <div class="cp-out__aside">
        <p v-reveal class="kicker">Итог в цифрах</p>
        <h2 v-reveal class="cp-h2">{{ outcome.title }}</h2>
        <p v-if="outcome.note" v-reveal class="cp-text">{{ outcome.note }}</p>
        <p v-reveal class="cp-out__legend mono">
          <span><i class="cp-out__sw cp-out__sw--before" />Было</span>
          <span><i class="cp-out__sw cp-out__sw--after" />Стало</span>
        </p>
      </div>

      <ul class="cp-out__rows">
        <li v-for="(row, i) in rows" :key="row.label" v-reveal class="cp-out__row" :style="{ '--i': i, '--b': row.b, '--a': row.a }">
          <div class="cp-out__top">
            <span class="cp-out__label">{{ row.label }}</span>
            <span class="cp-out__delta mono">{{ row.delta }}</span>
          </div>
          <div class="cp-out__bar cp-out__bar--before">
            <span class="cp-out__fill" />
            <span class="cp-out__val mono">{{ fmt(row.before, row.suffix) }}</span>
          </div>
          <div class="cp-out__bar cp-out__bar--after">
            <span class="cp-out__fill" />
            <span class="cp-out__val mono">{{ fmt(row.after, row.suffix) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
