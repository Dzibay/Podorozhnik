<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getCase } from '../../data/cases'
import { routes } from '../../data/site'

/** Настоящие кейсы ниши — карточки в палитре каждого кейса со ссылкой на разбор */
const props = defineProps({
  slugs: { type: Array, required: true },
})

const items = computed(() => props.slugs.map(getCase).filter(Boolean))
</script>

<template>
  <section class="lp-section ns-cases" id="lp-cases">
    <div class="lp-wrap">
      <p class="lp-kicker">Кейсы</p>
      <div class="lp-section__head">
        <h2>Что уже сделали в похожих нишах</h2>
        <p class="lp-lead">Цифры из рекламных кабинетов и CRM клиентов. Подробный разбор — по ссылке.</p>
      </div>
      <div class="ns-cases__grid">
        <RouterLink
          v-for="item in items"
          :key="item.slug"
          class="ns-case"
          :to="routes.case(item.slug)"
          :style="{ '--c-bg': item.theme.bg, '--c-ink': item.theme.ink, '--c-accent': item.theme.accent, '--c-accent-2': item.theme.accent2 }"
        >
          <span class="ns-case__niche">{{ item.nicheLabel }}</span>
          <strong class="ns-case__metric">{{ item.preview.metric }}</strong>
          <span class="ns-case__result">{{ item.preview.result }}</span>
          <span class="ns-case__client">{{ item.title }}</span>
          <span class="ns-case__more">Смотреть кейс →</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
