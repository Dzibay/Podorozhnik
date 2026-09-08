<script setup>
import { agencyCopy, homeCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

const team = homeCopy.team
</script>

<template>
  <main id="main" class="page page--agency">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2">
        <p class="kicker">{{ agencyCopy.kicker }}</p>
        <h1 class="page-hero2__title">
          Внешний отдел маркетинга и
          <span class="page-hero2__accent">IT</span>
        </h1>
        <p class="page-hero2__lead">{{ agencyCopy.lead }}</p>
      </header>

      <div class="agency2-grid">
        <article
          v-for="(item, index) in agencyCopy.principles"
          :key="item.title"
          class="card2 agency2-card"
        >
          <span class="card2__index">0{{ index + 1 }}</span>
          <h2 class="agency2-card__title">{{ item.title }}</h2>
          <p class="agency2-card__text">{{ item.text }}</p>
        </article>
      </div>

      <section class="agency2-team">
        <p class="kicker">{{ team.kicker }}</p>
        <h2 class="agency2-team__title">{{ team.title }}</h2>
        <p class="agency2-team__lead">{{ team.lead }}</p>
        <div class="agency2-team__grid">
          <article v-for="(member, index) in team.members" :key="member.role" class="card2">
            <span class="card2__index">0{{ index + 1 }}</span>
            <h3 class="agency2-team__role">{{ member.role }}</h3>
            <p class="agency2-team__text">{{ member.text }}</p>
          </article>
        </div>
      </section>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Готовы обсудить задачу?</h2>
          <p class="page-cta2__lead">
            Начните с бесплатного аудита — за 24 часа разберём сайт и рекламу и предложим план с
            цифрами.
          </p>
        </div>
        <div class="page-cta2__actions">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            Получить бесплатный аудит
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton :href="routes.services" variant="outline" event-name="">
            Все услуги
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
