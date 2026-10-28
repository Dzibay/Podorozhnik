<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { contacts, routes, site } from '../../data/site'
import BrandMark from '../../components/ui/BrandMark.vue'
import './landing-base.css'
import './themes/dark.css'

const props = defineProps({
  theme: { type: String, default: 'light' },
  ctaLabel: { type: String, default: '' },
  ctaHref: { type: String, default: '#lp-form' },
  // своя палитра страницы (CSS-переменные) и класс оформления — у нишевых витрин
  vars: { type: Object, default: null },
  variant: { type: String, default: '' },
  // ссылки внизу страницы: колонки { title, links: [{ label, to }] } — соседние ниши, услуги
  related: { type: Array, default: () => [] },
})

const route = useRoute()
// те же крошки, что в разметке BreadcrumbList: их задаёт роутер
const crumbs = computed(() => route.meta.breadcrumb || [])
const sections = {
  title: 'Подорожник',
  links: [
    { label: 'Услуги', to: routes.services },
    { label: 'Ниши', to: routes.niches },
    { label: 'Кейсы', to: routes.cases },
    { label: 'Подход', to: routes.agency },
    { label: 'Контакты', to: routes.contacts },
  ],
}
const columns = computed(() => [...props.related, sections])

const root = ref(null)
const themeClass = computed(() => [`lp lp--${props.theme === 'light' ? 'light' : 'dark'}`, props.variant && `lp--${props.variant}`])

function paintRoot() {
  if (!root.value) return
  const bg = getComputedStyle(root.value).getPropertyValue('--lp-bg').trim()
  document.documentElement.style.backgroundColor = bg
  document.body.style.backgroundColor = bg
}

function clearRoot() {
  document.documentElement.style.backgroundColor = ''
  document.body.style.backgroundColor = ''
}

onMounted(paintRoot)
// переход между нишами переиспользует компонент — перекрашиваем фон под новую палитру
watch(() => props.vars, () => nextTick(paintRoot))
onUnmounted(clearRoot)

// Нижняя кнопка на телефоне дублирует кнопки первого экрана и наезжает на них —
// показываем её, когда они ушли из вида. До гидратации она скрыта.
const heroActionsVisible = ref(true)
let heroObserver = null

function watchHeroActions() {
  heroObserver?.disconnect()
  const actions = root.value?.querySelector('.lp-hero__actions')
  if (!actions || typeof IntersectionObserver === 'undefined') {
    heroActionsVisible.value = false
    return
  }
  heroObserver = new IntersectionObserver(([entry]) => {
    heroActionsVisible.value = entry.isIntersecting
  })
  heroObserver.observe(actions)
}

onMounted(watchHeroActions)
// у ниш с витриной и без неё разные герои — после перехода следим за новыми кнопками
watch(() => route.path, () => nextTick(watchHeroActions))
onUnmounted(() => heroObserver?.disconnect())
</script>

<template>
  <div ref="root" :class="themeClass" :style="vars">
    <header class="lp-header">
      <div class="lp-wrap lp-header__inner">
        <RouterLink class="lp-header__brand brand" :to="routes.home" aria-label="Подорожник — на главную">
          <BrandMark />
          <span class="brand__word">{{ site.wordmark }}</span>
        </RouterLink>
        <div class="lp-header__actions">
          <a class="lp-header__phone" :href="contacts.phoneTel">
            <span class="live-dot" aria-hidden="true" />
            {{ contacts.phoneDisplay }}
          </a>
          <a class="lp-btn lp-btn--sm" :href="contacts.phoneTel">Позвонить</a>
        </div>
      </div>
    </header>

    <slot />

    <nav class="lp-map" aria-label="Разделы сайта">
      <div class="lp-wrap">
        <ol v-if="crumbs.length" class="lp-crumbs">
          <li v-for="(crumb, index) in crumbs" :key="crumb.path">
            <RouterLink v-if="index < crumbs.length - 1" :to="crumb.path">{{ crumb.name }}</RouterLink>
            <span v-else aria-current="page">{{ crumb.name }}</span>
          </li>
        </ol>
        <div class="lp-map__cols">
          <div v-for="column in columns" :key="column.title">
            <p class="lp-map__title">{{ column.title }}</p>
            <ul class="lp-map__list">
              <li v-for="link in column.links" :key="link.to">
                <RouterLink :to="link.to">{{ link.label }}</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <footer class="lp-footer">
      <div class="lp-wrap lp-footer__inner">
        <RouterLink :to="routes.home">{{ site.wordmark }}</RouterLink>
        <a :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        <RouterLink :to="routes.privacy">Политика</RouterLink>
        <RouterLink :to="routes.consent">Согласие</RouterLink>
        <RouterLink :to="routes.contacts">Контакты</RouterLink>
      </div>
    </footer>

    <div v-if="ctaLabel" class="lp-sticky" :class="{ 'is-hidden': heroActionsVisible }">
      <a class="lp-btn" :href="ctaHref">{{ ctaLabel }}</a>
    </div>
  </div>
</template>
