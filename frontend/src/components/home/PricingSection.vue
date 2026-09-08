<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { pricing } = homeCopy
</script>

<template>
  <section id="pricing" class="section2" data-section="pricing">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ pricing.kicker }}</p>
        <h2 class="section2__title">{{ pricing.title }}</h2>
        <p class="section2__lead">{{ pricing.lead }}</p>
      </div>

      <div class="pricing2-grid">
        <article
          v-for="plan in pricing.plans"
          :key="plan.id"
          class="card2 pricing2-card"
          :class="{ 'pricing2-card--featured': plan.featured }"
        >
          <p v-if="plan.featured" class="pricing2-card__badge">Чаще всего берут</p>
          <h3 class="pricing2-card__name">{{ plan.name }}</h3>
          <p class="pricing2-card__price">{{ plan.price }}</p>
          <ul class="pricing2-card__includes">
            <li v-for="item in plan.includes" :key="item">{{ item }}</li>
          </ul>
          <p class="pricing2-card__for">{{ plan.forWhom }}</p>
        </article>
      </div>

      <div class="section2__foot">
        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          {{ pricing.cta }}
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
      </div>
    </div>
  </section>
</template>
