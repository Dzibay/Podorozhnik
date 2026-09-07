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
  <main id="main" class="page page--service">
    <div v-if="service" class="container service-detail">
      <nav class="service-crumb" aria-label="Навигация">
        <RouterLink :to="routes.services">Услуги</RouterLink>
        <span class="service-crumb__sep" aria-hidden="true">/</span>
        <RouterLink v-if="group" :to="`${routes.services}#${group.id}`">
          {{ group.title }}
        </RouterLink>
        <template v-if="group">
          <span class="service-crumb__sep" aria-hidden="true">/</span>
        </template>
        <span class="service-crumb__current">{{ service.shortTitle }}</span>
      </nav>

      <header class="service-hero">
        <p class="kicker">{{ group?.title || 'Услуга' }}</p>
        <h1 class="service-hero__title">{{ service.title }}</h1>
        <p class="service-hero__lead">{{ service.lead }}</p>
      </header>

      <div class="service-body">
        <section class="service-block">
          <h2 class="service-block__title">Что делаем</h2>
          <p class="service-block__text">{{ service.description }}</p>
        </section>

        <section class="service-block">
          <h2 class="service-block__title">Что получите</h2>
          <ul class="service-outcomes">
            <li v-for="item in service.outcomes" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="service-block">
          <h2 class="service-block__title">Для кого</h2>
          <p class="service-block__text">{{ service.forWhom }}</p>
        </section>
      </div>

      <section class="service-cta">
        <div class="service-cta__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="service-cta__title">Обсудить эту задачу</h2>
          <p class="service-cta__lead">
            Расскажите контекст — предложим объём, этапы и следующий шаг.
          </p>
        </div>
        <div class="service-cta__actions">
          <AppButton
            class="service-cta__button"
            :href="routes.contacts"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            Обсудить
            <span class="service-cta__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton
            class="service-cta__button"
            :href="routes.services"
            variant="outline"
            event-name=""
          >
            Все услуги
            <span class="service-cta__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
