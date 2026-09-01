<script setup>
import { routes } from '../data/site'
import { serviceGroups, getServicesByGroup } from '../data/services'

const groups = serviceGroups.map((group) => ({
  ...group,
  items: getServicesByGroup(group.id),
}))
</script>

<template>
  <main id="main" class="page">
    <div class="container">
      <header class="page__intro">
        <p class="kicker">Услуги</p>
        <h1>Продукт. Система. Рост.</h1>
        <p class="lead">
          Три направления full-cycle digital. Выберите тему — на странице услуги разберём задачу,
          результат и формат работы.
        </p>
      </header>

      <section
        v-for="group in groups"
        :id="group.id"
        :key="group.id"
        class="services-group"
      >
        <header class="section__head">
          <h2>{{ group.title }}</h2>
          <p class="lead">{{ group.lead }}</p>
        </header>
        <ul class="service-index">
          <li v-for="item in group.items" :key="item.slug">
            <RouterLink :to="routes.service(item.slug)">
              <strong>{{ item.shortTitle }}</strong>
              <span>{{ item.lead }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
