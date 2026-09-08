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
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container empty2">
      <p class="kicker">404</p>
      <p class="empty2__giant" aria-hidden="true">404</p>
      <h1 class="empty2__title">{{ title }}</h1>
      <p v-if="description" class="empty2__lead">{{ description }}</p>

      <div class="empty2__actions">
        <AppButton :href="routes.home" event-name="">
          На главную
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
        <AppButton :href="routes.services" variant="outline" event-name="">
          Все услуги
        </AppButton>
      </div>
    </div>
  </main>
</template>
