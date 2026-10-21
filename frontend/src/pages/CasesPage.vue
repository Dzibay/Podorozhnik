<script setup>
import { caseThemeVars, cases } from '../data/cases'
import { casesCopy } from '../data/home'
import { contacts, routes } from '../data/site'
import { track } from '../analytics/tracker'
import CaseScene from '../components/cases/CaseScene.vue'
</script>

<template>
  <main id="main" class="page cl">
    <div class="container">
      <header class="cl-hero">
        <p v-reveal class="kicker">{{ casesCopy.kicker }}</p>
        <div class="cl-hero__row">
          <h1 v-reveal.lines class="cl-hero__title lines">
            <span><span>Цифры,</span></span>
            <span><span :style="{ '--l': 1 }"><em>а не обещания</em></span></span>
          </h1>
          <p v-reveal class="cl-hero__lead">{{ casesCopy.lead }}</p>
        </div>
      </header>

      <div class="cl-grid">
        <RouterLink
          v-for="(item, index) in cases"
          :key="item.slug"
          v-reveal
          :to="routes.case(item.slug)"
          class="cl-card"
          :class="item.theme.dark ? 'cl-card--dark' : 'cl-card--light'"
          :style="{ ...caseThemeVars(item), '--i': index % 2 }"
          data-cursor="Кейс"
        >
          <CaseScene :scene="item.scene" />
          <span class="cl-card__top mono">
            <span>{{ String(index + 1).padStart(2, '0') }} · {{ item.team ? 'Опыт команды' : 'Проект агентства' }}</span>
            <span>{{ item.nicheLabel }}</span>
          </span>
          <span class="cl-card__metric">{{ item.preview.metric }}</span>
          <span class="cl-card__result">{{ item.preview.result }}</span>
          <span class="cl-card__bottom">
            <span class="cl-card__title">{{ item.title }}</span>
            <span class="cl-card__arrow" aria-hidden="true">→</span>
          </span>
        </RouterLink>
      </div>

      <section v-reveal class="cl-cta">
        <h2 class="cl-cta__title">Следующий кейс <em>может быть вашим</em></h2>
        <div class="cl-cta__actions">
          <a class="cl-cta__phone" :href="contacts.phoneTel" @click="track('click_phone', { place: 'cases' })">
            {{ contacts.phoneDisplay }}
          </a>
          <RouterLink :to="routes.contacts" class="button button--accent">Перезвоните мне</RouterLink>
        </div>
      </section>
    </div>
  </main>
</template>
