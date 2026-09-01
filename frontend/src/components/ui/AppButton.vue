<script setup>
import { computed } from 'vue'
import { track } from '../../analytics/tracker'
import { analyticsEvents } from '../../data/site'

const props = defineProps({
  href: { type: String, default: '' },
  variant: { type: String, default: 'primary' },
  eventName: { type: String, default: analyticsEvents.ctaDiscussProject },
  type: { type: String, default: 'button' },
})

const emit = defineEmits(['click'])
const classes = computed(() => ['button', `button--${props.variant}`])

function handleClick() {
  if (props.eventName) track(props.eventName)
  emit('click')
}
</script>

<template>
  <RouterLink
    v-if="href && !href.startsWith('#')"
    :to="href"
    :class="classes"
    @click="handleClick"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    @click="handleClick"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
