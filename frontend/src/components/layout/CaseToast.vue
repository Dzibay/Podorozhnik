<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { caseThemeVars, cases } from '../../data/cases'
import { routes } from '../../data/site'

/**
 * Ненавязчивая карточка с результатом из реального кейса.
 * Появляется, только когда человек уже читает страницу (15 с и прокрутка),
 * не чаще одного раза за страницу и не больше двух раз за визит.
 * Закрыли — больше не показываем до конца визита.
 */
const SESSION_LIMIT = 2
const HIDDEN_ROUTES = ['contacts', 'case', 'cases', 'not-found', 'privacy', 'consent', 'admin']

const route = useRoute()
const current = ref(null)
const visible = ref(false)
let readyTimer = 0
let hideTimer = 0
let ready = false
let shownOnPage = false

function session(key, value) {
  try {
    if (value === undefined) return Number(sessionStorage.getItem(key) || 0)
    sessionStorage.setItem(key, String(value))
  } catch {
    return 0
  }
  return value
}

function allowed() {
  return !route.meta.bare && !HIDDEN_ROUTES.includes(route.name) && !session('case-toast-closed') && session('case-toast-count') < SESSION_LIMIT
}

function show() {
  const index = session('case-toast-index') % cases.length
  current.value = cases[index]
  session('case-toast-index', index + 1)
  session('case-toast-count', session('case-toast-count') + 1)
  shownOnPage = true
  visible.value = true
  scheduleHide()
}

function scheduleHide() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 10000)
}

function pauseHide() {
  clearTimeout(hideTimer)
}

function onScroll() {
  if (!ready || shownOnPage || visible.value) return
  if (window.scrollY < window.innerHeight * 1.2 || !allowed()) return
  show()
}

function close() {
  visible.value = false
  session('case-toast-closed', 1)
}

function arm() {
  clearTimeout(readyTimer)
  ready = false
  shownOnPage = false
  visible.value = false
  if (!allowed()) return
  readyTimer = setTimeout(() => {
    ready = true
    onScroll()
  }, 15000)
}

watch(() => route.path, arm)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  arm()
})

onUnmounted(() => {
  clearTimeout(readyTimer)
  clearTimeout(hideTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <aside
    v-if="current"
    class="live-toast"
    :class="{ 'live-toast--on': visible }"
    :style="caseThemeVars(current)"
    aria-label="Результат из кейса"
    @mouseenter="pauseHide"
    @mouseleave="scheduleHide"
  >
    <RouterLink :to="routes.case(current.slug)" class="live-toast__link" @click="visible = false">
      <span class="live-toast__badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 17 9.5 11.5l3.5 3.5L20 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M15 8h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="live-toast__body">
        <span class="live-toast__kicker mono">
          {{ current.team ? 'Из опыта команды' : 'Наш проект' }} · {{ current.nicheLabel }}
        </span>
        <span class="live-toast__metric">{{ current.preview.metric }}</span>
        <span class="live-toast__result">{{ current.preview.result }}</span>
        <span class="live-toast__more mono">Как это сделали →</span>
      </span>
    </RouterLink>
    <button type="button" class="live-toast__close" aria-label="Закрыть" @click="close">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>
  </aside>
</template>
