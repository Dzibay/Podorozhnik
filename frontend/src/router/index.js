import { createRouter, createWebHistory } from 'vue-router'
import { getGroup, getService, legacyServiceRedirects } from '../data/services'
import { getNiche } from '../data/niches'
import { applyPageMeta } from '../utils/meta'

export const ADMIN_PATH = '/pd-panel-x7k2m9'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: {
      title: 'Подорожник — внешний отдел маркетинга и IT',
      description:
        'Заявки для производства, стройки и услуг: сайт за 24 часа, Яндекс.Директ, SEO, аналитика. Тарифы от 45 000 ₽/мес. Начните с бесплатного аудита.',
    },
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('../pages/ServicesPage.vue'),
    meta: {
      title: 'Услуги — Подорожник',
      description:
        'Трафик, разработка, отдел продаж и стратегия: сайт за 24 часа, Яндекс.Директ, SEO, боты и аналитика в одной команде.',
    },
  },
  {
    path: '/services/:slug',
    name: 'service',
    component: () => import('../pages/ServicePage.vue'),
  },
  {
    path: '/cases',
    name: 'cases',
    component: () => import('../pages/CasesPage.vue'),
    meta: {
      title: 'Проекты — Подорожник',
      description: 'Кейсы Подорожник. Раздел наполняется реальными проектами.',
      noindex: true,
    },
  },
  {
    path: '/agency',
    name: 'agency',
    component: () => import('../pages/AgencyPage.vue'),
    meta: {
      title: 'Агентство — Подорожник',
      description:
        'Как работает Подорожник: внешний отдел маркетинга и IT. Одна команда отвечает за сайт, трафик и заявки.',
    },
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('../pages/ContactsPage.vue'),
    meta: {
      title: 'Контакты — Подорожник',
      description:
        'Телефон 8 (995) 600-42-28 и почта podoroznik-gk@yandex.ru. Обсудим задачу и формат работы.',
    },
  },
  {
    path: '/dlya/:slug',
    name: 'niche',
    component: () => import('../pages/NicheLandingPage.vue'),
    meta: {
      bare: true,
    },
  },
  {
    path: ADMIN_PATH,
    name: 'admin',
    component: () => import('../pages/AdminLeadsPage.vue'),
    meta: {
      bare: true,
      noindex: true,
      title: 'Админка — Подорожник',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/EmptyPage.vue'),
    props: {
      title: 'Страница не найдена',
      description: 'Такого адреса нет. Вернитесь на главную или откройте услуги.',
    },
    meta: {
      title: 'Страница не найдена — Подорожник',
      noindex: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.name === 'niche') {
    const niche = getNiche(to.params.slug)
    if (!niche) {
      return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }
    }
    to.meta.title = niche.meta.title
    to.meta.description = niche.meta.description
    return
  }

  if (to.name !== 'service') return
  const legacyTarget = legacyServiceRedirects[to.params.slug]
  if (legacyTarget) {
    return { name: 'service', params: { slug: legacyTarget }, replace: true }
  }
  const service = getService(to.params.slug)
  if (!service) {
    return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }
  }
  const group = getGroup(service.group)
  to.meta.title = `${service.title} — Подорожник`
  to.meta.description = service.lead
  to.meta.breadcrumb = [
    { name: 'Главная', path: '/' },
    { name: 'Услуги', path: '/services' },
    { name: group?.title || 'Услуга', path: `/services#${service.group}` },
    { name: service.shortTitle, path: `/services/${service.slug}` },
  ]
})

router.afterEach((to) => {
  applyPageMeta(to)
})

export default router
