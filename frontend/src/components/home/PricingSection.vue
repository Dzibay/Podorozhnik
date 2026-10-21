<script setup>
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'

const { pricing, offer } = homeCopy
</script>

<template>
  <section id="pricing" class="sec sec--cream pricing" data-section="pricing">
    <div class="container">
      <header class="sec__head">
        <div>
          <p v-reveal class="kicker">{{ pricing.kicker }}</p>
          <h2 v-reveal class="h-1">Абонентка <em>без сюрпризов</em></h2>
        </div>
        <p v-reveal class="sec__lead">{{ pricing.lead }}</p>
      </header>

      <ol class="plans">
        <li
          v-for="(plan, index) in pricing.plans"
          :key="plan.id"
          v-reveal
          class="plan"
          :class="{ 'plan--featured': plan.featured }"
          :style="{ '--i': index }"
          data-spot
        >
          <span class="plan__top">
            <span class="mono">{{ String(index + 1).padStart(2, '0') }}</span>
            <span v-if="plan.featured" class="plan__badge mono">Чаще всего</span>
          </span>
          <h3 class="plan__name">{{ plan.name }}</h3>
          <p class="plan__price">{{ plan.price.replace('/мес', '') }}<small>/мес</small></p>
          <ul class="plan__list">
            <li v-for="item in plan.includes" :key="item">{{ item }}</li>
          </ul>
          <p class="plan__for">{{ plan.forWhom }}</p>
        </li>
      </ol>

      <div v-reveal class="pricing__offer">
        <div class="pricing__offer-badge" aria-hidden="true">
          <span>24</span>
          <small>часа</small>
        </div>
        <div>
          <p class="h-3">{{ offer.title }} — разовая работа</p>
          <p class="pricing__offer-text">{{ offer.lead }} {{ offer.note }}</p>
        </div>
        <a class="button" :href="contacts.phoneTel">Узнать цену по телефону</a>
      </div>
    </div>
  </section>
</template>
