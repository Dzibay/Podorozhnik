<script setup>
import { cases } from '../../data/cases'
import { homeCopy } from '../../data/home'
import { analyticsEvents, routes } from '../../data/site'
import AppButton from '../ui/AppButton.vue'

const { casesBlock } = homeCopy
const preview = cases.slice(0, 4)
</script>

<template>
  <section id="cases" class="section2" data-section="cases">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ casesBlock.kicker }}</p>
        <h2 class="section2__title">{{ casesBlock.title }}</h2>
        <p class="section2__lead">{{ casesBlock.lead }}</p>
      </div>

      <div class="cases-home-grid">
        <RouterLink
          v-for="(item, index) in preview"
          :key="item.id"
          class="card2 cases-home-card"
          :to="routes.case(item.slug)"
        >
          <span class="card2__index">0{{ index + 1 }}</span>
          <p class="cases-home-card__niche">{{ item.nicheLabel }}</p>
          <h3 class="cases-home-card__title">{{ item.title }}</h3>
          <p class="cases-home-card__metric">{{ item.preview.metric }}</p>
          <p class="cases-home-card__result">{{ item.preview.result }}</p>
          <p class="cases-home-card__highlight">{{ item.highlight }}</p>
          <span class="card2__arrow" aria-hidden="true">&rarr;</span>
        </RouterLink>
      </div>

      <div class="section2__foot">
        <AppButton :href="routes.cases" :event-name="analyticsEvents.ctaDiscussProject">
          {{ casesBlock.cta }}
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
      </div>
    </div>
  </section>
</template>
