<script setup>
import { homeCopy } from '../../data/home'
import { contacts, routes } from '../../data/site'
import LeadForm from '../ui/LeadForm.vue'
import EmailChooser from '../ui/EmailChooser.vue'

const { cta } = homeCopy

function downloadChecklist() {
  const link = document.createElement('a')
  link.href = cta.checklist.pdfUrl
  link.download = 'checklist-10-tochek-rosta.pdf'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>

<template>
  <section id="cta" class="cta2 cta2--forms" data-section="cta">
    <div class="cta2__glow" aria-hidden="true"></div>

    <div class="container">
      <div class="cta2__intro">
        <p class="kicker">{{ cta.kicker }}</p>
        <h2 class="cta2__title">{{ cta.title }}</h2>
        <p class="cta2__lead">{{ cta.lead }}</p>
      </div>

      <div class="cta2-forms">
        <article class="card2 cta2-panel">
          <div class="cta2-panel__bg cta2-panel__bg--audit" aria-hidden="true" />
          <p class="cta2-panel__label">{{ cta.audit.title }}</p>
          <p class="cta2-panel__text">{{ cta.audit.text }}</p>
          <LeadForm
            :submit-label="cta.audit.submit"
            show-website-field
            source-suffix="#audit"
            success-message="Заявка на аудит отправлена. Свяжемся в течение рабочего дня."
          />
          <p class="cta2-panel__note">{{ cta.audit.note }}</p>
        </article>

        <article class="card2 cta2-panel">
          <div class="cta2-panel__bg cta2-panel__bg--checklist" aria-hidden="true" />
          <p class="cta2-panel__label">{{ cta.checklist.title }}</p>
          <p class="cta2-panel__text">{{ cta.checklist.text }}</p>
          <LeadForm
            :submit-label="cta.checklist.submit"
            :preset-comment="cta.checklist.comment"
            :show-comment="false"
            source-suffix="#checklist"
            success-message="Чек-лист отправлен на скачивание. Если файл не открылся — напишите нам."
            @success="downloadChecklist"
          />
          <p class="cta2-panel__note">{{ cta.checklist.note }}</p>
        </article>
      </div>

      <div class="cta2-contacts">
        <a class="cta2-contacts__phone" :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        <EmailChooser trigger-class="cta2-contacts__email" />
        <RouterLink class="cta2-contacts__link" :to="routes.services">Все услуги</RouterLink>
      </div>
    </div>

    <p class="cta2__giant" aria-hidden="true">ПОДОРОЖНИК</p>
  </section>
</template>
