<script setup>
import { computed } from 'vue'
import legal from '../data/legal.json'

const props = defineProps({
  doc: { type: String, required: true },
})

const page = computed(() => legal[props.doc])

function linkify(text) {
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return safe.replace(
    /https:\/\/podorozhnik-agency\.ru\/privacy\/?|https:\/\/podorozhnik-agency\.ru\/?|podoroznik-gk@yandex\.ru/g,
    (match) => {
      if (match.includes('@')) {
        return `<a href="mailto:${match}">${match}</a>`
      }
      if (match.includes('/privacy')) {
        const label = match.endsWith('/') ? match : `${match}/`
        return `<a href="/privacy">${label}</a>`
      }
      const label = match.endsWith('/') ? match : `${match}/`
      return `<a href="/">${label}</a>`
    },
  )
}
</script>

<template>
  <main id="main" class="page page--legal">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container legal">
      <header class="page-hero2 legal__hero">
        <p class="kicker">Документы</p>
        <h1 class="page-hero2__title legal__title">{{ page.title }}</h1>
        <p v-if="page.subtitle" class="page-hero2__lead">
          <a href="/">{{ page.subtitle }}</a>
        </p>
      </header>

      <article class="legal__body">
        <template v-for="(block, index) in page.blocks" :key="index">
          <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
          <p v-else-if="block.type === 'p'" v-html="linkify(block.text)"></p>
          <ul v-else-if="block.type === 'ul'">
            <li v-for="item in block.items" :key="item" v-html="linkify(item)"></li>
          </ul>
          <div v-else-if="block.type === 'goals'" class="legal-goals">
            <article v-for="item in block.items" :key="item.goal" class="legal-goal">
              <p class="legal-goal__label">Цель обработки</p>
              <h3>{{ item.goal }}</h3>
              <p class="legal-goal__label">Персональные данные</p>
              <ul>
                <li v-for="field in item.data" :key="field">{{ field }}</li>
              </ul>
              <p class="legal-goal__label">Правовые основания</p>
              <p>{{ item.basis }}</p>
              <p class="legal-goal__label">Виды обработки персональных данных</p>
              <p>{{ item.actions }}</p>
            </article>
          </div>
        </template>
      </article>
    </div>
  </main>
</template>
