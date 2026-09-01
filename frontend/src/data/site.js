export const site = {
  name: 'Podorozhnik',
  wordmark: 'ПОДОРОЖНИК',
  tagline: 'От идеи до реализации и продаж',
  brandLine: 'Full-cycle digital',
  fallbackUrl: 'http://localhost:5173',
}

export const routes = {
  home: '/',
  services: '/services',
  service: (slug) => `/services/${slug}`,
  cases: '/cases',
  agency: '/agency',
  contacts: '/contacts',
}

export const headerNav = [
  { href: routes.services, label: 'Услуги' },
  { href: routes.cases, label: 'Проекты' },
  { href: routes.agency, label: 'Агентство' },
  { href: routes.contacts, label: 'Контакты' },
]

export const headerCta = {
  href: routes.contacts,
  label: 'Обсудить',
  event: 'cta_discuss_project',
}

export const footerNav = {
  company: [
    { href: routes.services, label: 'Услуги' },
    { href: routes.cases, label: 'Проекты' },
    { href: routes.agency, label: 'Агентство' },
    { href: routes.contacts, label: 'Контакты' },
  ],
}

export const analyticsEvents = {
  ctaDiscussProject: 'cta_discuss_project',
  briefSubmitted: 'brief_submitted',
  navOpened: 'nav_opened',
  serviceOpened: 'service_opened',
}
