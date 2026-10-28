<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsEvents, contacts, headerNav, routes, site } from '../../data/site'
import { track } from '../../analytics/tracker'
import BrandMark from '../ui/BrandMark.vue'
import { lockScroll, resetScrollLock, unlockScroll } from '../../utils/scrollLock'

const route = useRoute()
const menuOpen = ref(false)
const isScrolled = ref(false)
const isHidden = ref(false)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  isScrolled.value = y > 24
  isHidden.value = !menuOpen.value && y > 480 && y > lastY + 2
  if (y < lastY - 2 || y < 480) isHidden.value = false
  lastY = y
}

function onKeyDown(event) {
  if (event.key === 'Escape') menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) track(analyticsEvents.navOpened)
}

function onCall() {
  track('click_phone')
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

watch(menuOpen, (open) => {
  if (open) lockScroll()
  else unlockScroll()
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('scroll', onScroll)
  resetScrollLock()
})

function isCurrent(href) {
  if (href.includes('#') || href === '/') return false
  return route.path.startsWith(href)
}

const headerClass = computed(() => ({
  header: true,
  // Над тёмным первым экраном шапка сразу «плавающая», иначе её не видно
  'header--scrolled': isScrolled.value || menuOpen.value || Boolean(route.meta.darkTop),
  'header--hidden': isHidden.value,
  'header--open': menuOpen.value,
}))
</script>

<template>
  <header :class="headerClass">
    <div class="header__inner">
      <RouterLink :to="routes.home" class="brand header__brand" :aria-label="site.wordmark">
        <BrandMark />
        <span class="brand__word">{{ site.wordmark }}</span>
      </RouterLink>

      <nav class="header__nav" aria-label="Основная навигация">
        <RouterLink
          v-for="item in headerNav"
          :key="item.href"
          :to="item.href"
          class="header__link"
          :aria-current="isCurrent(item.href) ? 'page' : undefined"
        >
          <span class="roll"><span :data-text="item.label">{{ item.label }}</span></span>
        </RouterLink>
      </nav>

      <div class="header__actions">
        <a class="header__phone" :href="contacts.phoneTel" @click="onCall">
          <span class="live-dot" aria-hidden="true" />
          {{ contacts.phoneDisplay }}
        </a>
        <a class="button header__call" :href="contacts.phoneTel" @click="onCall">
          Позвонить
        </a>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="toggleMenu"
        >
          <span />
        </button>
      </div>
    </div>
  </header>

  <Teleport to="#teleports">
    <Transition name="mnav">
      <nav v-if="menuOpen" id="mobile-nav" class="mnav" aria-label="Мобильная навигация">
        <ul class="mnav__list">
          <li v-for="(item, index) in headerNav" :key="item.href" :style="{ '--i': index }">
            <RouterLink :to="item.href" class="mnav__link">
              <span class="mono">0{{ index + 1 }}</span>
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>

        <div class="mnav__foot">
          <a class="mnav__phone" :href="contacts.phoneTel" @click="onCall">{{ contacts.phoneDisplay }}</a>
          <a class="button button--brand button--lg" :href="contacts.phoneTel" @click="onCall">
            <span class="live-dot" aria-hidden="true" />
            Позвонить сейчас
          </a>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>
