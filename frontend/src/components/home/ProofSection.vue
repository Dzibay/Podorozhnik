<script setup>
import { computed, ref } from 'vue'
import { homeCopy } from '../../data/home'
import { useCountUp } from '../../utils/countUp'

const { proof } = homeCopy
const root = ref(null)
const progress = useCountUp(root, { duration: 1800, threshold: 0.4 })
const values = computed(() => proof.stats.map((stat) => Math.round(stat.value * progress.value)))
</script>

<template>
  <section ref="root" class="sec sec--dark proof grain" data-section="proof">
    <div class="container">
      <p v-reveal class="kicker">{{ proof.kicker }}</p>
      <h2 v-reveal class="h-2 proof__title">
        {{ proof.titleStart }} <em>{{ proof.titleAccent }}</em>
      </h2>

      <dl class="proof__grid">
        <div v-for="(stat, index) in proof.stats" :key="stat.label" v-reveal class="proof__item" :style="{ '--i': index }">
          <dt class="proof__value">
            {{ values[index] }}<span class="proof__suffix">{{ stat.suffix }}</span>
          </dt>
          <dd class="proof__label">{{ stat.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
