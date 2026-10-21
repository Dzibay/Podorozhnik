export const site = {
  name: 'Podorozhnik',
  wordmark: 'ПОДОРОЖНИК',
  tagline: 'Внешний отдел маркетинга и IT',
  brandLine: 'Маркетинг и IT для реального бизнеса',
  /** Дефолтный прод-хост; в сборке перекрывается VITE_SITE_URL */
  fallbackUrl: 'https://podorozhnik-agency.ru',
}

/** Контакты агентства */
export const contacts = {
  phoneRaw: '+79956304281',
  phoneDisplay: '+7 (995) 630-42-81',
  phoneTel: 'tel:+79956304281',
  email: 'podoroznik-gk@yandex.ru',
  emailSubject: 'Заявка с сайта Подорожник',
  emailBody: 'Здравствуйте!\n\nХочу обсудить задачу:\n',
  /** Telegram по номеру телефона; заменить на t.me/<username>, если поиск по номеру закрыт */
  telegramUrl: 'https://t.me/+79956304281',
}

export const routes = {
  home: '/',
  services: '/services',
  service: (slug) => `/services/${slug}`,
  niche: (slug) => `/dlya/${slug}`,
  cases: '/cases',
  case: (slug) => `/cases/${slug}`,
  agency: '/agency',
  contacts: '/contacts',
  privacy: '/privacy',
  consent: '/consent',
}

export const headerNav = [
  { href: routes.services, label: 'Услуги' },
  { href: '/#niches', label: 'Ниши' },
  { href: routes.cases, label: 'Кейсы' },
  { href: '/#pricing', label: 'Тарифы' },
  { href: routes.contacts, label: 'Контакты' },
]

export const headerCta = {
  href: routes.contacts,
  label: 'Бесплатный аудит',
  event: 'cta_discuss_project',
}

export const footerNav = {
  company: [
    { href: routes.services, label: 'Услуги' },
    { href: routes.cases, label: 'Кейсы' },
    { href: '/#pricing', label: 'Тарифы' },
    { href: routes.agency, label: 'Подход' },
    { href: routes.contacts, label: 'Контакты' },
  ],
}

export const analyticsEvents = {
  ctaDiscussProject: 'cta_discuss_project',
  briefSubmitted: 'brief_submitted',
  navOpened: 'nav_opened',
  serviceOpened: 'service_opened',
}
