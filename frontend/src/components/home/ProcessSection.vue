<script setup>
import { homeCopy } from '../../data/home'

const { process } = homeCopy
</script>

<template>
  <section id="process" class="section2" data-section="process">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ process.kicker }}</p>
        <h2 class="section2__title">{{ process.title }}</h2>
      </div>

      <ol class="process2-grid">
        <li v-for="(phase, index) in process.phases" :key="phase.id" class="card2 process2-card">
          <span class="process2-card__num">{{ index + 1 }}</span>
          <h3 class="process2-card__title">{{ phase.title }}</h3>
          <p class="process2-card__tagline">{{ phase.tagline }}</p>
          <p class="process2-card__text">{{ phase.text }}</p>
          <ul class="process2-card__tags">
            <li v-for="tag in phase.tags" :key="tag">{{ tag }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>
