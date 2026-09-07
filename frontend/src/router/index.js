import { createRouter, createWebHistory } from 'vue-router'
import { getGroup, getService } from '../data/services'
import { applyPageMeta } from '../utils/meta'

export const ADMIN_PATH = '/pd-panel-x7k2m9'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: {
      title: 'Подорожник — от идеи до продаж',
      description:
        'Full-cycle digital: сайты, SaaS, боты, CRM, автоматизация, маркетинг и таргетинг.',
    },
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('../pages/ServicesPage.vue'),
    meta: {
      title: 'Услуги — Подорожник',
      description: 'Продукт, система и рост: полный digital-цикл в одном агентстве.',
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
      description: 'Как работает Подорожник: один цикл от идеи до продаж.',
    },
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('../pages/ContactsPage.vue'),
    meta: {
      title: 'Контакты — Подорожник',
      description:
        'Телефон 8 (800) 600-42-28 и почта podoroznik-gk@yandex.ru. Обсудим задачу и формат работы.',
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
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.name !== 'service') return
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
