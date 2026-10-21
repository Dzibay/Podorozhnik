<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { perf } from '../../../utils/perf'

/**
 * Разбор решений: слева — решения, справа — закреплённое окно браузера.
 * Когда решение доходит до середины экрана, скриншот доезжает до нужного места сайта.
 * В облегчённом режиме окна нет: у каждого решения свой небольшой кадр, огромный скриншот не грузится.
 */
const props = defineProps({
  decisions: { type: Array, required: true },
  shot: { type: Object, required: true },
  label: { type: String, default: '' },
})

const lite = computed(() => perf.lite && props.shot.crops)
const crop = (i) => props.shot.src.replace('-desktop.webp', `-d${i + 1}.webp`)

const active = ref(0)
const items = ref([])
let observer = null

/* видимая высота окна в пикселях исходного скриншота (окно 16:10) */
const viewH = computed(() => props.shot.w * 0.625)
const offset = computed(() => {
  const at = Math.min(props.decisions[active.value].at, props.shot.h - viewH.value)
  return (at / props.shot.h) * 100
})

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = Number(entry.target.dataset.index)
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  )
  items.value.forEach((el) => observer.observe(el))
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section class="cp-sec cp-dec">
    <div class="container">
      <p v-reveal class="kicker">Разбор решений</p>
      <h2 v-reveal class="cp-h2">Почему сайт <span class="cp-accent">устроен именно так</span></h2>

      <ol v-if="lite" class="cp-dec__cards">
        <li v-for="(item, i) in decisions" :key="item.title" v-reveal class="cp-dec__card">
          <img :src="crop(i)" width="720" height="450" alt="" loading="lazy" decoding="async" />
          <span class="cp-dec__num mono">{{ String(i + 1).padStart(2, '0') }} / {{ String(decisions.length).padStart(2, '0') }}</span>
          <h3 class="cp-dec__title">{{ item.title }}</h3>
          <p class="cp-dec__text">{{ item.text }}</p>
        </li>
      </ol>

      <div v-else class="cp-dec__grid">
        <ol class="cp-dec__list">
          <li
            v-for="(item, i) in decisions"
            :key="item.title"
            ref="items"
            :data-index="i"
            class="cp-dec__item"
            :class="{ 'is-active': i === active }"
          >
            <span class="cp-dec__num mono">{{ String(i + 1).padStart(2, '0') }} / {{ String(decisions.length).padStart(2, '0') }}</span>
            <h3 class="cp-dec__title">{{ item.title }}</h3>
            <p class="cp-dec__text">{{ item.text }}</p>
          </li>
        </ol>

        <div class="cp-dec__sticky">
          <div class="cp-dec__window">
            <div class="cp-laptop__bar">
              <i /><i /><i />
              <span class="cp-laptop__url mono">{{ label }}</span>
            </div>
            <div class="cp-dec__view">
              <img
                :src="shot.src"
                :width="shot.w"
                :height="shot.h"
                alt=""
                loading="lazy"
                decoding="async"
                :style="{ transform: `translateY(-${offset.toFixed(3)}%)` }"
              />
              <span :key="active" class="cp-dec__scan" aria-hidden="true" />
            </div>
          </div>
          <div class="cp-dec__progress" aria-hidden="true">
            <span v-for="(item, i) in decisions" :key="item.title" :class="{ 'is-on': i <= active }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
