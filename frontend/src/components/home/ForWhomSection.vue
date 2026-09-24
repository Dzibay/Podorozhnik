<script setup>
import { homeCopy } from '../../data/home'
import { routes } from '../../data/site'

const { forWhom } = homeCopy

function nicheTo(niche) {
  if (niche.to === 'contacts' || !niche.slug) return routes.contacts
  return routes.niche(niche.slug)
}
</script>

<template>
  <section id="for-whom" class="section2" data-section="forwhom">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ forWhom.kicker }}</p>
        <h2 class="section2__title">{{ forWhom.title }}</h2>
        <p class="section2__lead">{{ forWhom.lead }}</p>
      </div>

      <div class="niche2-grid niche2-grid--3">
        <RouterLink
          v-for="(niche, index) in forWhom.niches"
          :key="niche.id"
          class="card2 card2--art niche2-card"
          :to="nicheTo(niche)"
        >
          <img
            class="card2__art"
            :src="niche.icon"
            alt=""
            width="256"
            height="256"
            loading="lazy"
            aria-hidden="true"
          />
          <span class="card2__index">0{{ index + 1 }}</span>
          <h3 class="niche2-card__title">{{ niche.title }}</h3>
          <p class="niche2-card__text">{{ niche.text }}</p>
          <p v-if="niche.metric" class="niche2-card__metric">{{ niche.metric }}</p>
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
