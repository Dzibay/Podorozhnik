<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { offer } = homeCopy
</script>

<template>
  <section id="offer" class="section2" data-section="offer">
    <div class="container">
      <div class="offer2">
        <div class="offer2__copy">
          <p class="kicker">{{ offer.kicker }}</p>
          <h2 class="section2__title">{{ offer.title }}</h2>
          <p class="section2__lead">{{ offer.lead }}</p>

          <ol class="offer2__steps">
            <li v-for="(step, index) in offer.steps" :key="step.title" class="offer2__step">
              <span class="offer2__step-num">{{ index + 1 }}</span>
              <div>
                <span class="offer2__step-label">{{ step.label }}</span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.text }}</p>
              </div>
            </li>
          </ol>

          <p class="note2">{{ offer.note }}</p>

          <div class="offer2__cta">
            <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
              {{ offer.cta }}
              <span aria-hidden="true">&rarr;</span>
            </AppButton>
          </div>
        </div>

        <div class="offer2__visual">
          <div class="offer2__img-card">
            <img
              src="/img/offer-24.png"
              alt="Сайт за 24 часа"
              width="1024"
              height="768"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
