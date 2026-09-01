<script setup>
import { contactsCopy } from '../data/home'
import LeadForm from '../components/ui/LeadForm.vue'
</script>

<template>
  <main id="main" class="page">
    <div class="container page__narrow">
      <header class="page__intro">
        <p class="kicker">{{ contactsCopy.kicker }}</p>
        <h1>{{ contactsCopy.title }}</h1>
        <p class="lead">{{ contactsCopy.lead }}</p>
      </header>
      <LeadForm />
    </div>
  </main>
</template>
