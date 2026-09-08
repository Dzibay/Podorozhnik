<script setup>
import { homeCopy } from '../../data/home'
import { routes } from '../../data/site'

const { forWhom } = homeCopy
</script>

<template>
  <section id="for-whom" class="section2" data-section="forwhom">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ forWhom.kicker }}</p>
        <h2 class="section2__title">{{ forWhom.title }}</h2>
        <p class="section2__lead">{{ forWhom.lead }}</p>
      </div>

      <div class="niche2-grid">
        <RouterLink
          v-for="(niche, index) in forWhom.niches"
          :key="niche.id"
          class="card2 niche2-card"
          :to="routes.niche(niche.slug)"
        >
          <span class="card2__index">0{{ index + 1 }}</span>
          <h3 class="niche2-card__title">{{ niche.title }}</h3>
          <p class="niche2-card__text">{{ niche.text }}</p>
          <ul class="niche2-card__tags">
            <li v-for="tag in niche.tags" :key="tag">{{ tag }}</li>
          </ul>
          <span class="card2__arrow" aria-hidden="true">&rarr;</span>
        </RouterLink>
      </div>

      <p class="note2">{{ forWhom.note }}</p>
    </div>
  </section>
</template>
