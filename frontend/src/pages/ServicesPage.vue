<script setup>
import { contacts, routes } from '../data/site'
import { getService, serviceTracks } from '../data/services'
import { getProduct } from '../data/products'
import { track } from '../analytics/tracker'
import AppButton from '../components/ui/AppButton.vue'
import ServicePreview from '../components/services/ServicePreview.vue'
import '../styles/services-hub.css'

/** Хаб услуг: два направления, у каждой услуги карточка с живым мини-превью */
const tracks = serviceTracks.map((item, index) => ({
  ...item,
  index: String(index + 1).padStart(2, '0'),
  cards: item.items.map((card) => {
    const service = getService(card.slug)
    // у IT-посадочных своя палитра — превью красим в их акцент
    const accent = getProduct(card.slug)?.theme.accent
    return { ...card, service, style: accent ? { '--sp-accent': accent } : null }
  }),
}))

// как направления работают вместе: от первого клика до отчёта
const chain = [
  { slug: 'yandex-direct', label: 'Реклама и SEO', text: 'приводят людей, которые уже ищут' },
  { slug: 'site-24h', label: 'Сайт', text: 'отвечает на вопросы и подводит к звонку' },
  { slug: 'telegram-bots', label: 'Бот и CRM', text: 'принимают заявку и не дают ей потеряться' },
  { slug: 'analytics', label: 'Аналитика', text: 'показывает, что окупилось, а что нет' },
]

function onCall(place) {
  track('click_phone', { place: `services-${place}` })
}
</script>

<template>
  <main id="main" class="page page--services">
    <div class="page-glow" aria-hidden="true"></div>
    <div class="container">
      <header class="hub-hero">
        <p class="kicker">Услуги</p>
        <h1 class="hub-hero__title">
          Приводим клиентов. <span class="page-hero2__accent">Автоматизируем</span> всё, что после.
        </h1>
        <p class="hub-hero__lead">
          Два направления одной команды. Можно взять одно — или связать оба, чтобы заявка шла от
          рекламы до оплаты без ручной работы.
        </p>

        <nav class="hub-tracks" aria-label="Направления">
          <a
            v-for="item in tracks"
            :key="item.id"
            class="hub-track"
            :class="`hub-track--${item.id}`"
            :href="`#${item.id}`"
          >
            <span class="hub-track__index">{{ item.index }}</span>
            <span class="hub-track__caption">{{ item.caption }}</span>
            <strong class="hub-track__title">{{ item.title }}</strong>
            <span class="hub-track__list">
              <span v-for="card in item.cards" :key="card.slug">{{ card.service.shortTitle }}</span>
            </span>
            <span class="hub-track__more">{{ item.cards.length }} услуг <span aria-hidden="true">&darr;</span></span>
          </a>
        </nav>
      </header>

      <section
        v-for="item in tracks"
        :id="item.id"
        :key="item.id"
        class="hub-section"
        :class="`hub-section--${item.id}`"
        :aria-labelledby="`${item.id}-title`"
      >
        <header class="hub-section__head">
          <span class="hub-section__index">{{ item.index }}</span>
          <div>
            <h2 :id="`${item.id}-title`" class="hub-section__title">{{ item.title }}</h2>
            <p class="hub-section__lead">{{ item.lead }}</p>
          </div>
        </header>

        <ul class="hub-grid">
          <li
            v-for="card in item.cards"
            :key="card.slug"
            v-play
            class="hub-card"
            :class="{ 'hub-card--wide': card.wide }"
            :style="card.style"
          >
            <RouterLink class="hub-card__link" :to="routes.service(card.slug)">
              <span class="hub-card__stage"><ServicePreview :kind="card.preview" /></span>
              <span class="hub-card__body">
                <span class="hub-card__tag">{{ card.tag }}</span>
                <strong class="hub-card__name">{{ card.service.shortTitle }}</strong>
                <span class="hub-card__lead">{{ card.service.lead }}</span>
                <span class="hub-card__more">Подробнее <span aria-hidden="true">&rarr;</span></span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="hub-chain" aria-labelledby="chain-title">
        <p class="kicker">Вместе</p>
        <h2 id="chain-title" class="hub-chain__title">Сильнее всего — когда направления связаны</h2>
        <ol class="hub-chain__list">
          <li v-for="(step, i) in chain" :key="step.slug" :style="{ '--i': i }">
            <RouterLink :to="routes.service(step.slug)">
              <span class="hub-chain__num">{{ i + 1 }}</span>
              <strong>{{ step.label }}</strong>
              <span>{{ step.text }}</span>
            </RouterLink>
          </li>
        </ol>
      </section>

      <section class="page-cta2">
        <div class="page-cta2__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="page-cta2__title">Не уверены, с чего начать?</h2>
          <p class="page-cta2__lead">
            Позвоните — за 15 минут разберёмся, что даст результат быстрее всего. Или начните с
            бесплатного экспресс-аудита: за 24 часа покажем, где теряются заявки.
          </p>
        </div>
        <div class="page-cta2__actions">
          <!-- tel: — обычная ссылка, RouterLink её бы не открыл -->
          <a class="button button--primary" :href="contacts.phoneTel" @click="onCall('cta')">
            Позвонить<span class="cta-num">&nbsp;{{ contacts.phoneDisplay }}</span>
          </a>
          <AppButton :href="routes.service('express-audit')" variant="outline" event-name="">
            Бесплатный аудит
            <span aria-hidden="true">&rarr;</span>
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
