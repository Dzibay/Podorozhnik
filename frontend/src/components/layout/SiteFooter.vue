<script setup>
import { contacts, footerNav, routes, site } from '../../data/site'
import { services } from '../../data/services'
import EmailChooser from '../ui/EmailChooser.vue'
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <RouterLink :to="routes.home" class="footer__brand">{{ site.wordmark }}</RouterLink>
          <p class="footer__tagline">{{ site.tagline }}</p>
          <div class="footer__contacts">
            <a class="footer__phone" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
            <EmailChooser trigger-class="footer__email" />
          </div>
        </div>

        <div>
          <p class="footer__title">Услуги</p>
          <ul class="footer__list">
            <li v-for="service in services" :key="service.slug">
              <RouterLink :to="routes.service(service.slug)">{{ service.shortTitle }}</RouterLink>
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
      </div>

      <div class="footer__bottom">
        <p>{{ site.brandLine }}</p>
        <p>© {{ new Date().getFullYear() }} {{ site.name }}</p>
      </div>
    </div>
  </footer>
</template>
