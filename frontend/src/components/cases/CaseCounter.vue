<script setup>
import { computed, ref } from 'vue'
import { formatMetric } from '../../data/cases'
import { useCountUp } from '../../utils/countUp'

/** Число метрики, которое отсчитывается от нуля при появлении на экране */
const props = defineProps({
  metric: { type: Object, required: true },
  duration: { type: Number, default: 1600 },
})

const root = ref(null)
const progress = useCountUp(root, { duration: props.duration })
const text = computed(() =>
  progress.value === 1
    ? formatMetric(props.metric)
    : formatMetric(props.metric, Math.round(props.metric.value * progress.value)),
)
</script>

<template>
  <span ref="root" class="case-counter">{{ text }}</span>
</template>
