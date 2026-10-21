<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { contacts, routes } from '../../data/site'
import { track } from '../../analytics/tracker'

const route = useRoute()
const enabled = computed(() => !route.meta.bare)
const hasTelegram = computed(() => Boolean(contacts.telegramUrl))

function onCall() {
  track('click_phone')
}

function onWrite() {
  track(hasTelegram.value ? 'click_telegram' : 'cta_discuss_project')
}
</script>

<template>
  <div v-if="enabled" class="site-float" aria-label="Быстрые действия">
    <a
      v-if="hasTelegram"
      class="site-float__fab"
      :href="contacts.telegramUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Telegram"
      @click="onWrite"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 6.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.2L12 21l3.8-3.5H18a3 3 0 0 0 3-3v-8Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </a>
    <RouterLink
      v-else
      class="site-float__fab"
      :to="routes.contacts"
      aria-label="Оставить заявку"
      @click="onWrite"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 6.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.2L12 21l3.8-3.5H18a3 3 0 0 0 3-3v-8Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </RouterLink>

    <div class="site-float__bar">
      <!-- звонок — главное действие, поэтому он шире и залит цветом -->
      <a class="site-float__btn site-float__btn--primary" :href="contacts.phoneTel" @click="onCall">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 3.5h3.2l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />
        </svg>
        Позвонить
      </a>
      <a
        v-if="hasTelegram"
        class="site-float__btn"
        :href="contacts.telegramUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="onWrite"
      >
        Telegram
      </a>
      <RouterLink
        v-else
        class="site-float__btn"
        :to="routes.contacts"
        @click="onWrite"
      >
        Заявка
      </RouterLink>
    </div>
  </div>
</template>
