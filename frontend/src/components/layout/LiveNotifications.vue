<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  eventIcon,
  formatMinutesAgo,
  liveNotifications,
  randomMinutesAgo,
} from '../../data/notifications'

const route = useRoute()
const visible = ref(false)
const current = ref(null)
let timer = null
let hideTimer = null
let lastIndex = -1

const enabled = computed(() => !route.meta.bare && route.name !== 'not-found')

const icon = computed(() => (current.value ? eventIcon(current.value.event) : 'lead'))

function pick() {
  if (!liveNotifications.length) return null
  let index = Math.floor(Math.random() * liveNotifications.length)
  if (liveNotifications.length > 1 && index === lastIndex) {
    index = (index + 1) % liveNotifications.length
  }
  lastIndex = index
  const base = liveNotifications[index]
  return {
    ...base,
    time: formatMinutesAgo(randomMinutesAgo()),
  }
}

function showNext() {
  if (!enabled.value) return
  current.value = pick()
  visible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 5200)
}

function schedule() {
  clearTimeout(timer)
  const delay = 30000 + Math.floor(Math.random() * 15000)
  timer = setTimeout(() => {
    showNext()
    schedule()
  }, delay)
}

onMounted(() => {
  if (!enabled.value) return
  timer = setTimeout(() => {
    showNext()
    schedule()
  }, 8000)
})

onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(hideTimer)
})
</script>

<template>
  <div
    v-if="enabled && current"
    class="live-toast"
    :class="{ 'live-toast--on': visible }"
    role="status"
    aria-live="polite"
  >
    <span class="live-toast__live" aria-hidden="true">
      <span class="live-toast__dot" />
      live
    </span>
    <span class="live-toast__icon" aria-hidden="true">
      <svg v-if="icon === 'call'" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.6c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else-if="icon === 'mail'" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6.5h16v11H4v-11Z"
          stroke="currentColor"
          stroke-width="1.6"
        />
        <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none">
        <path
          d="M5 7.5h14v10H5v-10Z"
          stroke="currentColor"
          stroke-width="1.6"
        />
        <path d="M8 4.5h8M9 12.5h6M9 15.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </span>
    <div class="live-toast__body">
      <p class="live-toast__event">{{ current.event }}</p>
      <p class="live-toast__company">{{ current.company }}</p>
      <p class="live-toast__time">{{ current.time }}</p>
    </div>
  </div>
</template>
