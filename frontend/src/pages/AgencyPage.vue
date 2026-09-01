<script setup>
import { agencyCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'
</script>

<template>
  <main id="main" class="page">
    <div class="container page__narrow">
      <header class="page__intro">
        <p class="kicker">{{ agencyCopy.kicker }}</p>
        <h1>{{ agencyCopy.title }}</h1>
        <p class="lead">{{ agencyCopy.lead }}</p>
      </header>

      <ul class="stack">
        <li v-for="item in agencyCopy.principles" :key="item.title" class="stack__item">
          <h2>{{ item.title }}</h2>
          <p>{{ item.text }}</p>
        </li>
      </ul>

      <div class="button-row">
        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          Обсудить проект
        </AppButton>
        <AppButton :href="routes.services" variant="secondary" event-name="">
          Услуги
        </AppButton>
      </div>
    </div>
  </main>
</template>
