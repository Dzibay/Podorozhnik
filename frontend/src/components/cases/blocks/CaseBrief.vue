<script setup>
import { computed, ref } from 'vue'
import { calmMotion, useScrollProgress } from '../useScrollProgress'

/** Задача клиента: цитата «проявляется» слово за словом по мере прокрутки */
const props = defineProps({
  brief: { type: Object, required: true },
})

const root = ref(null)
const progress = useScrollProgress(root)
const words = computed(() => props.brief.quote.split(' '))
const reduced = calmMotion()
const lit = computed(() => {
  if (reduced) return words.value.length
  const p = Math.min(1, Math.max(0, (progress.value - 0.18) / 0.42))
  return Math.round(p * words.value.length)
})
</script>

<template>
  <section ref="root" class="cp-sec cp-brief">
    <div class="container cp-brief__grid">
      <p v-reveal class="kicker">Задача клиента</p>
      <blockquote class="cp-brief__quote">
        <span class="cp-brief__mark" aria-hidden="true">“</span>
        <span v-for="(word, i) in words" :key="i" class="cp-brief__word" :class="{ 'is-lit': i < lit }">{{ word }}</span>
      </blockquote>
      <p class="cp-brief__who mono" :class="{ 'is-lit': lit >= words.length }">— {{ brief.who }}</p>
      <ul class="cp-brief__goals">
        <li v-for="(goal, i) in brief.goals" :key="goal" v-reveal :style="{ '--i': i }">
          <span class="mono">Цель {{ String(i + 1).padStart(2, '0') }}</span>
          <b>{{ goal }}</b>
        </li>
      </ul>
    </div>
  </section>
</template>
