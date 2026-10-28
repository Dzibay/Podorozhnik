<script setup>
import { computed, ref } from 'vue'
import LandingShell from '../kit/LandingShell.vue'
import LeadForm from '../../components/ui/LeadForm.vue'
import NicheCases from '../showcase/NicheCases.vue'
import ProductCalc from './ProductCalc.vue'
import DemoBot from './demos/DemoBot.vue'
import DemoSaas from './demos/DemoSaas.vue'
import DemoFlow from './demos/DemoFlow.vue'
import DemoAi from './demos/DemoAi.vue'
import DemoSearch from './demos/DemoSearch.vue'
import DemoBuild from './demos/DemoBuild.vue'
import DemoReport from './demos/DemoReport.vue'
import DemoPlan from './demos/DemoPlan.vue'
import DemoCrm from './demos/DemoCrm.vue'
import DemoAudit from './demos/DemoAudit.vue'
import NicheCalc from '../showcase/NicheCalc.vue'
import '../showcase/showcase.css'
import './product.css'
import './demos-more.css'
import { nicheIndex } from 'virtual:niche-index'
import { productEstimateNote } from '../../data/products'
import { featuredNiches } from '../../data/nicheGroups'
import { getService, keyServices, services } from '../../data/services'
import { contacts, routes } from '../../data/site'
import { track } from '../../analytics/tracker'

/** Посадочная IT-направления: живое демо в первом экране, калькулятор рутины, этапы и форматы */
const props = defineProps({
  product: { type: Object, required: true },
  slug: { type: String, required: true },
})

const demos = {
  bot: DemoBot,
  saas: DemoSaas,
  flow: DemoFlow,
  ai: DemoAi,
  search: DemoSearch,
  build: DemoBuild,
  report: DemoReport,
  plan: DemoPlan,
  crm: DemoCrm,
  audit: DemoAudit,
}
const demo = computed(() => demos[props.product.demo])

// сценарии демо идут по кругу, клик по вкладке переключает сразу
const active = ref(0)
const scenario = computed(() => props.product.scenarios[active.value])
function nextScenario() {
  active.value = (active.value + 1) % props.product.scenarios.length
}

// маркетинговым услугам — калькулятор потерянных заявок, IT — калькулятор рутины
const leaksCalc = computed(() => props.product.calc.kind === 'leaks')

// ссылки внизу страницы: услуги того же направления, затем главные, и ниши с витриной
const nicheLabels = new Map(nicheIndex.map((niche) => [niche.slug, niche.label]))
const related = computed(() => {
  const current = getService(props.slug)
  const sameGroup = services.filter((item) => item.group === current?.group && item.slug !== props.slug)
  const others = [...sameGroup, ...keyServices.map(getService)].filter(
    (item, index, list) => item.slug !== props.slug && list.indexOf(item) === index,
  )
  return [
    {
      title: 'Другие услуги',
      links: [
        ...others.slice(0, 8).map((item) => ({ label: item.shortTitle, to: routes.service(item.slug) })),
        { label: 'Все услуги →', to: routes.services },
      ],
    },
    {
      title: 'Ниши',
      links: [
        ...featuredNiches.map((slug) => ({ label: nicheLabels.get(slug), to: routes.niche(slug) })),
        { label: 'Все ниши →', to: routes.niches },
      ],
    },
  ]
})

const vars = computed(() => {
  const t = props.product.theme
  return {
    '--lp-bg': t.bg,
    '--lp-surface': t.surface,
    '--lp-text': t.ink,
    '--lp-muted': t.muted,
    '--lp-line': `color-mix(in srgb, ${t.ink} 14%, transparent)`,
    '--lp-accent': t.accent,
    '--ns-bg': t.bg,
    '--ns-surface': t.surface,
    '--ns-ink': t.ink,
    '--ns-muted': t.muted,
    '--ns-accent-2': t.accent2,
    '--ns-on-accent': t.onAccent,
  }
})

function onCall(place) {
  track('click_phone', { place: `product-${place}`, product: props.slug })
}
</script>

