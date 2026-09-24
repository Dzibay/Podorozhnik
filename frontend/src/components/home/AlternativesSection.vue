<script setup>
import { homeCopy } from '../../data/home'

const { alternatives } = homeCopy
</script>

<template>
  <section id="alternatives" class="section2" data-section="alternatives">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ alternatives.kicker }}</p>
        <h2 class="section2__title">{{ alternatives.title }}</h2>
        <p class="section2__lead">{{ alternatives.lead }}</p>
      </div>

      <div class="alt2-grid">
        <article
          v-for="(item, index) in alternatives.items"
          :key="item.title"
          class="card2 alt2-card"
        >
          <span class="card2__index">0{{ index + 1 }}</span>
          <h3 class="alt2-card__title">{{ item.title }}</h3>
          <p class="alt2-card__text">{{ item.text }}</p>
        </article>
      </div>

      <p class="note2">{{ alternatives.summary }}</p>
    </div>
  </section>
</template>
