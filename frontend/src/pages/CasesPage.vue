<script setup>
import { casesCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

const placeholders = [
  { label: 'Проект 01', note: 'Задача · решение · результат' },
  { label: 'Проект 02', note: 'Задача · решение · результат' },
  { label: 'Проект 03', note: 'Задача · решение · результат' },
]
</script>

<template>
  <main id="main" class="page page--cases">
    <div class="container">
      <header class="page-hero">
        <p class="kicker">{{ casesCopy.kicker }}</p>
        <h1 class="page-hero__title">{{ casesCopy.title }}</h1>
        <p class="page-hero__lead">{{ casesCopy.lead }}</p>
      </header>

      <ul class="cases-soon" aria-label="Кейсы в подготовке">
        <li v-for="item in placeholders" :key="item.label" class="cases-soon__item">
          <span class="cases-soon__badge">Скоро</span>
          <div class="cases-soon__copy">
            <strong class="cases-soon__name">{{ item.label }}</strong>
            <span class="cases-soon__note">{{ item.note }}</span>
          </div>
        </li>
      </ul>

      <section class="page-cta">
        <div class="page-cta__copy">
          <p class="kicker">Пока готовим кейсы</p>
          <h2 class="page-cta__title">Можем разобрать вашу задачу</h2>
          <p class="page-cta__lead">
            Без выдуманных метрик — обсудим реальный контекст и формат работы.
          </p>
        </div>
        <div class="page-cta__actions">
          <AppButton
            class="page-cta__button"
            :href="routes.contacts"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            Обсудить проект
            <span class="page-cta__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton
            class="page-cta__button"
            :href="routes.services"
            variant="outline"
            event-name=""
          >
            Все услуги
            <span class="page-cta__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
