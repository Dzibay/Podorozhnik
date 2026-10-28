<script setup>
import { onMounted, ref } from 'vue'
import { nicheIndex } from 'virtual:niche-index'
import { contacts, footerNav, routes, site } from '../../data/site'
import { getService, keyServices } from '../../data/services'
import BrandMark from '../ui/BrandMark.vue'
import EmailChooser from '../ui/EmailChooser.vue'

// главные услуги — прямыми ссылками на их посадочные
const serviceLinks = keyServices.map(getService)

// год сборки совпадает с пререндером; после загрузки — текущий
const year = ref(__BUILD_YEAR__)
onMounted(() => (year.value = new Date().getFullYear()))

/** Градиентная «подсветка» гигантского логотипа следует за курсором */
function onMove(event) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--fx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--fy', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__call">
          <p class="kicker">Целевое действие — звонок</p>
          <a class="footer__phone" :href="contacts.phoneTel" data-cursor="Позвонить">
            {{ contacts.phoneDisplay }}
          </a>
          <p class="footer__hint">
            <span class="live-dot" aria-hidden="true" />
            Пн–Пт, 10:00–19:00 по Москве. В нерабочее время перезвоним утром.
          </p>
          <EmailChooser trigger-class="footer__email" />
        </div>

        <nav class="footer__cols" aria-label="Карта сайта">
          <div>
            <p class="footer__title">Услуги</p>
            <ul class="footer__list">
              <li v-for="item in serviceLinks" :key="item.slug">
                <RouterLink :to="routes.service(item.slug)">{{ item.shortTitle }}</RouterLink>
              </li>
              <li>
                <RouterLink :to="routes.services">Все услуги →</RouterLink>
              </li>
            </ul>
          </div>

          <div>
            <p class="footer__title">Ниши</p>
            <ul class="footer__list footer__list--2">
              <li v-for="niche in nicheIndex" :key="niche.slug">
                <RouterLink :to="routes.niche(niche.slug)">{{ niche.label }}</RouterLink>
              </li>
            </ul>
          </div>

          <div>
            <p class="footer__title">Компания</p>
            <ul class="footer__list">
              <li v-for="item in footerNav.company" :key="item.href">
                <RouterLink :to="item.href">{{ item.label }}</RouterLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <div class="footer__giant" aria-hidden="true" @pointermove="onMove">
      <span class="footer__giant-base">{{ site.wordmark }}</span>
      <span class="footer__giant-glow">{{ site.wordmark }}</span>
    </div>

    <div class="container">
      <div class="footer__bottom">
        <RouterLink :to="routes.home" class="brand">
          <BrandMark />
          <span class="brand__word">{{ site.wordmark }}</span>
        </RouterLink>
        <p class="footer__docs">
          <RouterLink :to="routes.privacy">Политика обработки персональных данных</RouterLink>
          <RouterLink :to="routes.consent">Согласие на обработку данных</RouterLink>
        </p>
        <p>© {{ year }} {{ site.name }} · {{ site.brandLine }}</p>
      </div>
    </div>
  </footer>
</template>
