<script setup>
import { nichePath } from '../../data/niches'
import NicheIcon from './NicheIcon.vue'

/** Карточка ниши: главная и каталог /dlya */
defineProps({
  niche: { type: Object, required: true },
  num: { type: Number, required: true },
})
</script>

<template>
  <RouterLink :to="nichePath(niche.slug)" class="niche" data-spot data-cursor="Смотреть">
    <span class="niche__top">
      <span class="niche__num mono">{{ String(num).padStart(2, '0') }}</span>
      <span class="niche__arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </span>
    <NicheIcon :name="niche.card.icon" />
    <span class="niche__title">{{ niche.card.title }}</span>
    <span class="niche__text">{{ niche.card.text }}</span>
    <span class="niche__tags">
      <span v-for="tag in niche.card.tags" :key="tag">{{ tag }}</span>
    </span>
  </RouterLink>
</template>
