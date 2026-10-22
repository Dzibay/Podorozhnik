<script setup>
import { homeCopy } from '../../data/home'
import { contacts, routes } from '../../data/site'
import { getNiche, nicheList } from '../../data/niches'
import NicheCard from '../ui/NicheCard.vue'

const { niches: copy } = homeCopy
const featured = copy.featured.map(getNiche)
</script>

<template>
  <section id="niches" class="sec niches" data-section="niches">
    <div class="container">
      <header class="sec__head">
        <div>
          <p v-reveal class="kicker">{{ copy.kicker }}</p>
          <h2 v-reveal.lines class="h-1 lines niches__title">
            <span v-for="(line, l) in copy.titleLines" :key="line">
              <span :style="{ '--l': l }">{{ line }}</span>
            </span>
          </h2>
        </div>
        <p v-reveal class="sec__lead">{{ copy.lead }}</p>
      </header>

      <ul class="niches__grid niches__grid--featured">
        <li v-for="(niche, index) in featured" :key="niche.slug" v-reveal :style="{ '--i': index % 3 }">
          <NicheCard :niche="niche" :num="index + 1" />
        </li>
      </ul>

      <div v-reveal class="niches__more">
        <RouterLink class="button button--primary niches__all" :to="routes.niches">
          {{ copy.all }} · {{ nicheList.length }} <span aria-hidden="true">&rarr;</span>
        </RouterLink>
        <p>
          {{ copy.more }}
          <a class="niches__phone" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        </p>
      </div>
    </div>
  </section>
</template>
