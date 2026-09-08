<script setup>
import { analyticsEvents, routes } from '../data/site'
import { serviceGroups, getServicesByGroup } from '../data/services'
import AppButton from '../components/ui/AppButton.vue'

const groups = serviceGroups.map((group) => ({
  ...group,
  items: getServicesByGroup(group.id),
}))
</script>

<template>
  <main id="main" class="page page--services">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="page-hero2">
        <p class="kicker">Услуги</p>
        <h1 class="page-hero2__title">
          Трафик. Разработка. <span class="page-hero2__accent">Продажи.</span>
        </h1>
        <p class="page-hero2__lead">
          Четыре направления одного внешнего отдела: заявки, сайт, работа с вашим отделом продаж и
          стратегия. Выберите тему — разберём задачу и формат работы.
        </p>
      </header>

      <div class="svc-groups">
        <section
          v-for="(group, index) in groups"
          :id="group.id"
          :key="group.id"
          class="card2 svc-group"
        >
          <header class="svc-group__head">
            <span class="card2__index">0{{ index + 1 }}</span>
            <div>
              <h2 class="svc-group__title">{{ group.title }}</h2>
              <p class="svc-group__lead">{{ group.lead }}</p>
            </div>
          </header>

          <ul class="svc-list">
            <li v-for="item in group.items" :key="item.slug">
              <RouterLink class="svc-list__link" :to="routes.service(item.slug)">
                <span class="svc-list__copy">
                  <strong class="svc-list__name">{{ item.shortTitle }}</strong>
                  <span class="svc-list__desc">{{ item.lead }}</span>
                </span>
                <span class="svc-list__arrow" aria-hidden="true">&rarr;</span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Не уверены, с чего начать?</h2>
          <p class="page-cta2__lead">
            Начните с бесплатного экспресс-аудита: за 24 часа разберём ваш маркетинг и предложим
            план с цифрами.
          </p>
        </div>
        <div class="page-cta2__actions">
          <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
            Получить бесплатный аудит
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton :href="routes.agency" variant="outline" event-name="">
            Об агентстве
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
