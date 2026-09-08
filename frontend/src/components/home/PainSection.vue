<script setup>
import { homeCopy } from '../../data/home'

const { pain } = homeCopy
</script>

<template>
  <section id="pain" class="section2" data-section="pain">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ pain.kicker }}</p>
        <h2 class="section2__title">{{ pain.title }}</h2>
        <p class="section2__lead">{{ pain.lead }}</p>
      </div>

      <div class="pain2-grid">
        <article v-for="(item, index) in pain.items" :key="item.title" class="card2 pain2-card">
          <span class="card2__index">0{{ index + 1 }}</span>
          <h3 class="pain2-card__title">{{ item.title }}</h3>
          <p class="pain2-card__text">{{ item.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
