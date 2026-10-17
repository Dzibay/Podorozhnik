# Shared Layouts

App shell: `frontend/src/App.vue` wraps SiteHeader + RouterView + SiteFooter (+ LiveNotifications, SiteFloat) unless route.meta.bare.


## App
- Path: `frontend/src/App.vue`

```vue
<script setup>
import { useRoute } from 'vue-router'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import LiveNotifications from './components/layout/LiveNotifications.vue'
import SiteFloat from './components/layout/SiteFloat.vue'

const route = useRoute()
</script>

<template>
  <a class="skip-link" href="#main">К содержанию</a>
  <SiteHeader v-if="!route.meta.bare" />
  <RouterView />
  <SiteFooter v-if="!route.meta.bare" />
  <LiveNotifications />
  <SiteFloat />
</template>

```


## SiteHeader
- Path: `frontend/src/components/layout/SiteHeader.vue`

```vue
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

```


## SiteFooter
- Path: `frontend/src/components/layout/SiteFooter.vue`

```vue
<script setup>
import { contacts, footerNav, routes, site } from '../../data/site'
import { serviceGroups } from '../../data/services'
import { nicheList, nichePath } from '../../data/niches'
import EmailChooser from '../ui/EmailChooser.vue'
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <RouterLink :to="routes.home" class="footer__brand">{{ site.wordmark }}</RouterLink>
          <p class="footer__tagline">{{ site.tagline }}</p>
          <div class="footer__contacts">
            <a class="footer__phone" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
            <EmailChooser trigger-class="footer__email" />
          </div>
        </div>

        <div>
          <p class="footer__title">Направления</p>
          <ul class="footer__list">
            <li v-for="group in serviceGroups" :key="group.id">
              <RouterLink :to="`${routes.services}#${group.id}`">{{ group.title }}</RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="footer__title">Ниши</p>
          <ul class="footer__list">
            <li v-for="niche in nicheList" :key="niche.slug">
              <RouterLink :to="nichePath(niche.slug)">{{ niche.label }}</RouterLink>
            </li>
          </ul>
          <p class="footer__title" style="margin-top: 1.5rem">Компания</p>
          <ul class="footer__list">
            <li v-for="item in footerNav.company" :key="item.href">
              <RouterLink :to="item.href">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p>{{ site.brandLine }}</p>
        <p class="footer__docs">
          <RouterLink :to="routes.privacy">Политика обработки персональных данных</RouterLink>
          <RouterLink :to="routes.consent">Согласие на обработку персональных данных</RouterLink>
        </p>
        <p>© {{ new Date().getFullYear() }} {{ site.name }}</p>
      </div>
    </div>
  </footer>
</template>

```


## SiteFloat
- Path: `frontend/src/components/layout/SiteFloat.vue`

```vue
<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { contacts, routes } from '../../data/site'
import { track } from '../../analytics/tracker'

const route = useRoute()
const enabled = computed(() => !route.meta.bare)
const hasTelegram = computed(() => Boolean(contacts.telegramUrl))

function onCall() {
  track('click_phone')
}

function onWrite() {
  track(hasTelegram.value ? 'click_telegram' : 'cta_discuss_project')
}
</script>

<template>
  <div v-if="enabled" class="site-float" aria-label="Быстрые действия">
    <a
      v-if="hasTelegram"
      class="site-float__fab"
      :href="contacts.telegramUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Telegram"
      @click="onWrite"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 6.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.2L12 21l3.8-3.5H18a3 3 0 0 0 3-3v-8Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </a>
    <RouterLink
      v-else
      class="site-float__fab"
      :to="routes.contacts"
      aria-label="Оставить заявку"
      @click="onWrite"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 6.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.2L12 21l3.8-3.5H18a3 3 0 0 0 3-3v-8Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </RouterLink>

    <div class="site-float__bar">
      <a class="site-float__btn" :href="contacts.phoneTel" @click="onCall">Позвонить</a>
      <a
        v-if="hasTelegram"
        class="site-float__btn site-float__btn--primary"
        :href="contacts.telegramUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="onWrite"
      >
        Telegram
      </a>
      <RouterLink
        v-else
        class="site-float__btn site-float__btn--primary"
        :to="routes.contacts"
        @click="onWrite"
      >
        Заявка
      </RouterLink>
    </div>
  </div>
</template>

```


## LiveNotifications
- Path: `frontend/src/components/layout/LiveNotifications.vue`

```vue
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

```

