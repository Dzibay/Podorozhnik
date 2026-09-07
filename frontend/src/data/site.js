export const site = {
  name: 'Podorozhnik',
  wordmark: 'ПОДОРОЖНИК',
  tagline: 'От идеи до реализации и продаж',
  brandLine: 'Full-cycle digital',
  /** Дефолтный прод-хост; в сборке перекрывается VITE_SITE_URL */
  fallbackUrl: 'https://podorozhnik-agency.ru',
}

/** Контакты агентства */
export const contacts = {
  phoneRaw: '88006004228',
  phoneDisplay: '8 (800) 600-42-28',
  phoneTel: 'tel:+78006004228',
  email: 'podoroznik-gk@yandex.ru',
  emailSubject: 'Заявка с сайта Подорожник',
  emailBody: 'Здравствуйте!\n\nХочу обсудить задачу:\n',
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
