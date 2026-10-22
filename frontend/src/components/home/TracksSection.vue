<script setup>
import { homeCopy } from '../../data/home'
import { routes } from '../../data/site'
import { getService, serviceTracks } from '../../data/services'
import ServicePreview from '../services/ServicePreview.vue'

const { tracks: copy } = homeCopy

/** Два направления сразу под первым экраном: сцена, четыре главные услуги и ссылка на все */
const tracks = serviceTracks.map((item, index) => {
  const pick = copy.picks[item.id]
  return {
    ...item,
    index: String(index + 1).padStart(2, '0'),
    preview: pick.preview,
    total: item.items.length,
    links: pick.slugs.map((slug) => ({
      service: getService(slug),
      tag: item.items.find((card) => card.slug === slug)?.tag,
    })),
  }
})
</script>

<template>
  <section id="tracks" class="sec tracks" data-section="tracks" aria-labelledby="tracks-title">
    <div class="container">
      <header class="sec__head">
        <div>
          <p v-reveal class="kicker">{{ copy.kicker }}</p>
          <h2 id="tracks-title" v-reveal class="h-1">
            {{ copy.titleStart }} <em>{{ copy.titleAccent }}</em>
          </h2>
        </div>
        <p v-reveal class="sec__lead">{{ copy.lead }}</p>
      </header>

      <div class="tracks__grid">
        <article
          v-for="(item, i) in tracks"
          :key="item.id"
          v-reveal
          v-play
          class="track"
          :class="`track--${item.id}`"
          :style="{ '--i': i }"
        >
          <div class="track__head">
            <span class="track__index mono">{{ item.index }} · {{ item.caption }}</span>
            <h3 class="track__title">{{ item.title }}</h3>
          </div>

          <div class="track__stage"><ServicePreview :kind="item.preview" /></div>

          <ul class="track__list">
            <li v-for="link in item.links" :key="link.service.slug">
              <RouterLink :to="routes.service(link.service.slug)" class="track__link">
                <span class="track__name">{{ link.service.shortTitle }}</span>
                <span class="track__tag">{{ link.tag }}</span>
                <span class="track__arrow" aria-hidden="true">&rarr;</span>
              </RouterLink>
            </li>
          </ul>

          <RouterLink :to="`${routes.services}#${item.id}`" class="track__all">
            Все услуги направления · {{ item.total }} <span aria-hidden="true">&rarr;</span>
          </RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>
