<script setup>
import { routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <main id="main" class="page page--empty">
    <div class="container empty-page">
      <p class="kicker">404</p>
      <h1 class="empty-page__title">{{ title }}</h1>
      <p v-if="description" class="empty-page__lead">{{ description }}</p>

      <div class="empty-page__actions">
        <AppButton class="page-cta__button" :href="routes.home" event-name="">
          На главную
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
    </div>
  </main>
</template>
