<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { cta } = homeCopy
</script>

<template>
  <section id="cta" class="cta2" data-section="cta">
    <div class="cta2__glow" aria-hidden="true"></div>

    <div class="container cta2__inner">
      <p class="kicker">{{ cta.kicker }}</p>
      <h2 class="cta2__title">{{ cta.title }}</h2>
      <p class="cta2__lead">{{ cta.lead }}</p>

      <div class="cta2__actions">
        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          {{ cta.primary }}
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
        <AppButton :href="routes.services" variant="outline" event-name="">
          {{ cta.secondary }}
        </AppButton>
      </div>
    </div>

    <p class="cta2__giant" aria-hidden="true">ПОДОРОЖНИК</p>
  </section>
</template>
