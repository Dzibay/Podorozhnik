<script setup>
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'
import { nicheList, nichePath } from '../../data/niches'
import NicheIcon from '../ui/NicheIcon.vue'

const { niches: copy } = homeCopy
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

      <ul class="niches__grid">
        <li v-for="(niche, index) in nicheList" :key="niche.slug" v-reveal :style="{ '--i': index % 4 }">
          <RouterLink :to="nichePath(niche.slug)" class="niche" data-spot data-cursor="Смотреть">
            <span class="niche__top">
              <span class="niche__num mono">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="niche__arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </span>
            <NicheIcon :name="niche.card.icon" />
            <span class="niche__title">{{ niche.card.title }}</span>
            <span class="niche__text">{{ niche.card.text }}</span>
            <span class="niche__tags">
              <span v-for="tag in niche.card.tags" :key="tag">{{ tag }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>

      <p v-reveal class="niches__more">
        {{ copy.more }}
        <a class="button button--accent" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
      </p>
    </div>
  </section>
</template>
