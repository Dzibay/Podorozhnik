<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { analyticsEvents, routes } from '../data/site'
import { getGroup, getService } from '../data/services'
import { nicheList, nichePath } from '../data/niches'
import AppButton from '../components/ui/AppButton.vue'

const route = useRoute()
const service = computed(() => getService(route.params.slug))
const group = computed(() => (service.value ? getGroup(service.value.group) : null))
</script>

<template>
  <main id="main" class="page page--service">
    <div class="page-glow" aria-hidden="true"></div>
    <div v-if="service" class="container service2">
      <nav class="service2-crumb" aria-label="Навигация">
        <RouterLink :to="routes.services">Услуги</RouterLink>
        <span class="service2-crumb__sep" aria-hidden="true">/</span>
        <RouterLink v-if="group" :to="`${routes.services}#${group.id}`">
          {{ group.title }}
        </RouterLink>
        <template v-if="group">
          <span class="service2-crumb__sep" aria-hidden="true">/</span>
        </template>
        <span class="service2-crumb__current">{{ service.shortTitle }}</span>
      </nav>

      <header class="service2-hero">
        <p class="kicker">{{ group?.title || 'Услуга' }}</p>
        <h1 class="service2-hero__title">{{ service.title }}</h1>
        <p class="service2-hero__lead">{{ service.lead }}</p>
        <p v-if="service.price" class="service2-hero__price">{{ service.price }}</p>
      </header>

      <div class="service2-body">
        <section class="card2 service2-block">
          <span class="card2__index">01</span>
          <h2 class="service2-block__title">Что делаем</h2>
          <p class="service2-block__text">{{ service.description }}</p>
        </section>

        <section class="card2 service2-block">
          <span class="card2__index">02</span>
          <h2 class="service2-block__title">Что получите</h2>
          <ul class="service2-outcomes">
            <li v-for="item in service.outcomes" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="card2 service2-block">
          <span class="card2__index">03</span>
          <h2 class="service2-block__title">Для кого</h2>
          <p class="service2-block__text">{{ service.forWhom }}</p>
        </section>
      </div>

      <section class="service2-niches">
        <p class="kicker">Ниши</p>
        <h2 class="service2-niches__title">Чаще всего работаем с</h2>
        <div class="service2-niches__grid">
          <RouterLink
            v-for="niche in nicheList"
            :key="niche.slug"
            class="card2 service2-niche"
            :to="nichePath(niche.slug)"
          >
            <h3>{{ niche.label }}</h3>
            <span class="card2__arrow" aria-hidden="true">&rarr;</span>
          </RouterLink>
        </div>
      </section>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Обсудить эту задачу</h2>
          <p class="page-cta2__lead">
            Расскажите контекст — предложим объём, этапы и следующий шаг. Можно начать с бесплатного
            аудита.
          </p>
        </div>
        <div class="page-cta2__actions">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            Получить бесплатный аудит
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton :href="routes.services" variant="outline" event-name="">
            Все услуги
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
