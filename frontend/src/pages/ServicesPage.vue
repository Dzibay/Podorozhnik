<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { analyticsEvents, routes } from '../data/site'
import { serviceGroups, getServicesByGroup } from '../data/services'
import AppButton from '../components/ui/AppButton.vue'

const groups = serviceGroups.map((group) => ({
  ...group,
  items: getServicesByGroup(group.id),
}))

const listRef = ref(null)
let fitObserver = null

function fitTitles() {
  const root = listRef.value
  if (!root) return

  for (const title of root.querySelectorAll('.services-group__title')) {
    const maxW = title.parentElement.clientWidth
    if (maxW <= 0) continue

    title.style.removeProperty('font-size')

    let lo = 28
    let hi = 220
    let best = lo

    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      title.style.fontSize = `${mid}px`
      if (title.scrollWidth <= maxW) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    title.style.fontSize = `${best}px`
  }
}

onMounted(async () => {
  if (document.fonts?.ready) await document.fonts.ready
  fitTitles()
  requestAnimationFrame(fitTitles)
  fitObserver = new ResizeObserver(fitTitles)
  if (listRef.value) fitObserver.observe(listRef.value)
  window.addEventListener('resize', fitTitles, { passive: true })
})

onUnmounted(() => {
  fitObserver?.disconnect()
  window.removeEventListener('resize', fitTitles)
})
</script>

<template>
  <main id="main" class="page page--services">
    <div class="container">
      <header class="services-hero">
        <p class="kicker">Услуги</p>
        <h1 class="services-hero__title">Продукт. Система. Рост.</h1>
        <p class="services-hero__lead">
          Три направления full-cycle digital. Выберите тему — разберём задачу, результат и формат
          работы.
        </p>
      </header>

      <div ref="listRef" class="services-groups">
        <section
          v-for="group in groups"
          :id="group.id"
          :key="group.id"
          class="services-group"
        >
          <header class="services-group__head">
            <div class="services-group__stage">
              <h2 class="services-group__title">{{ group.title }}</h2>
            </div>
            <p class="services-group__lead">{{ group.lead }}</p>
          </header>

          <ul class="services-list">
            <li v-for="item in group.items" :key="item.slug">
              <RouterLink class="services-list__link" :to="routes.service(item.slug)">
                <span class="services-list__copy">
                  <strong class="services-list__name">{{ item.shortTitle }}</strong>
                  <span class="services-list__desc">{{ item.lead }}</span>
                </span>
                <span class="services-list__arrow" aria-hidden="true">&rarr;</span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>

      <section class="services-foot">
        <div class="services-foot__copy">
          <p class="kicker">Следующий шаг</p>
          <h2 class="services-foot__title">Не уверены, с чего начать?</h2>
          <p class="services-foot__lead">
            Опишите задачу коротко — предложим формат: анализ, продукт, рост или полный цикл.
          </p>
        </div>
        <div class="services-foot__actions">
          <AppButton
            class="services-foot__button"
            :href="routes.contacts"
            :event-name="analyticsEvents.ctaDiscussProject"
          >
            Обсудить проект
            <span class="services-foot__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
          <AppButton
            class="services-foot__button"
            :href="routes.agency"
            variant="outline"
            event-name=""
          >
            Об агентстве
            <span class="services-foot__arrow" aria-hidden="true">&rarr;</span>
          </AppButton>
        </div>
      </section>
    </div>
  </main>
</template>
