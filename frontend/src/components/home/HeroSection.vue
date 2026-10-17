<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { hero } = homeCopy
</script>

<template>
  <section id="hero" class="hero-poster" data-section="hero" aria-label="Подорожник">
    <div class="blobs" aria-hidden="true">
      <div class="blob blob--red blob--a"></div>
      <div class="blob blob--orange blob--b"></div>
      <div class="blob blob--red blob--c"></div>
    </div>

    <div class="hero-poster__content">
      <h1 class="hero-poster__title anim" style="--d: 0.05s">
        <span>{{ hero.titleStart }}</span>
        <span class="indent">{{ hero.titleAccent }}</span>
      </h1>
      <p class="hero-poster__sub anim" style="--d: 0.2s">{{ hero.sub }}</p>
      <div class="hero-poster__cta anim" style="--d: 0.35s">
        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          {{ hero.cta }}
        </AppButton>
        <AppButton :href="routes.cases" variant="accent" event-name="">
          {{ hero.ctaSecondary }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </AppButton>
      </div>
    </div>

    <p class="hero-poster__meta anim" style="--d: 0.45s">{{ hero.meta }}</p>
  </section>
</template>
