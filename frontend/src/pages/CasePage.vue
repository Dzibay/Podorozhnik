<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { caseThemeVars, getCase, nextCase } from '../data/cases'
import { routes } from '../data/site'
import CaseCounter from '../components/cases/CaseCounter.vue'
import CaseScene from '../components/cases/CaseScene.vue'
import CtaSection from '../components/home/CtaSection.vue'
import CaseBrief from '../components/cases/blocks/CaseBrief.vue'
import CaseCompare from '../components/cases/blocks/CaseCompare.vue'
import CaseDecisions from '../components/cases/blocks/CaseDecisions.vue'
import CaseJourney from '../components/cases/blocks/CaseJourney.vue'
import CaseOutcome from '../components/cases/blocks/CaseOutcome.vue'
import CaseSite from '../components/cases/blocks/CaseSite.vue'

const route = useRoute()
const item = computed(() => getCase(route.params.slug))
const next = computed(() => (item.value ? nextCase(item.value.slug) : null))
const chartMax = computed(() => Math.max(...(item.value?.chart?.bars.map((bar) => bar.value) || [1])))
const numberFormat = new Intl.NumberFormat('ru-RU')
</script>

<template>
  <main
    v-if="item"
    id="main"
    :key="item.slug"
    class="cp"
    :class="[item.theme.dark ? 'cp--dark' : 'cp--light', `cp--${item.scene}`]"
    :style="caseThemeVars(item)"
  >
    <!-- Первый экран -->
    <section class="cp-hero">
      <CaseScene :scene="item.scene" class="cp-hero__scene" />
      <div class="container cp-hero__inner">
        <nav class="cp-hero__crumb mono" aria-label="Навигация">
          <RouterLink :to="routes.cases">Кейсы</RouterLink>
          <span aria-hidden="true">/</span>
          <span>{{ item.nicheLabel }}</span>
        </nav>

        <h1 v-reveal.lines class="cp-hero__title lines">
          <span v-for="(line, l) in item.headline" :key="line">
            <span :style="{ '--l': l }" :class="{ 'cp-accent': l === 1 }">{{ line }}</span>
          </span>
        </h1>

        <div class="cp-hero__meta">
          <p v-reveal class="cp-hero__lead">{{ item.lead }}</p>
          <dl v-reveal class="cp-hero__facts">
            <div>
              <dt class="mono">Клиент</dt>
              <dd>{{ item.client }}</dd>
            </div>
            <div>
              <dt class="mono">Срок</dt>
              <dd>{{ item.period }}</dd>
            </div>
            <div>
              <dt class="mono">Формат</dt>
              <dd>{{ item.team ? 'Опыт команды' : 'Проект агентства' }}</dd>
            </div>
          </dl>
        </div>

        <ul class="cp-hero__tags">
          <li v-for="tag in item.tags" :key="tag" class="mono">{{ tag }}</li>
        </ul>
      </div>
    </section>

    <!-- Главные цифры -->
    <section class="cp-metrics" aria-label="Результаты">
      <div class="container cp-metrics__grid">
        <div v-for="(metric, i) in item.metrics" :key="metric.label" v-reveal class="cp-metric" :style="{ '--i': i }">
          <CaseCounter :metric="metric" class="cp-metric__value" />
          <p class="cp-metric__label">{{ metric.label }}</p>
        </div>
      </div>
    </section>

    <template v-for="block in item.blocks" :key="block">
      <CaseBrief v-if="block === 'brief'" :brief="item.brief" />
      <CaseSite v-else-if="block === 'site'" :site="item.site" :url="item.url" />
      <CaseDecisions
        v-else-if="block === 'decisions'"
        :decisions="item.decisions"
        :shot="item.site.desktop"
        :label="item.site.label"
      />
      <CaseCompare v-else-if="block === 'compare'" :compare="item.compare" />
      <CaseJourney v-else-if="block === 'journey'" :journey="item.journey" />
      <CaseOutcome v-else-if="block === 'outcome'" :outcome="item.outcome" />

      <!-- Было -->
      <section v-else-if="block === 'before'" class="cp-sec cp-before">
        <div class="container cp-before__grid">
          <div>
            <p v-reveal class="kicker">Как было</p>
            <h2 v-reveal class="cp-h2">{{ item.before.title }}</h2>
            <p v-reveal class="cp-text">{{ item.before.text }}</p>
          </div>
          <ul class="cp-before__pains">
            <li v-for="(pain, i) in item.before.pains" :key="pain" v-reveal :style="{ '--i': i }">
              <span class="mono">0{{ i + 1 }}</span>
              <span class="cp-before__pain">{{ pain }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Что сделали -->
      <section v-else-if="block === 'steps'" class="cp-sec cp-steps">
        <div class="container cp-steps__grid">
          <div class="cp-steps__aside">
            <p v-reveal class="kicker">Что сделали</p>
            <h2 v-reveal class="cp-h2">
              {{ item.steps.length }} {{ item.steps.length > 4 ? 'шагов' : 'шага' }}<br />
              <span class="cp-accent">к результату</span>
            </h2>
          </div>
          <ol class="cp-steps__list">
            <li v-for="(step, i) in item.steps" :key="step.title" v-reveal class="cp-step">
              <span class="cp-step__num">{{ String(i + 1).padStart(2, '0') }}</span>
              <div>
                <h3 class="cp-step__title">{{ step.title }}</h3>
                <p class="cp-step__text">{{ step.text }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- Хронология -->
      <section v-else-if="block === 'timeline'" class="cp-sec cp-timeline">
        <div class="container">
          <p v-reveal class="kicker">Хронология</p>
          <h2 v-reveal class="cp-h2">Как это было по времени</h2>
          <ol v-reveal class="cp-timeline__track" :style="{ '--count': item.timeline.length }">
            <li v-for="(point, i) in item.timeline" :key="point.when" :style="{ '--i': i }">
              <span class="cp-timeline__dot" />
              <span class="mono cp-timeline__when">{{ point.when }}</span>
              <span class="cp-timeline__what">{{ point.what }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- График -->
      <section v-else-if="block === 'chart'" class="cp-sec cp-chart">
        <div class="container cp-chart__grid">
          <div>
            <p v-reveal class="kicker">В динамике</p>
            <h2 v-reveal class="cp-h2">{{ item.chart.title }}</h2>
          </div>
          <div v-reveal class="cp-chart__bars">
            <div
              v-for="(bar, i) in item.chart.bars"
              :key="bar.label"
              class="cp-bar"
              :style="{ '--h': bar.value / chartMax, '--i': i }"
            >
              <span class="cp-bar__value">{{ numberFormat.format(bar.value) }}{{ item.chart.suffix || '' }}</span>
              <span class="cp-bar__fill" />
              <span class="mono cp-bar__label">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Витрина интерфейса (для продуктовых кейсов) -->
      <section v-else-if="block === 'showcase'" class="cp-sec cp-showcase">
        <div class="container">
          <p v-reveal class="kicker">Интерфейс</p>
          <h2 v-reveal class="cp-h2">Три экрана, которые продают</h2>
          <div class="cp-showcase__row">
            <figure v-for="(screen, i) in item.showcase" :key="screen.label" v-reveal class="cp-screen" :style="{ '--i': i }">
              <div class="cp-screen__frame">
                <span class="cp-screen__bar"><i /><i /><i /></span>
                <div class="cp-screen__body" :class="`cp-screen__body--${i}`">
                  <span class="cp-screen__orb" />
                  <span class="cp-screen__line cp-screen__line--lg" />
                  <span class="cp-screen__line" />
                  <span class="cp-screen__line cp-screen__line--sm" />
                  <span class="cp-screen__btn" />
                </div>
              </div>
              <figcaption>
                <b>{{ screen.label }}</b>
                <span>{{ screen.text }}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- Главный вывод -->
      <section v-else-if="block === 'insight'" class="cp-sec cp-insight">
        <div class="container">
          <p v-reveal class="kicker">Главный вывод</p>
          <p v-reveal class="cp-insight__text">{{ item.insight }}</p>
        </div>
      </section>
    </template>

    <!-- Итог -->
    <section class="cp-result">
      <div class="container cp-result__grid">
        <p v-reveal class="mono cp-result__kicker">Что получилось</p>
        <h2 v-reveal class="cp-result__title">{{ item.result.title }}</h2>
        <div v-reveal class="cp-result__side">
          <p>{{ item.result.text }}</p>
          <a v-if="item.url" class="cp-result__link mono" :href="item.url" target="_blank" rel="noopener noreferrer">
            Открыть проект ↗
          </a>
        </div>
      </div>
    </section>

    <CtaSection />

    <!-- Следующий кейс -->
    <RouterLink
      v-if="next"
      :to="routes.case(next.slug)"
      class="cp-next"
      :style="caseThemeVars(next)"
      :class="next.theme.dark ? 'cp-next--dark' : 'cp-next--light'"
      data-cursor="Дальше"
    >
      <div class="container cp-next__inner">
        <span class="mono">Следующий кейс · {{ next.nicheLabel }}</span>
        <span class="cp-next__title">{{ next.title }}</span>
        <span class="cp-next__metric">{{ next.preview.metric }} — {{ next.preview.result }}</span>
        <span class="cp-next__arrow" aria-hidden="true">→</span>
      </div>
    </RouterLink>
  </main>
</template>
