<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contacts, routes } from '../data/site'
import { nicheGroups } from '../data/nicheGroups'
import { track } from '../analytics/tracker'
import NicheCard from '../components/ui/NicheCard.vue'
import '../styles/niches-catalog.css'

/** Каталог ниш: группы, фильтр по группе (в ?g=) и поиск по названию и тегам */
const route = useRoute()
const router = useRouter()

// сквозная нумерация карточек — по порядку групп
let counter = 0
const groups = nicheGroups.map((group, index) => ({
  ...group,
  index: String(index + 1).padStart(2, '0'),
  items: group.niches.map((niche) => ({
    niche,
    num: ++counter,
    haystack: [niche.card.title, niche.label, niche.card.text, ...niche.card.tags].join(' ').toLowerCase(),
  })),
}))
const total = counter

const active = ref(groups.some((g) => g.id === route.query.g) ? route.query.g : 'all')
const query = ref('')

watch(active, (id) => {
  router.replace({ query: id === 'all' ? {} : { g: id }, hash: '' })
})

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups
    .filter((g) => active.value === 'all' || g.id === active.value)
    .map((g) => ({ ...g, shown: q ? g.items.filter((item) => item.haystack.includes(q)) : g.items }))
    .filter((g) => g.shown.length)
})

const found = computed(() => visible.value.reduce((sum, g) => sum + g.shown.length, 0))

function pick(id) {
  active.value = id
}
</script>

<template>
  <main id="main" class="page page--niches">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2">
        <p class="kicker">Ниши · {{ total }}</p>
        <h1 class="page-hero2__title">
          Бизнес, который <span class="page-hero2__accent">стоит на земле</span>
        </h1>
        <p class="page-hero2__lead">
          Выберите свою нишу — покажем, откуда в ней берутся клиенты, что мешает им звонить и как мы
          это чиним.
        </p>
      </header>

      <div class="nc-bar">
        <div class="nc-filter" role="group" aria-label="Группы ниш">
          <button type="button" class="nc-chip" :aria-pressed="active === 'all'" @click="pick('all')">
            Все <span class="nc-chip__count">{{ total }}</span>
          </button>
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="nc-chip"
            :aria-pressed="active === group.id"
            @click="pick(group.id)"
          >
            {{ group.title }} <span class="nc-chip__count">{{ group.items.length }}</span>
          </button>
        </div>
        <label class="nc-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span class="visually-hidden">Найти нишу</span>
          <input v-model="query" type="search" placeholder="Найти нишу" autocomplete="off" />
        </label>
      </div>

      <p class="nc-status" aria-live="polite">
        <template v-if="query.trim()">Найдено: {{ found }}</template>
      </p>

      <section
        v-for="group in visible"
        :id="`g-${group.id}`"
        :key="group.id"
        class="nc-group"
        :aria-labelledby="`g-${group.id}-title`"
      >
        <header class="nc-group__head">
          <span class="nc-group__index mono">{{ group.index }}</span>
          <h2 :id="`g-${group.id}-title`" class="nc-group__title">{{ group.title }}</h2>
          <p class="nc-group__text">{{ group.text }}</p>
          <span class="nc-group__count mono">{{ group.shown.length }} {{ group.shown.length === 1 ? 'ниша' : group.shown.length < 5 ? 'ниши' : 'ниш' }}</span>
        </header>
        <ul class="niches__grid nc-grid">
          <li v-for="(item, i) in group.shown" :key="item.niche.slug" v-reveal :style="{ '--i': i % 4 }">
            <NicheCard :niche="item.niche" :num="item.num" />
          </li>
        </ul>
      </section>

      <div v-if="!found" class="nc-empty">
        <p class="nc-empty__title">Такой ниши пока нет в каталоге</p>
        <p>Это не значит, что мы не возьмёмся. Позвоните — за 15 минут скажем, сможем ли помочь.</p>
        <a class="button button--primary" :href="contacts.phoneTel" @click="track('click_phone', { place: 'niches-empty' })">
          Позвонить<span class="cta-num">&nbsp;{{ contacts.phoneDisplay }}</span>
        </a>
      </div>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Нет вашей ниши?</p>
          <h2 class="page-cta2__title">Позвоните — скажем честно</h2>
          <p class="page-cta2__lead">
            За 15 минут разберёмся, сможем ли привести вам клиентов, и с чего начать.
          </p>
        </div>
        <div class="page-cta2__actions">
          <a class="button button--primary" :href="contacts.phoneTel" @click="track('click_phone', { place: 'niches-cta' })">
            Позвонить<span class="cta-num">&nbsp;{{ contacts.phoneDisplay }}</span>
          </a>
          <RouterLink class="button button--outline" :to="routes.services">Все услуги</RouterLink>
        </div>
      </section>
    </div>
  </main>
</template>