<template>
  <LandingShell
    theme="dark"
    variant="showcase"
    :vars="vars"
    cta-label="Позвонить"
    :cta-href="contacts.phoneTel"
    :related="related"
  >
    <main id="main" class="pd">
      <!-- 1. Первый экран: текст слева, живое демо справа -->
      <section class="lp-hero pd-hero">
        <div class="pd-hero__glow" aria-hidden="true" />
        <div class="lp-wrap pd-hero__grid">
          <div class="pd-hero__copy">
            <p class="lp-kicker">{{ product.hero.kicker }}</p>
            <h1 class="lp-hero__title pd-hero__title">
              {{ product.hero.titleStart }}
              <span class="lp-hero__title-accent">{{ product.hero.titleAccent }}</span>
              {{ product.hero.titleEnd }}
            </h1>
            <p class="lp-hero__lead pd-hero__lead">{{ product.hero.lead }}</p>
            <div class="lp-hero__actions">
              <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall('hero')">
                <span class="live-dot" aria-hidden="true" />
                Позвонить
                <span class="lp-btn__num">{{ contacts.phoneDisplay }}</span>
              </a>
              <a class="lp-btn lp-btn--outline" href="#lp-calc">{{ leaksCalc ? 'Посчитать потери' : 'Посчитать экономию' }}</a>
            </div>
            <dl class="ns-facts pd-facts">
              <div v-for="fact in product.facts" :key="fact.label">
                <dt>{{ fact.value }}</dt>
                <dd>{{ fact.label }}</dd>
              </div>
            </dl>
            <p class="ns-note" :title="productEstimateNote">Оценка по нашим проектам, не обещание результата</p>
          </div>

          <div class="pd-stage">
            <!-- демо декоративное (aria-hidden), поэтому сценарии — переключатели, а не вкладки без панели -->
            <div class="pd-tabs" role="group" aria-label="Сценарии демо">
              <button
                v-for="(item, i) in product.scenarios"
                :key="item.id"
                type="button"
                class="pd-tab"
                :class="{ 'is-active': i === active }"
                :aria-pressed="i === active"
                @click="active = i"
              >
                {{ item.label }}
              </button>
            </div>
            <component :is="demo" :key="scenario.id" :scenario="scenario" @done="nextScenario" />
          </div>
        </div>
      </section>

      <!-- 2. Задачи -->
      <section class="lp-section" id="lp-tasks">
        <div class="lp-wrap">
          <p class="lp-kicker">Задачи</p>
          <div class="lp-section__head">
            <h2>{{ product.tasks.title }}</h2>
            <p class="lp-lead">{{ product.tasks.lead }}</p>
          </div>
          <div class="lp-grid-3">
            <article v-for="(item, i) in product.tasks.items" :key="item.title" class="lp-card pd-task">
              <span class="pd-task__idx">{{ String(i + 1).padStart(2, '0') }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 3. Калькулятор рутины -->
      <NicheCalc v-if="leaksCalc" :calc="product.calc" :slug="slug" :note="productEstimateNote" />
      <ProductCalc v-else :calc="product.calc" :slug="slug" />

      <!-- 4. Этапы -->
      <section class="lp-section" id="lp-steps">
        <div class="lp-wrap">
          <p class="lp-kicker">Этапы</p>
          <div class="lp-section__head">
            <h2>{{ product.steps.title }}</h2>
            <p class="lp-lead">{{ product.steps.lead }}</p>
          </div>
          <ol class="pd-steps">
            <li v-for="(step, i) in product.steps.items" :key="step.title" class="pd-step">
              <span class="pd-step__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="pd-step__term">{{ step.label }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 5. Интеграции и стек -->
      <section class="lp-section pd-stack-sec" aria-label="Интеграции и технологии">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ product.stackLabel || 'С чем работаем' }}</p>
          <ul class="pd-stack">
            <li v-for="item in product.stack" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 6. Форматы -->
      <section class="lp-section" id="lp-formats">
        <div class="lp-wrap">
          <p class="lp-kicker">Форматы</p>
          <div class="lp-section__head">
            <h2>С чего можно начать</h2>
            <p class="lp-lead">{{ product.formatsLead || 'Стоимость называем после короткого брифа. Она фиксируется до старта и не меняется по ходу работы.' }}</p>
          </div>
          <div class="lp-grid-3">
            <article
              v-for="item in product.formats"
              :key="item.name"
              class="lp-card pd-format"
              :class="{ 'lp-card--featured': item.featured }"
            >
              <span v-if="item.featured" class="lp-badge">Чаще всего</span>
              <h3>{{ item.name }}</h3>
              <p class="pd-format__term">{{ item.term }}</p>
              <ul>
                <li v-for="line in item.items" :key="line">{{ line }}</li>
              </ul>
            </article>
          </div>
          <div class="lp-pricing-foot">
            <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall('formats')">
              <span class="live-dot" aria-hidden="true" />
              Узнать стоимость по телефону
            </a>
          </div>
        </div>
      </section>

      <!-- 7. Кейсы -->
      <NicheCases :slugs="product.cases" />

      <!-- 8. FAQ -->
      <section class="lp-section" id="lp-faq">
        <div class="lp-wrap">
          <p class="lp-kicker">Вопросы</p>
          <div class="lp-section__head">
            <h2>Что спрашивают перед стартом</h2>
          </div>
          <div class="lp-faq">
            <details v-for="item in product.faq" :key="item.q">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- 9. Форма -->
      <section class="lp-section lp-section--dark" id="lp-form">
        <div class="lp-wrap lp-form-block">
          <div>
            <p class="lp-kicker">Следующий шаг</p>
            <h2 class="lp-form-title">{{ product.form.title }}</h2>
            <p class="lp-lead">{{ product.form.lead }}</p>
            <a class="lp-big-phone" :href="contacts.phoneTel" @click="onCall('form')">
              <span class="live-dot" aria-hidden="true" />
              {{ contacts.phoneDisplay }}
            </a>
            <p class="lp-magnet">{{ product.form.magnet }}</p>
          </div>
          <LeadForm :submit-label="product.form.submit" />
        </div>
      </section>
    </main>
  </LandingShell>
</template>
