<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LandingShell from '../landings/kit/LandingShell.vue'
import LeadForm from '../components/ui/LeadForm.vue'
import { getNiche } from '../data/niches'

const route = useRoute()
const niche = computed(() => getNiche(route.params.slug))
</script>

<template>
  <LandingShell
    v-if="niche"
    theme="dark"
    :cta-label="niche.hero.primary"
    cta-href="#lp-form"
  >
    <main id="main">
      <!-- 1. Hero -->
      <section class="lp-hero">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.hero.kicker }}</p>
          <h1 class="lp-hero__title">
            {{ niche.hero.titleStart }}
            <span class="lp-hero__title-accent">{{ niche.hero.titleAccent }}</span>
            {{ niche.hero.titleEnd }}
          </h1>
          <p class="lp-hero__lead">{{ niche.hero.lead }}</p>
          <div class="lp-hero__actions">
            <a class="lp-btn" href="#lp-form">{{ niche.hero.primary }}</a>
            <a class="lp-btn lp-btn--outline" href="#lp-pricing">{{ niche.hero.secondary }}</a>
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
      <section class="lp-section" id="lp-cases">
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

      <!-- 8. Process CJM -->
      <section class="lp-section" id="lp-process">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.process.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.process.title }}</h2>
          </div>
          <div class="lp-process">
            <article
              v-for="(phase, index) in niche.process.phases"
              :key="phase.id"
              class="lp-process__item"
            >
              <span class="lp-process__idx">Шаг {{ index + 1 }}</span>
              <div>
                <h3>{{ phase.title }} — {{ phase.tagline }}</h3>
                <p>{{ phase.text }}</p>
              </div>
            </article>
          </div>
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
              <p class="lp-muted-sm" style="margin-top: 1rem">{{ plan.forWhom }}</p>
            </article>
          </div>
          <div class="lp-pricing-foot">
            <a class="lp-btn" href="#lp-form">{{ niche.pricing.cta }}</a>
          </div>
        </div>
      </section>

      <!-- 10. Team -->
      <section class="lp-section" id="lp-team">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.team.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.team.title }}</h2>
            <p class="lp-lead">{{ niche.team.lead }}</p>
          </div>
          <div class="lp-grid-3">
            <article v-for="m in niche.team.members" :key="m.role" class="lp-card">
              <h3>{{ m.role }}</h3>
              <p>{{ m.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 11. Principles -->
      <section class="lp-section" id="lp-principles">
        <div class="lp-wrap">
          <p class="lp-kicker">{{ niche.principles.kicker }}</p>
          <div class="lp-section__head">
            <h2>{{ niche.principles.title }}</h2>
          </div>
          <div class="lp-grid-2">
            <article v-for="item in niche.principles.items" :key="item.title" class="lp-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 12. FAQ -->
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

      <!-- 13. Form + lead magnet -->
      <section class="lp-section" id="lp-form">
        <div class="lp-wrap lp-form-block">
          <div>
            <p class="lp-kicker">{{ niche.form.kicker }}</p>
            <h2 style="font-family: var(--lp-font); font-size: clamp(1.5rem, 3vw, 2.1rem); letter-spacing: -0.03em; margin: 0 0 1rem">
              {{ niche.form.title }}
            </h2>
            <p class="lp-lead">{{ niche.form.lead }}</p>
            <p class="lp-magnet">{{ niche.form.magnet }}</p>
          </div>
          <LeadForm :submit-label="niche.form.submit" />
        </div>
      </section>
    </main>
  </LandingShell>
</template>
