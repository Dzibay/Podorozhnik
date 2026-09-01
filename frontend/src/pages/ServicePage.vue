<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsEvents, routes } from '../data/site'
import { getGroup, getService } from '../data/services'
import AppButton from '../components/ui/AppButton.vue'

const route = useRoute()
const service = computed(() => getService(route.params.slug))
const group = computed(() => (service.value ? getGroup(service.value.group) : null))
</script>

<template>
  <main id="main" class="page">
    <div v-if="service" class="container page__narrow">
      <p class="kicker">
        <RouterLink :to="routes.services">Услуги</RouterLink>
        <template v-if="group"> / {{ group.title }}</template>
      </p>
      <h1>{{ service.title }}</h1>
      <p class="lead">{{ service.lead }}</p>

      <section class="block">
        <h2>Что делаем</h2>
        <p>{{ service.description }}</p>
      </section>

      <section class="block">
        <h2>Что получите</h2>
        <ul class="bullets">
          <li v-for="item in service.outcomes" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="block">
        <h2>Для кого</h2>
        <p>{{ service.forWhom }}</p>
      </section>

      <section class="block block--cta">
        <h2>Обсудить эту задачу</h2>
        <p>Расскажите контекст — предложим объём, этапы и следующий шаг.</p>
        <div class="button-row">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            Обсудить
          </AppButton>
          <AppButton :href="routes.services" variant="secondary" event-name="">
            Все услуги
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
