<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { urgency } = homeCopy
</script>

<template>
  <section id="urgency" class="section2" data-section="urgency">
    <div class="container">
      <div class="urgency2">
        <div class="urgency2__glow" aria-hidden="true"></div>
        <p class="kicker">{{ urgency.kicker }}</p>
        <h2 class="urgency2__title">{{ urgency.title }}</h2>

        <div class="urgency2-grid">
          <article v-for="(item, index) in urgency.items" :key="item.title" class="urgency2-card">
            <span class="card2__index">0{{ index + 1 }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>

        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          {{ urgency.cta }}
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
      </div>
    </div>
  </section>
</template>
