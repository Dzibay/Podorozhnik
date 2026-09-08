<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { contacts, routes, site } from '../../data/site'
import './landing-base.css'
import './themes/dark.css'
import './themes/light.css'

const props = defineProps({
  theme: { type: String, default: 'dark' },
  ctaLabel: { type: String, default: '' },
  ctaHref: { type: String, default: '#lp-form' },
})

const root = ref(null)
const themeClass = computed(() => `lp lp--${props.theme === 'light' ? 'light' : 'dark'}`)

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
onUnmounted(clearRoot)
</script>

<template>
  <div ref="root" :class="themeClass">
    <header class="lp-header">
      <div class="lp-wrap lp-header__inner">
        <RouterLink class="lp-header__brand" :to="routes.home">{{ site.wordmark }}</RouterLink>
        <a class="lp-header__phone" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
      </div>
    </header>

    <slot />

    <footer class="lp-footer">
      <div class="lp-wrap lp-footer__inner">
        <RouterLink :to="routes.home">{{ site.wordmark }}</RouterLink>
        <a :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        <RouterLink :to="routes.contacts">Контакты</RouterLink>
      </div>
    </footer>

    <div v-if="ctaLabel" class="lp-sticky">
      <a class="lp-btn" :href="ctaHref">{{ ctaLabel }}</a>
    </div>
  </div>
</template>
