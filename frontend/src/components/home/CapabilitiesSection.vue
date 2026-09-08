<script setup>
import { routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import { serviceGroups, getServicesByGroup } from '../../data/services'

const { capabilities } = homeCopy

const icons = {
  traffic: '/img/icon-traffic.png?v=2',
  dev: '/img/icon-dev.png?v=2',
  sales: '/img/icon-sales.png?v=2',
  strategy: '/img/icon-strategy.png?v=2',
}

const groups = serviceGroups.map((group) => ({
  ...group,
  icon: icons[group.id],
  items: getServicesByGroup(group.id),
}))
</script>

<template>
  <section id="capabilities" class="section2" data-section="capabilities">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ capabilities.kicker }}</p>
        <h2 class="section2__title">{{ capabilities.title }}</h2>
        <p class="section2__lead">{{ capabilities.lead }}</p>
      </div>

      <div class="caps2-grid">
        <article
          v-for="(group, index) in groups"
          :key="group.id"
          class="card2 card2--art caps2-card"
        >
          <img
            class="card2__art"
            :src="group.icon"
            alt=""
            width="256"
            height="256"
            loading="lazy"
            aria-hidden="true"
          />
          <div class="caps2-card__head">
            <span class="card2__index">0{{ index + 1 }}</span>
            <h3 class="caps2-card__title">{{ group.title }}</h3>
          </div>
          <p class="caps2-card__lead">{{ group.lead }}</p>
          <ul class="caps2-card__list">
            <li v-for="item in group.items" :key="item.slug">
              <RouterLink :to="routes.service(item.slug)">
                {{ item.shortTitle }}
                <span aria-hidden="true">&rarr;</span>
              </RouterLink>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>
