<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import LandingShell from '../landings/kit/LandingShell.vue'
import LeadForm from '../components/ui/LeadForm.vue'
import NicheScene from '../landings/showcase/NicheScene.vue'
import NichePoster from '../landings/showcase/NichePoster.vue'
import NicheCalc from '../landings/showcase/NicheCalc.vue'
import NicheJourney from '../landings/showcase/NicheJourney.vue'
import NicheCases from '../landings/showcase/NicheCases.vue'
import '../landings/showcase/showcase.css'
import { getNiche } from '../data/niches'
import { nicheGroups } from '../data/nicheGroups'
import { estimateNote, getShowcase } from '../data/nicheShowcase'
import { getService, keyServices } from '../data/services'
import { contacts, routes } from '../data/site'
import { track } from '../analytics/tracker'

const route = useRoute()
const niche = computed(() => getNiche(route.params.slug))
// у пилотных ниш своя палитра, 3D-сцена, калькулятор и путь клиента
const show = computed(() => getShowcase(route.params.slug))
const showVars = computed(() => {
  const t = show.value?.theme
  if (!t) return null
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

// ссылки внизу страницы: соседние ниши той же группы и главные услуги
const related = computed(() => {
  const slug = route.params.slug
  const group = nicheGroups.find((item) => item.slugs.includes(slug))
  const neighbours = group ? group.slugs.filter((item) => item !== slug) : []
  return [
    {
      title: group ? group.title : 'Ниши',
      links: [
        ...neighbours.map((item) => ({ label: getNiche(item).label, to: routes.niche(item) })),
        { label: 'Все ниши →', to: routes.niches },
      ],
    },
    {
      title: 'Услуги',
      links: [
        ...keyServices.map((item) => ({ label: getService(item).shortTitle, to: routes.service(item) })),
        { label: 'Все услуги →', to: routes.services },
      ],
    },
  ]
})

function onCall(place) {
  track('click_phone', { place: `landing-${place}`, niche: route.params.slug })
}
</script>

<template>
  <LandingShell
    v-if="niche"
    :theme="show ? 'dark' : 'light'"
    :variant="show ? 'showcase' : ''"
    :vars="showVars"
    cta-label="Позвонить"
    :cta-href="contacts.phoneTel"
    :related="related"
  >
    <main id="main">
      <!-- 1. Hero: у витрины — 3D-сцена ниши и рыночные ориентиры -->
      <section v-if="show" class="lp-hero ns-hero">
        <NicheScene v-if="show.scene" class="ns-hero__scene" :scene="show.scene" :still="show.still" />
        <NichePoster v-else class="ns-hero__scene" :icon="niche.card.icon" :tags="niche.card.tags" />
        <div class="ns-hero__shade" aria-hidden="true" />
        <div class="lp-wrap ns-hero__inner">
          <p class="lp-kicker">{{ niche.hero.kicker }}</p>
          <h1 class="lp-hero__title">
            {{ niche.hero.titleStart }}
            <span class="lp-hero__title-accent">{{ niche.hero.titleAccent }}</span>
            {{ niche.hero.titleEnd }}
          </h1>
          <p class="lp-hero__lead">{{ niche.hero.lead }}</p>
          <div class="lp-hero__actions">
            <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall('hero')">
              <span class="live-dot" aria-hidden="true" />
              Позвонить
              <span class="lp-btn__num">{{ contacts.phoneDisplay }}</span>
            </a>
            <a class="lp-btn lp-btn--outline" href="#lp-calc">Посчитать потери</a>
          </div>
          <dl class="ns-facts">
            <div v-for="fact in show.facts" :key="fact.label">
              <dt>{{ fact.value }}</dt>
              <dd>{{ fact.label }}</dd>
            </div>
          </dl>
          <p class="ns-note ns-hero__note" :title="estimateNote">Оценка по рынку, не обещание результата</p>
        </div>
      </section>

      <section v-else class="lp-hero">
        <div class="lp-hero__glow" aria-hidden="true" />
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.hero.kicker }}</p>
          <h1 class="lp-hero__title">
            {{ niche.hero.titleStart }}
            <span class="lp-hero__title-accent">{{ niche.hero.titleAccent }}</span>
            {{ niche.hero.titleEnd }}
          </h1>
          <p class="lp-hero__lead">{{ niche.hero.lead }}</p>
          <div class="lp-hero__actions">
            <a class="lp-btn lp-btn--call" :href="contacts.phoneTel" @click="onCall('hero')">
              <span class="live-dot" aria-hidden="true" />
              Позвонить
              <span class="lp-btn__num">{{ contacts.phoneDisplay }}</span>
            </a>
            <a class="lp-btn lp-btn--outline" href="#lp-form">Перезвоните мне</a>
          </div>
          <ul class="lp-hero__trust">
            <li v-for="item in niche.hero.trust" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 2. Pain -->
      <section class="lp-section" id="lp-pain">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.pain.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.pain.title }}</h2>
          </div>
          <div class="lp-grid-2">
            <article v-for="item in niche.pain.items" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <NicheCalc v-if="show" :calc="show.calc" :slug="route.params.slug" :note="estimateNote" />

      <!-- 3. Alternatives -->
      <section class="lp-section" id="lp-alts">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.alternatives.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.alternatives.title }}</h2>
          </div>
          <div class="lp-grid-3">
            <article v-for="item in niche.alternatives.items" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 4. Solution -->
      <section class="lp-section" id="lp-solution">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.solution.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.solution.title }}</h2>
            <p class="lp-lead">{{ niche.solution.lead }}</p>
          </div>
          <div class="lp-grid-3">
            <article v-for="item in niche.solution.pillars" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <NicheJourney v-if="show" :journey="show.journey" />

      <!-- 5. Killer offer 24h -->
      <section class="lp-section" id="lp-offer">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.offer.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.offer.title }}</h2>
            <p class="lp-lead">{{ niche.offer.lead }}</p>
          </div>
          <ol class="lp-steps">
            <li v-for="(step, i) in niche.offer.steps" :key="step.title" class="lp-step">
              <span class="lp-step__label">{{ step.label }}</span>
              <span class="lp-step__num" aria-hidden="true">{{ i + 1 }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </li>
          </ol>
          <p class="lp-foot-note">{{ niche.offer.note }}</p>
          <div class="lp-pricing-foot">
            <a class="lp-btn" href="#lp-form">{{ niche.offer.cta }}</a>
          </div>
        </div>
      </section>

      <!-- 6. Scope -->
      <section class="lp-section" id="lp-scope">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.scope.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.scope.title }}</h2>
          </div>
          <div class="lp-grid-4">
            <article v-for="group in niche.scope.groups" :key="group.title" class="lp-card">
              <h3>{{ group.title }}</h3>
              <ul>
                <li v-for="item in group.items" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <!-- 7. Cases / niche experience (без выдуманных цифр) -->
      <NicheCases v-if="show?.cases?.length" :slugs="show.cases" />
      <section v-else class="lp-section" id="lp-cases">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.cases.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.cases.title }}</h2>
            <p class="lp-lead">{{ niche.cases.lead }}</p>
          </div>
          <div class="lp-grid-3">
            <article v-for="item in niche.cases.items" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 8. Process CJM: этапы и сроки одной строкой — подробный рассказ о них на главной -->
      <section class="lp-section" id="lp-process">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.process.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.process.title }}</h2>
          </div>
          <ol class="lp-process lp-process--compact">
            <li v-for="(phase, index) in niche.process.phases" :key="phase.id" class="lp-process__item">
              <span class="lp-process__idx" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ phase.title }}</h3>
                <p>{{ phase.tagline }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 9. Pricing -->
      <section class="lp-section" id="lp-pricing">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.pricing.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.pricing.title }}</h2>
            <p class="lp-lead">{{ niche.pricing.lead }}</p>
          </div>
          <div class="lp-grid-4">
            <article
              v-for="plan in niche.pricing.plans"
              :key="plan.id"
              class="lp-card"
              :class="{ 'lp-card--featured': plan.featured }"
            >
              <span v-if="plan.featured" class="lp-badge">Чаще всего</span>
              <h3>{{ plan.name }}</h3>
              <p class="lp-price">{{ plan.price }}</p>
              <ul>
                <li v-for="item in plan.includes" :key="item">{{ item }}</li>
              </ul>
              <p class="lp-muted-sm lp-plan-for">{{ plan.forWhom }}</p>
            </article>
          </div>
          <div class="lp-pricing-foot">
            <a class="lp-btn" href="#lp-form">{{ niche.pricing.cta }}</a>
          </div>
        </div>
      </section>

      <!-- 10. Команда и принципы — коротко, они одни на все ниши; подробно — на странице агентства -->
      <section class="lp-section" id="lp-team">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.team.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.team.title }}</h2>
          </div>
          <ul class="lp-roles" aria-label="Кто ведёт проект">
            <li v-for="m in niche.team.members" :key="m.role">{{ m.role }}</li>
          </ul>
          <div class="lp-grid-4">
            <article v-for="item in niche.principles.items" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
          <p class="lp-foot-note">
            <RouterLink :to="routes.agency">Подробнее о команде и подходе →</RouterLink>
          </p>
        </div>
      </section>

      <!-- 11. FAQ -->
      <section class="lp-section" id="lp-faq">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.faq.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.faq.title }}</h2>
          </div>
          <div class="lp-faq">
            <details v-for="item in niche.faq.items" :key="item.q">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- 12. Form + lead magnet -->
      <section class="lp-section lp-section--dark" id="lp-form">
        <div class="lp-wrap lp-form-block">
          <div>
            <p class="lp-kicker">{{ niche.form.kicker }}</p>
            <h2 class="lp-form-title">{{ niche.form.title }}</h2>
            <p class="lp-lead">{{ niche.form.lead }}</p>
            <a class="lp-big-phone" :href="contacts.phoneTel" @click="onCall('form')">
              <span class="live-dot" aria-hidden="true" />
              {{ contacts.phoneDisplay }}
            </a>
            <p class="lp-magnet">{{ niche.form.magnet }}</p>
          </div>
          <LeadForm :submit-label="niche.form.submit" />
        </div>
      </section>
    </main>
  </LandingShell>
</template>
