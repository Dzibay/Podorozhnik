<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { cta } = homeCopy
</script>

<template>
  <section id="cta" class="section section--cta" data-section="cta" data-blob-zone="cta">
    <div class="container cta-split">
      <div class="cta-copy">
        <p class="kicker">{{ cta.kicker }}</p>
        <h2 class="cta-copy__title">{{ cta.title }}</h2>
        <p class="cta-copy__lead">{{ cta.lead }}</p>

        <div class="cta-actions">
          <div class="cta-actions__item" data-blob="heart">
            <AppButton
              class="cta-button"
              :href="routes.contacts"
              :event-name="analyticsEvents.ctaDiscussProject"
            >
              {{ cta.primary }}
              <span class="cta-button__arrow" aria-hidden="true">&rarr;</span>
            </AppButton>
          </div>
          <AppButton
            class="cta-button"
            :href="routes.services"
            variant="outline"
            event-name=""
          >
            {{ cta.secondary }}
            <span class="cta-button__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
        </div>
      </div>

      <div class="cta-divider" aria-hidden="true"></div>

      <!-- Правая половина: сюда подплывает пятно-сердце -->
      <div class="cta-stage" data-blob-zone-anchor="cta" aria-hidden="true"></div>
    </div>
  </section>
</template>
