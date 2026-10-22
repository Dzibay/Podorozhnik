import { createRouter, createWebHistory } from 'vue-router'
import { getService, getTrack, legacyServiceRedirects } from '../data/services'
import { getProduct } from '../data/products'
import { getNiche } from '../data/niches'
import { getCase } from '../data/cases'
import { applyPageMeta } from '../utils/meta'

export const ADMIN_PATH = '/admin-panel'
const LEGACY_ADMIN_PATH = '/pd-panel-x7k2m9'

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
        'Два направления одной команды: приводим клиентов (Яндекс.Директ, SEO, аналитика) и автоматизируем (сайты, боты, SaaS, AI-ассистенты).',
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
      title: 'Кейсы — Подорожник',
      description:
        'Кейсы Подорожник: производство, премиальные кухни, загородная недвижимость, онлайн-школа, дизайн продукта — что сделали и к чему это привело.',
    },
  },
  {
    path: '/cases/:slug',
    name: 'case',
    component: () => import('../pages/CasePage.vue'),
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
        'Телефон +7 (995) 630-42-81 и почта podoroznik-gk@yandex.ru. Обсудим задачу и формат работы.',
    },
  },
  {
    path: '/dlya',
    name: 'niches',
    component: () => import('../pages/NichesPage.vue'),
    meta: {
      title: 'Ниши — Подорожник',
      description:
        'Для каких бизнесов работаем: производство, стройка, мебель, клиники, автосервисы и другие ниши. Как приводим клиентов в каждой.',
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
    path: '/privacy',
    alias: ['/privacy/'],
    name: 'privacy',
    component: () => import('../pages/LegalPage.vue'),
    props: { doc: 'privacy' },
    meta: {
      title: 'Политика обработки персональных данных — Подорожник',
      description:
        'Политика в отношении обработки персональных данных самозанятого Колесникова Никиты Андреевича.',
    },
  },
  {
    path: '/consent',
    alias: ['/consent/'],
    name: 'consent',
    component: () => import('../pages/LegalPage.vue'),
    props: { doc: 'consent' },
    meta: {
      title: 'Согласие на обработку персональных данных — Подорожник',
      description:
        'Согласие на обработку персональных данных пользователей сайта podorozhnik-agency.ru.',
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
    path: LEGACY_ADMIN_PATH,
    redirect: ADMIN_PATH,
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

  if (to.name === 'case') {
    const item = getCase(to.params.slug)
    if (!item) {
      return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }
    }
    to.meta.title = `${item.title} — кейс Подорожник`
    to.meta.description = `${item.client}. ${item.lead}`
    to.meta.darkTop = item.theme.dark
    to.meta.breadcrumb = [
      { name: 'Главная', path: '/' },
      { name: 'Кейсы', path: '/cases' },
      { name: item.title, path: `/cases/${item.slug}` },
    ]
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
  const track = getTrack(service.slug)
  const product = getProduct(service.slug)
  to.meta.title = product?.meta.title || `${service.title} — Подорожник`
  to.meta.description = product?.meta.description || service.lead
  // у IT-направлений своя посадочная со своей шапкой
  to.meta.bare = Boolean(product)
  to.meta.breadcrumb = [
    { name: 'Главная', path: '/' },
    { name: 'Услуги', path: '/services' },
    { name: track?.title || 'Услуга', path: `/services#${track?.id || ''}` },
    { name: service.shortTitle, path: `/services/${service.slug}` },
  ]
})

router.afterEach((to) => {
  applyPageMeta(to)
})

export default router
