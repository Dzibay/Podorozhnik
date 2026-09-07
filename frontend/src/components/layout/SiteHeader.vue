<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsEvents, contacts, headerCta, headerNav, routes, site } from '../../data/site'
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
    <div class="container header__inner">
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
        <a class="header__phone" :href="contacts.phoneTel">
          {{ contacts.phoneDisplay }}
        </a>
        <AppButton
          :href="headerCta.href"
          variant="outline"
          class="header__cta"
          :event-name="analyticsEvents.ctaDiscussProject"
        >
          {{ headerCta.label }}
        </AppButton>
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
            :href="headerCta.href"
            variant="outline"
            class="header__cta header__cta--mobile"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            {{ headerCta.label }}
          </AppButton>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>
