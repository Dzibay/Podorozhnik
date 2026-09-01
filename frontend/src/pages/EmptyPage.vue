<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <main id="main" class="page">
    <div class="container page__body">
      <h1>{{ title }}</h1>
      <p v-if="description" class="lead">{{ description }}</p>
    </div>
  </main>
</template>
