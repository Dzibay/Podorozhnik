<script setup>
import { homeCopy } from '../../data/home'

const items = homeCopy.marquee
</script>

<template>
  <div class="band" aria-label="Что мы делаем">
    <div class="marquee band__row" style="--dur: 48s">
      <div v-for="copy in 2" :key="copy" class="marquee__track" :aria-hidden="copy === 2 || undefined">
        <span v-for="item in items" :key="item" class="band__item">
          {{ item }}
          <svg class="band__star" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 0c.6 6 3.4 9 10 10-6.6 1-9.4 4-10 10-.6-6-3.4-9-10-10C6.6 9 9.4 6 10 0Z" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
