<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
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
})

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

    <footer class="lp-footer">
      <div class="lp-wrap lp-footer__inner">
        <RouterLink :to="routes.home">{{ site.wordmark }}</RouterLink>
        <a :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        <RouterLink :to="routes.privacy">Политика</RouterLink>
        <RouterLink :to="routes.consent">Согласие</RouterLink>
        <RouterLink :to="routes.contacts">Контакты</RouterLink>
      </div>
    </footer>

    <div v-if="ctaLabel" class="lp-sticky">
      <a class="lp-btn" :href="ctaHref">{{ ctaLabel }}</a>
    </div>
  </div>
</template>
