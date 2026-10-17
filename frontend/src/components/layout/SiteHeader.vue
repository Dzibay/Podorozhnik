<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsEvents, contacts, headerNav, routes, site } from '../../data/site'
import { track } from '../../analytics/tracker'
import AppButton from '../ui/AppButton.vue'
import { lockScroll, resetScrollLock, unlockScroll } from '../../utils/scrollLock'

const route = useRoute()
const menuOpen = ref(false)
const isScrolled = ref(false)
const isHome = computed(() => route.path === routes.home)

function onScroll() {
  if (!isHome.value) return
  isScrolled.value = window.scrollY > 12
}

function onKeyDown(event) {
  if (event.key === 'Escape') menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) track(analyticsEvents.navOpened)
}

watch(
  () => route.path,
  () => {
    menuOpen.value = false
    isScrolled.value = window.scrollY > 12
  },
)

watch(isHome, (home) => {
  isScrolled.value = home ? window.scrollY > 12 : false
})

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

const currentPath = computed(() => route.path)

const headerClass = computed(() => ({
  header: true,
  'header--home': isHome.value,
  'header--scrolled': !isHome.value || isScrolled.value || menuOpen.value,
}))
</script>

<template>
  <header :class="headerClass">
    <div class="header__inner">
      <RouterLink :to="routes.home" class="header__brand">{{ site.wordmark }}</RouterLink>

      <nav class="header__nav" aria-label="Основная навигация">
        <RouterLink
          v-for="item in headerNav"
          :key="item.href"
          :to="item.href"
          class="header__link"
          :aria-current="currentPath.startsWith(item.href) && item.href !== '/' ? 'page' : undefined"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header__actions">
        <RouterLink class="header__icon header__icon--search" :to="routes.services" aria-label="Поиск">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </RouterLink>
        <RouterLink class="header__icon" :to="routes.contacts" aria-label="Написать нам">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" />
            <path d="m22 7-10 7L2 7" />
          </svg>
        </RouterLink>
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

  <Teleport to="body">
    <Transition name="mobile-nav-backdrop">
      <div
        v-if="menuOpen"
        class="mobile-nav-backdrop"
        aria-hidden="true"
        @click="menuOpen = false"
      />
    </Transition>

    <Transition name="mobile-nav">
      <nav
        v-if="menuOpen"
        id="mobile-nav"
        class="mobile-nav"
        aria-label="Мобильная навигация"
      >
        <ul class="mobile-nav__list">
          <li v-for="item in headerNav" :key="item.href">
            <RouterLink :to="item.href" class="mobile-nav__link">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>

        <div class="mobile-nav__cta">
          <a class="mobile-nav__phone" :href="contacts.phoneTel">
            {{ contacts.phoneDisplay }}
          </a>
          <AppButton
            :href="routes.contacts"
            class="header__cta header__cta--mobile"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            Обсудить проект
          </AppButton>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>
