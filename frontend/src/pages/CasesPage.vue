<script setup>
import { casesCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

const placeholders = [
  { label: 'Производство / металлоконструкции', note: 'Сайт · трафик · структура под SEO' },
  { label: 'Стройка и ремонт', note: 'Посадочные · Директ · качество лидов' },
  { label: 'Кейс с цифрами', note: 'Публикуем после согласования с клиентом' },
]
</script>

<template>
  <main id="main" class="page page--cases">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2">
        <p class="kicker">{{ casesCopy.kicker }}</p>
        <h1 class="page-hero2__title">
          Кейсы <span class="page-hero2__accent">без выдуманных метрик</span>
        </h1>
        <p class="page-hero2__lead">{{ casesCopy.lead }}</p>
      </header>

      <div class="cases2-grid">
        <article v-for="(item, index) in placeholders" :key="item.label" class="card2 cases2-card">
          <div class="cases2-card__top">
            <span class="card2__index">0{{ index + 1 }}</span>
            <span class="cases2-card__badge">Скоро</span>
          </div>
          <h2 class="cases2-card__name">{{ item.label }}</h2>
          <p class="cases2-card__note">{{ item.note }}</p>
        </article>
      </div>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Пока готовим кейсы</p>
          <h2 class="page-cta2__title">Можем разобрать вашу задачу</h2>
          <p class="page-cta2__lead">
            Без выдуманных цифр — обсудим реальный контекст и формат работы. Старт с бесплатного
            аудита.
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
