<script setup>
import { onMounted, ref } from 'vue'
import { contactsCopy, homeCopy } from '../data/home'
import { contacts } from '../data/site'
import { track } from '../analytics/tracker'
import { workStatus } from '../utils/workHours'
import LeadForm from '../components/ui/LeadForm.vue'
import EmailChooser from '../components/ui/EmailChooser.vue'

const hours = homeCopy.cta.hours

// в готовом HTML — «на связи»; рабочее время по Москве проверяем уже в браузере
const online = ref(true)
const back = ref('утром')
onMounted(() => {
  const now = workStatus()
  online.value = now.online
  back.value = now.back
})

const steps = [
  { title: 'Разговор на 15 минут', text: 'Спросим про бизнес, цифры и то, что уже пробовали. Без презентаций и скриптов.' },
  { title: 'Разбор за 24 часа', text: 'Покажем, где теряются заявки и деньги, и какой формат работы даст результат быстрее.' },
  { title: 'Решение — за вами', text: 'План с цифрами остаётся у вас, даже если дальше не сработаемся.' },
]
</script>

<template>
  <main id="main" class="page ct">
    <section class="container ct-hero">
      <div class="ct-hero__copy">
        <p v-reveal class="kicker">{{ contactsCopy.kicker }}</p>
        <h1 v-reveal.lines class="ct-hero__title lines">
          <span><span>Один звонок —</span></span>
          <span><span :style="{ '--l': 1 }"><em>и понятно,</em></span></span>
          <span><span :style="{ '--l': 2 }">что делать</span></span>
        </h1>
        <p v-reveal class="ct-hero__lead">{{ contactsCopy.lead }}</p>

        <a
          v-reveal
          v-magnetic="0.1"
          class="ct-phone"
          :href="contacts.phoneTel"
          data-cursor="Звоним"
          @click="track('click_phone', { place: 'contacts' })"
        >
          {{ contacts.phoneDisplay }}
        </a>
        <p v-reveal class="ct-status mono" :class="{ 'ct-status--off': !online }">
          <span class="live-dot" aria-hidden="true" />
          {{ online ? 'Сейчас на связи' : `Сейчас не в офисе — перезвоним ${back}` }} · {{ hours }}
        </p>

        <div class="ct-channels">
          <a
            v-if="contacts.telegramUrl"
            v-reveal
            class="ct-channel"
            :href="contacts.telegramUrl"
            target="_blank"
            rel="noopener noreferrer"
            style="--i: 0"
            @click="track('click_telegram', { place: 'contacts' })"
          >
            <span class="ct-channel__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 4 3 11l6 2.2M21 4l-3 16-9-6.8M21 4 9 13.2V19l3.2-3.6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="ct-channel__label mono">Telegram</span>
            <span class="ct-channel__value">Написать в чат</span>
          </a>
          <div v-reveal class="ct-channel" style="--i: 1">
            <span class="ct-channel__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" stroke-width="1.6" />
                <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="ct-channel__label mono">Почта</span>
            <EmailChooser trigger-class="ct-channel__value ct-channel__email" />
          </div>
          <a v-reveal class="ct-channel" href="#lead" style="--i: 2">
            <span class="ct-channel__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.6 3.1 3.9 5.4 7 7l2.3-2.3c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.6c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="ct-channel__label mono">Обратный звонок</span>
            <span class="ct-channel__value">Перезвоните мне</span>
          </a>
        </div>
      </div>

      <div id="lead" v-reveal class="ct-form">
        <div class="ct-form__glow" aria-hidden="true" />
        <p class="mono ct-form__label">Заявка на бесплатный аудит</p>
        <p class="ct-form__title">Оставьте телефон — <em>перезвоним</em> и разберём задачу</p>
        <LeadForm submit-label="Жду звонка" />
      </div>
    </section>

    <section class="container ct-steps">
      <p v-reveal class="kicker">После звонка</p>
      <ol class="ct-steps__list">
        <li v-for="(step, i) in steps" :key="step.title" v-reveal class="ct-step" :style="{ '--i': i }">
          <span class="ct-step__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <h2 class="ct-step__title">{{ step.title }}</h2>
          <p class="ct-step__text">{{ step.text }}</p>
        </li>
      </ol>
    </section>
  </main>
</template>
