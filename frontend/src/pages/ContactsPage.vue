<script setup>
import { contactsCopy } from '../data/home'
import { contacts, routes } from '../data/site'
import LeadForm from '../components/ui/LeadForm.vue'
import EmailChooser from '../components/ui/EmailChooser.vue'
</script>

<template>
  <main id="main" class="page page--contacts">
    <div class="container contacts-layout">
      <header class="contacts-copy">
        <p class="kicker">{{ contactsCopy.kicker }}</p>
        <h1 class="contacts-copy__title">{{ contactsCopy.title }}</h1>
        <p class="contacts-copy__lead">{{ contactsCopy.lead }}</p>

        <div class="contacts-direct">
          <a class="contacts-direct__phone" :href="contacts.phoneTel">
            {{ contacts.phoneDisplay }}
          </a>
          <EmailChooser trigger-class="contacts-direct__email" />
        </div>

        <ul class="contacts-points">
          <li>Коротко опишите задачу и контекст</li>
          <li>Вернёмся с вопросами и предложением формата</li>
          <li>Без навязчивых созвонов «на всякий случай»</li>
        </ul>

        <p class="contacts-alt">
          Или посмотрите
          <RouterLink :to="routes.services">услуги</RouterLink>
          и
          <RouterLink :to="routes.agency">подход агентства</RouterLink>.
        </p>
      </header>

      <div class="contacts-panel">
        <LeadForm />
      </div>
    </div>
  </main>
</template>
