<script setup>
import { casesCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'
</script>

<template>
  <main id="main" class="page">
    <div class="container page__narrow">
      <header class="page__intro">
        <p class="kicker">{{ casesCopy.kicker }}</p>
        <h1>{{ casesCopy.title }}</h1>
        <p class="lead">{{ casesCopy.lead }}</p>
      </header>
      <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
        Обсудить проект
      </AppButton>
    </div>
  </main>
</template>
