<script setup>
import { analyticsEvents, routes } from '../../data/site'
import { homeCopy } from '../../data/home'
import AppButton from '../ui/AppButton.vue'

const { economics } = homeCopy
</script>

<template>
  <section id="economics" class="section2" data-section="economics">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ economics.kicker }}</p>
        <h2 class="section2__title">{{ economics.title }}</h2>
        <p class="section2__lead">{{ economics.lead }}</p>
      </div>

      <div class="econ2-hero">
        <article class="econ2-hero__side econ2-hero__side--them">
          <p class="econ2-hero__label">{{ economics.compare.them.label }}</p>
          <p class="econ2-hero__sum">{{ economics.compare.them.total }}</p>
          <p class="econ2-hero__note">{{ economics.compare.them.note }}</p>
        </article>

        <div class="econ2-hero__gap" aria-hidden="true">
          <span>vs</span>
        </div>

        <article class="econ2-hero__side econ2-hero__side--us">
          <p class="econ2-hero__label">{{ economics.compare.us.label }}</p>
          <p class="econ2-hero__sum econ2-hero__sum--green">{{ economics.compare.us.total }}</p>
          <p class="econ2-hero__note">{{ economics.compare.us.note }}</p>
        </article>
      </div>

      <p class="econ2-saving">{{ economics.saving }}</p>

      <div class="econ2-details">
        <article class="econ2-detail">
          <h3>{{ economics.staff.title }}</h3>
          <div v-for="group in economics.staff.groups" :key="group.title" class="econ2-detail__group">
            <p class="econ2-detail__group-title">{{ group.title }}</p>
            <ul>
              <li v-for="item in group.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>

        <article class="econ2-detail econ2-detail--us">
          <h3>{{ economics.agency.title }}</h3>
          <div class="econ2-tariffs">
            <div v-for="plan in economics.agency.plans" :key="plan.name" class="econ2-tariff">
              <span class="econ2-tariff__name">{{ plan.name }}</span>
              <span class="econ2-tariff__price">{{ plan.price }}</span>
            </div>
          </div>
          <ul class="econ2-detail__list">
            <li v-for="item in economics.agency.includes" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>

      <div class="econ2-foot">
        <ul class="econ2-extras">
          <li v-for="item in economics.extras" :key="item">{{ item }}</li>
        </ul>
        <AppButton :href="routes.contacts" :event-name="analyticsEvents.ctaDiscussProject">
          {{ economics.cta }}
          <span aria-hidden="true">&rarr;</span>
        </AppButton>
      </div>
    </div>
  </section>
</template>
