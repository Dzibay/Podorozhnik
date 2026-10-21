<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { homeCopy } from '../../data/home'

const { pipeline } = homeCopy
const active = ref(0)
const root = ref(null)
let timer = 0
let observer

function select(index) {
  active.value = index
  stop()
}

function start() {
  stop()
  timer = window.setInterval(() => {
    active.value = (active.value + 1) % pipeline.steps.length
  }, 4200)
}

function stop() {
  window.clearInterval(timer)
}

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.35 })
  observer.observe(root.value)
})

onUnmounted(() => {
  stop()
  observer?.disconnect()
})
</script>

<template>
  <section id="services" ref="root" class="sec sec--cream pipe" data-section="pipeline">
    <div class="container">
      <header class="sec__head">
        <div>
          <p v-reveal class="kicker">{{ pipeline.kicker }}</p>
          <h2 v-reveal class="h-1">
            {{ pipeline.titleStart }} <em>{{ pipeline.titleAccent }}</em>
          </h2>
        </div>
        <p v-reveal class="sec__lead">{{ pipeline.lead }}</p>
      </header>

      <div v-reveal class="pipe__flow" :style="{ '--active': active, '--count': pipeline.steps.length }">
        <div class="pipe__rail" aria-hidden="true">
          <span class="pipe__rail-fill" />
          <span class="pipe__pulse" />
        </div>
        <div class="pipe__nodes" role="tablist" aria-label="Этапы">
          <button
            v-for="(step, index) in pipeline.steps"
            :key="step.id"
            type="button"
            role="tab"
            class="pipe__node"
            :class="{ 'is-active': index === active, 'is-done': index < active }"
            :aria-selected="index === active"
            @click="select(index)"
            @mouseenter="select(index)"
          >
            <span class="pipe__dot" aria-hidden="true" />
            <span class="mono pipe__caption">{{ String(index + 1).padStart(2, '0') }} · {{ step.caption }}</span>
            <span class="pipe__name">{{ step.title }}</span>
          </button>
        </div>
      </div>

      <div class="pipe__panel" role="tabpanel">
        <Transition name="swap" mode="out-in">
          <div :key="active" class="pipe__panel-inner">
            <p class="pipe__text">{{ pipeline.steps[active].text }}</p>
            <ul class="pipe__items">
              <li v-for="(item, i) in pipeline.steps[active].items" :key="item" :style="{ '--i': i }">
                {{ item }}
              </li>
            </ul>
            <RouterLink :to="pipeline.steps[active].href" class="button button--accent">
              Подробнее об услугах
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>
