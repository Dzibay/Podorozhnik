<script setup>
import { agencyCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'
</script>

<template>
  <main id="main" class="page page--agency">
    <div class="container">
      <header class="page-hero">
        <p class="kicker">{{ agencyCopy.kicker }}</p>
        <h1 class="page-hero__title">{{ agencyCopy.title }}</h1>
        <p class="page-hero__lead">{{ agencyCopy.lead }}</p>
      </header>

      <ul class="agency-principles">
        <li
          v-for="(item, index) in agencyCopy.principles"
          :key="item.title"
          class="agency-principle"
        >
          <span class="agency-principle__num" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <div class="agency-principle__copy">
            <h2 class="agency-principle__title">{{ item.title }}</h2>
            <p class="agency-principle__text">{{ item.text }}</p>
          </div>
        </li>
      </ul>

      <section class="page-cta">
        <div class="page-cta__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta__title">Готовы обсудить задачу?</h2>
          <p class="page-cta__lead">
            Расскажите контекст — предложим формат: анализ, продукт, рост или полный цикл.
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
