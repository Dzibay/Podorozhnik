<script setup>
import { contactsCopy } from '../data/home'
import { contacts, routes } from '../data/site'
import LeadForm from '../components/ui/LeadForm.vue'
import EmailChooser from '../components/ui/EmailChooser.vue'
</script>

<template>
  <main id="main" class="page page--contacts">
    <div class="page-glow page-glow--left" aria-hidden="true"></div>
    <div class="container contacts2">
      <header class="contacts2-copy">
        <p class="kicker">{{ contactsCopy.kicker }}</p>
        <h1 class="contacts2-copy__title">
          Начните с <span class="page-hero2__accent">бесплатного аудита</span>
        </h1>
        <p class="contacts2-copy__lead">{{ contactsCopy.lead }}</p>

        <div class="contacts2-direct">
          <a class="contacts2-direct__phone" :href="contacts.phoneTel">
            {{ contacts.phoneDisplay }}
          </a>
          <EmailChooser trigger-class="contacts2-direct__email" />
        </div>

        <ul class="contacts2-points">
          <li>Коротко опишите задачу и контекст</li>
          <li>За 24 часа — разбор и план с цифрами</li>
          <li>Разбор ваш, даже если дальше не сработаемся</li>
        </ul>

        <p class="contacts2-alt">
          Или посмотрите
          <RouterLink :to="routes.services">услуги</RouterLink>
          и
          <RouterLink :to="routes.agency">подход агентства</RouterLink>.
        </p>
      </header>

      <div class="card2 contacts2-panel">
        <p class="contacts2-panel__label">Заявка на аудит</p>
        <LeadForm submit-label="Получить бесплатный аудит" />
      </div>
    </div>
  </main>
</template>
