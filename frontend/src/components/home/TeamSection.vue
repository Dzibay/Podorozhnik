<script setup>
import { homeCopy } from '../../data/home'

const { team, principles } = homeCopy
</script>

<template>
  <section id="team" class="section2" data-section="team">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ team.kicker }}</p>
        <h2 class="section2__title">{{ team.title }}</h2>
        <p class="section2__lead">{{ team.lead }}</p>
      </div>

      <div class="team2-grid">
        <article v-for="(member, index) in team.members" :key="member.role" class="card2 team2-card">
          <span class="card2__index">0{{ index + 1 }}</span>
          <h3 class="team2-card__role">{{ member.role }}</h3>
          <p class="team2-card__text">{{ member.text }}</p>
        </article>
      </div>

      <div class="principles2">
        <p class="kicker">{{ principles.kicker }}</p>
        <h2 class="principles2__title">{{ principles.title }}</h2>
        <div class="principles2-grid">
          <article v-for="item in principles.items" :key="item.title" class="principles2-item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
