<script setup>
import { analyticsEvents, routes } from '../data/site'
import { homeCopy } from '../data/home'
import { serviceGroups, getServicesByGroup } from '../data/services'
import AppButton from '../components/ui/AppButton.vue'
import HeroSection from '../components/home/HeroSection.vue'

const { pain, promise, capabilities, process, cases, cta } = homeCopy

const groups = serviceGroups.map((group) => ({
  ...group,
  items: getServicesByGroup(group.id),
}))
</script>

<template>
  <main id="main" class="home">
    <HeroSection />

    <!-- 2. Pain: узнавание проблемы -->
    <section id="pain" class="section" data-section="pain">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ pain.kicker }}</p>
          <h2>{{ pain.title }}</h2>
          <p class="lead">{{ pain.lead }}</p>
        </header>
        <ul class="stack">
          <li v-for="item in pain.items" :key="item.title" class="stack__item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- 3. Promise: наш ответ -->
    <section id="promise" class="section" data-section="promise">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ promise.kicker }}</p>
          <h2>{{ promise.title }}</h2>
          <p class="lead">{{ promise.lead }}</p>
        </header>
      </div>
    </section>

    <!-- 4. Capabilities: три столба + ссылки на услуги -->
    <section id="capabilities" class="section" data-section="capabilities">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ capabilities.kicker }}</p>
          <h2>{{ capabilities.title }}</h2>
          <p class="lead">{{ capabilities.lead }}</p>
        </header>

        <div v-for="group in groups" :key="group.id" class="capability-group">
          <h3>{{ group.title }}</h3>
          <p>{{ group.lead }}</p>
          <ul class="link-list">
            <li v-for="item in group.items" :key="item.slug">
              <RouterLink :to="routes.service(item.slug)">{{ item.shortTitle }}</RouterLink>
              <span> — {{ item.lead }}</span>
            </li>
          </ul>
        </div>

        <p class="section__more">
          <RouterLink :to="routes.services">Все услуги</RouterLink>
        </p>
      </div>
    </section>

    <!-- 5. Process -->
    <section id="process" class="section" data-section="process">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ process.kicker }}</p>
          <h2>{{ process.title }}</h2>
        </header>
        <ol class="process-list">
          <li v-for="(phase, index) in process.phases" :key="phase.id">
            <span class="process-list__num">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ phase.title }}</h3>
            <p>{{ phase.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 6. Cases teaser -->
    <section id="cases" class="section" data-section="cases">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ cases.kicker }}</p>
          <h2>{{ cases.title }}</h2>
          <p class="lead">{{ cases.lead }}</p>
        </header>
        <AppButton :href="routes.cases" variant="secondary" event-name="">
          {{ cases.cta }}
        </AppButton>
      </div>
    </section>

    <!-- 7. CTA -->
    <section id="cta" class="section" data-section="cta">
      <div class="container">
        <header class="section__head">
          <p class="kicker">{{ cta.kicker }}</p>
          <h2>{{ cta.title }}</h2>
          <p class="lead">{{ cta.lead }}</p>
        </header>
        <div class="button-row">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            {{ cta.primary }}
          </AppButton>
          <AppButton :href="routes.services" variant="secondary" event-name="">
            {{ cta.secondary }}
          </AppButton>
        </div>
      </div>
    </section>
  </main>
</template>
