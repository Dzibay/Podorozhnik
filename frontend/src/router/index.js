import { createRouter, createWebHistory } from 'vue-router'
import { getService, legacyServiceRedirects } from '../data/services'

export const ADMIN_PATH = '/admin-panel'
const LEGACY_ADMIN_PATH = '/pd-panel-x7k2m9'

const HOME = { name: 'Главная', path: '/' }

/** Крошки хаба: Главная → раздел */
function hubCrumbs(name, path) {
  return [HOME, { name, path }]
}

export const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: {
      title: 'Подорожник — внешний отдел маркетинга и IT: сайты, Директ, SEO',
      description:
        'Заявки для производства, стройки и услуг: сайт за 24 часа, Яндекс.Директ, SEO, аналитика. Тарифы от 45 000 ₽/мес. Начните с бесплатного аудита.',
    },
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('../pages/ServicesPage.vue'),
    meta: {
      title: 'Услуги: Яндекс.Директ, SEO, сайты, боты и автоматизация — Подорожник',
      description:
        'Два направления одной команды: приводим клиентов (Яндекс.Директ, SEO, аналитика) и автоматизируем (сайты, боты, SaaS, AI-ассистенты). Цены и сроки по каждой услуге.',
      breadcrumb: hubCrumbs('Услуги', '/services'),
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
      title: 'Кейсы: заявки и продажи для производства, ремонта и услуг — Подорожник',
      description:
        'Проекты с цифрами: завод металлоконструкций, премиальные кухни, коттеджный посёлок, онлайн-школа. Что сделали и сколько заявок это принесло.',
      breadcrumb: hubCrumbs('Кейсы', '/cases'),
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
      title: 'Подход: как работает внешний отдел маркетинга и IT — Подорожник',
      description:
        'Одна команда отвечает за сайт, рекламу, аналитику и связь с отделом продаж. Начинаем с бесплатного аудита, а домен, сайт и кабинеты остаются вашими.',
      breadcrumb: hubCrumbs('Подход', '/agency'),
    },
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('../pages/ContactsPage.vue'),
    meta: {
      title: 'Контакты и бесплатный аудит — Подорожник',
      description:
        'Телефон +7 (995) 630-42-81 и почта podoroznik-gk@yandex.ru. Пн–Пт, 10:00–19:00 по Москве. Обсудим задачу и бесплатно разберём ваш маркетинг.',
      breadcrumb: hubCrumbs('Контакты', '/contacts'),
    },
  },
  {
    path: '/dlya',
    name: 'niches',
    component: () => import('../pages/NichesPage.vue'),
    meta: {
      title: 'Маркетинг по нишам: производство, стройка, услуги — Подорожник',
      description:
        'Для каких бизнесов работаем: производство, стройка, мебель, клиники, автосервисы и ещё два десятка ниш. Как приводим клиентов в каждой.',
      breadcrumb: hubCrumbs('Ниши', '/dlya'),
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
    name: 'privacy',
    component: () => import('../pages/LegalPage.vue'),
    props: { doc: 'privacy' },
    meta: {
      title: 'Политика обработки персональных данных — Подорожник',
      description:
        'Политика в отношении обработки персональных данных самозанятого Колесникова Никиты Андреевича: какие данные собираем, зачем и как храним.',
    },
  },
  {
    path: '/consent',
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
      admin: true,
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

function notFound(to) {
  return {
    name: 'not-found',
    params: { pathMatch: to.path.slice(1).split('/') },
    query: to.query,
    hash: to.hash,
  }
}

/**
 * Мета страниц с параметром. Данные грузятся отдельными чанками:
 * тексты ниш, кейсов и посадочных не попадают в общий бандл.
 */
const resolvers = {
  async home(to) {
    const { homeCopy } = await import('../data/home')
    to.meta.faq = homeCopy.faq.items
  },

  async niche(to) {
    const { getNiche } = await import('../data/niches')
    const niche = getNiche(to.params.slug)
    if (!niche) return notFound(to)
    to.meta.title = niche.meta.title
    to.meta.description = niche.meta.description
    to.meta.faq = niche.faq.items
    to.meta.service = { name: `Маркетинг и сайты: ${niche.label.toLowerCase()}`, description: niche.meta.description }
    to.meta.breadcrumb = [HOME, { name: 'Ниши', path: '/dlya' }, { name: niche.label, path: to.path }]
  },

  async case(to) {
    const { getCase } = await import('../data/cases')
    const item = getCase(to.params.slug)
    if (!item) return notFound(to)
    // бренд в конце отбросится, если заголовок не влезет в выдачу
    to.meta.title = `${item.meta.title} — кейс | Подорожник`
    to.meta.description = item.meta.description
    to.meta.article = { headline: item.meta.title, description: item.meta.description }
    to.meta.darkTop = item.theme.dark
    to.meta.breadcrumb = [HOME, { name: 'Кейсы', path: '/cases' }, { name: item.title, path: to.path }]
  },

  async service(to) {
    const legacyTarget = legacyServiceRedirects[to.params.slug]
    if (legacyTarget) {
      return { name: 'service', params: { slug: legacyTarget }, query: to.query, hash: to.hash, replace: true }
    }
    const service = getService(to.params.slug)
    if (!service) return notFound(to)
    const { getProduct } = await import('../data/products')
    const product = getProduct(service.slug)
    to.meta.title = product?.meta.title || `${service.title} — Подорожник`
    to.meta.description = product?.meta.description || service.lead
    // у услуг своя посадочная со своей шапкой
    to.meta.bare = Boolean(product)
    to.meta.faq = product?.faq
    to.meta.service = { name: service.title, description: service.lead }
    to.meta.breadcrumb = [HOME, { name: 'Услуги', path: '/services' }, { name: service.shortTitle, path: to.path }]
  },
}

function scrollBehavior(to) {
  if (to.hash) {
    return { el: to.hash, top: 80, behavior: 'smooth' }
  }
  return { top: 0 }
}

/** Свой роутер на каждый рендер: в браузере — история окна, в пререндере — память */
export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes, scrollBehavior })
  router.beforeEach((to) => resolvers[to.name]?.(to))
  return router
}
