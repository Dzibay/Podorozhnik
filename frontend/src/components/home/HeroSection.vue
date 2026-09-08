<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { hero } = homeCopy
</script>

<template>
  <section id="hero" class="hero2" data-section="hero">
    <div class="hero2__glow" aria-hidden="true"></div>

    <div class="container hero2__grid">
      <div class="hero2__copy">
        <p class="kicker">{{ hero.kicker }}</p>
        <h1 class="hero2__title">
          {{ hero.titleStart }}
          <span class="hero2__title-accent">{{ hero.titleAccent }}</span>
          {{ hero.titleEnd }}
        </h1>
        <p class="hero2__sub">{{ hero.sub }}</p>
        <div class="hero2__actions">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            {{ hero.cta }}
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton href="#pricing" variant="outline" event-name="">
            {{ hero.ctaSecondary }}
          </AppButton>
        </div>
      </div>

      <div class="hero2__visual">
        <div class="hero2__img-card">
          <img
            src="/img/hero-3d.png"
            alt="Подорожник — цифровые системы для реального бизнеса"
            width="1024"
            height="1024"
            fetchpriority="high"
          />
          <div
            v-for="(chip, i) in hero.chips"
            :key="chip.value"
            class="hero2__chip"
            :class="`hero2__chip--${i + 1}`"
          >
            <strong>{{ chip.value }}</strong>
            <span>{{ chip.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <ul class="hero2__stats">
        <li v-for="stat in hero.stats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </li>
      </ul>
    </div>

    <div class="hero2__marquee" aria-hidden="true">
      <div class="hero2__marquee-track">
        <span v-for="n in 2" :key="n" class="hero2__marquee-row">
          <span v-for="item in hero.marquee" :key="`${n}-${item}`" class="hero2__marquee-item">
            {{ item }} <i>✦</i>
          </span>
        </span>
      </div>
    </div>
  </section>
</template>
