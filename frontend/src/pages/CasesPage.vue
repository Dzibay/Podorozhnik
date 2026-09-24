<script setup>
import { computed, ref } from 'vue'
import { caseNiches, casesByNiche } from '../data/cases'
import { casesCopy } from '../data/home'
import { analyticsEvents, routes } from '../data/site'
import AppButton from '../components/ui/AppButton.vue'

const activeNiche = ref('all')
const filtered = computed(() => casesByNiche(activeNiche.value))
</script>

<template>
  <main id="main" class="page page--cases">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2 cases-page__head">
        <p class="kicker">{{ casesCopy.kicker }}</p>
        <h1 class="page-hero2__title">
          Кейсы <span class="page-hero2__accent">с цифрами</span>
        </h1>
        <p class="page-hero2__lead">{{ casesCopy.lead }}</p>

        <div class="cases-filter" role="tablist" aria-label="Фильтр по нише">
          <button
            v-for="niche in caseNiches"
            :key="niche.id"
            type="button"
            class="cases-filter__btn"
            :class="{ 'cases-filter__btn--on': activeNiche === niche.id }"
            role="tab"
            :aria-selected="activeNiche === niche.id"
            @click="activeNiche = niche.id"
          >
            {{ niche.label }}
          </button>
        </div>
      </header>

      <div class="cases-grid">
        <RouterLink
          v-for="(item, index) in filtered"
          :key="item.id"
          class="card2 cases-card"
          :to="routes.case(item.slug)"
        >
          <div class="cases-card__top">
            <span class="card2__index">0{{ index + 1 }}</span>
            <span class="cases-card__badge">{{ item.nicheLabel }}</span>
          </div>
          <h2 class="cases-card__title">{{ item.title }}</h2>
          <p class="cases-card__meta">{{ item.client }} · {{ item.period }}</p>
          <div class="cases-card__stats">
            <p class="cases-card__metric">{{ item.preview.metric }}</p>
            <p class="cases-card__result">{{ item.preview.result }}</p>
          </div>
          <p class="cases-card__more">Смотреть кейс →</p>
        </RouterLink>
      </div>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Разберём вашу нишу так же</h2>
          <p class="page-cta2__lead">
            Бесплатный аудит за 24 часа: где теряются деньги и какой формат работы подойдёт.
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
