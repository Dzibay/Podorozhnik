<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCase } from '../data/cases'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

const route = useRoute()
const item = computed(() => getCase(route.params.slug))
</script>

<template>
  <main id="main" class="page page--case">
    <div class="page-glow" aria-hidden="true"></div>
    <div v-if="item" class="container case-page">
      <nav class="case-page__crumb" aria-label="Навигация">
        <RouterLink :to="routes.cases">Кейсы</RouterLink>
        <span aria-hidden="true">/</span>
        <span>{{ item.title }}</span>
      </nav>

      <div class="case-page__top">
        <header class="case-page__hero">
          <p class="kicker">{{ item.nicheLabel }}</p>
          <h1 class="case-page__title">{{ item.title }}</h1>
          <p class="case-page__meta">{{ item.client }} · {{ item.period }}</p>
          <p class="case-page__task"><strong>Задача.</strong> {{ item.task }}</p>
        </header>

        <aside class="case-page__spotlight card2">
          <p class="case-page__spotlight-label">Главный результат</p>
          <p class="case-page__spotlight-value">{{ item.preview.metric }}</p>
          <p class="case-page__spotlight-result">{{ item.preview.result }}</p>
        </aside>
      </div>

      <div class="case-page__metrics">
        <div v-for="metric in item.metrics" :key="metric.label" class="case-page__metric">
          <p class="case-page__metric-label">{{ metric.label }}</p>
          <p class="case-page__metric-value">{{ metric.value }}</p>
        </div>
      </div>

      <div class="case-page__body">
        <section class="case-page__block">
          <h2>Что сделали</h2>
          <ul>
            <li v-for="step in item.did" :key="step">{{ step }}</li>
          </ul>
        </section>

        <section class="case-page__block case-page__block--insight">
          <h2>Инсайт</h2>
          <p>{{ item.highlight }}</p>
        </section>
      </div>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Хотите такой же результат?</h2>
          <p class="page-cta2__lead">
            Бесплатный аудит за 24 часа: разберём вашу нишу и покажем, с чего начать.
          </p>
        </div>
        <div class="page-cta2__actions">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            Получить бесплатный аудит
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton :href="routes.cases" variant="outline" event-name="">
            Все кейсы
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
