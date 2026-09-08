<script setup>
import { homeCopy } from '../../data/home'

const { promise } = homeCopy

const before = ['сайтщик', 'директолог', 'сеошник', 'аналитик', 'аккаунт']
</script>

<template>
  <section id="promise" class="section2" data-section="promise">
    <div class="container">
      <div class="promise2">
        <div class="promise2__glow" aria-hidden="true"></div>
        <p class="kicker">{{ promise.kicker }}</p>
        <h2 class="promise2__title">
          Один <span class="promise2__accent">внешний отдел</span><br />
          вместо пяти подрядчиков
        </h2>
        <p class="promise2__lead">{{ promise.lead }}</p>

        <div class="promise2__swap" aria-hidden="true">
          <div class="promise2__before">
            <span v-for="word in before" :key="word" class="promise2__strike">{{ word }}</span>
          </div>
          <span class="promise2__arrow">&rarr;</span>
          <span class="promise2__after">Подорожник</span>
        </div>
      </div>
    </div>
  </section>
</template>
