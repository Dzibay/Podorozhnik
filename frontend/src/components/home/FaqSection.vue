<script setup>
import { homeCopy } from '../../data/home'

const { faq } = homeCopy
</script>

<template>
  <section id="faq" class="section2" data-section="faq">
    <div class="container">
      <div class="section2__head">
        <p class="kicker">{{ faq.kicker }}</p>
        <h2 class="section2__title">{{ faq.title }}</h2>
      </div>

      <div class="faq2-list">
        <details v-for="item in faq.items" :key="item.q" class="faq2-item">
          <summary class="faq2-item__q">
            {{ item.q }}
            <span class="faq2-item__marker" aria-hidden="true"></span>
          </summary>
          <p class="faq2-item__a">{{ item.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
