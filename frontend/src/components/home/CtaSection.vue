<script setup>
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'
import { track } from '../../analytics/tracker'
import LeadForm from '../ui/LeadForm.vue'

const { cta } = homeCopy

function onCall() {
  track('click_phone', { place: 'cta' })
}
</script>

<template>
  <section id="cta" class="sec sec--dark final grain" data-section="cta">
    <div class="final__glow" aria-hidden="true" />
    <div class="container final__layout">
      <div class="final__main">
        <p v-reveal class="kicker">{{ cta.kicker }}</p>
        <h2 v-reveal class="h-2 final__title">
          {{ cta.titleStart }} <em>{{ cta.titleAccent }}</em>
        </h2>
        <p v-reveal class="final__lead">{{ cta.lead }}</p>

        <a
          v-reveal
          v-magnetic="0.12"
          class="final__phone"
          :href="contacts.phoneTel"
          data-cursor="Звоним"
          @click="onCall"
        >
          <span class="live-dot" aria-hidden="true" />
          {{ contacts.phoneDisplay }}
        </a>
        <p v-reveal class="mono final__hours">{{ cta.hours }}</p>
      </div>

      <div v-reveal class="final__form">
        <p class="h-3">{{ cta.form.title }}</p>
        <LeadForm
          :submit-label="cta.form.submit"
          :show-comment="false"
          source-suffix="#callback"
          :success-message="cta.form.success"
        />
        <p class="final__note">{{ cta.form.note }}</p>
      </div>
    </div>
  </section>
</template>
