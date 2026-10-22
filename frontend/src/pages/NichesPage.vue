<script setup>
import { contacts, routes } from '../data/site'
import { nicheList } from '../data/niches'
import { track } from '../analytics/tracker'
import NicheCard from '../components/ui/NicheCard.vue'
</script>

<template>
  <main id="main" class="page page--niches">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2">
        <p class="kicker">Ниши</p>
        <h1 class="page-hero2__title">
          Бизнес, который <span class="page-hero2__accent">стоит на земле</span>
        </h1>
        <p class="page-hero2__lead">
          Выберите свою нишу — покажем, откуда в ней берутся клиенты, что мешает им звонить и как мы
          это чиним.
        </p>
      </header>

      <ul class="niches__grid">
        <li v-for="(niche, index) in nicheList" :key="niche.slug" v-reveal :style="{ '--i': index % 4 }">
          <NicheCard :niche="niche" :num="index + 1" />
        </li>
      </ul>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Нет вашей ниши?</p>
          <h2 class="page-cta2__title">Позвоните — скажем честно</h2>
          <p class="page-cta2__lead">
            За 15 минут разберёмся, сможем ли привести вам клиентов, и с чего начать.
          </p>
        </div>
        <div class="page-cta2__actions">
          <a class="button button--primary" :href="contacts.phoneTel" @click="track('click_phone', { place: 'niches-cta' })">
            Позвонить<span class="cta-num">&nbsp;{{ contacts.phoneDisplay }}</span>
          </a>
          <RouterLink class="button button--outline" :to="routes.services">Все услуги</RouterLink>
        </div>
      </section>
    </div>
  </main>
</template>
