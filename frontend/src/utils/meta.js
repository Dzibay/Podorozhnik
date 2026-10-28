import { contacts } from '../data/site.js'

/**
 * Мета-теги и разметка schema.org страницы.
 * buildHead(route) описывает <head> страницы; в пререндере он печатается в HTML (renderHead),
 * в браузере применяется к документу при каждом переходе (applyPageMeta).
 */

/**
 * Базовый URL сайта без завершающего слэша.
 * Prod: задайте VITE_SITE_URL при сборке (например https://podorozhnik-agency.ru).
 */
export function getSiteUrl() {
  const raw = (import.meta.env.VITE_SITE_URL || 'https://podorozhnik-agency.ru').trim()
  return raw.replace(/\/$/, '')
}

const SITE_NAME = 'Подорожник'
const BRAND_SUFFIX = ` | ${SITE_NAME}`
/** Длиннее — поисковик обрежет заголовок многоточием */
const TITLE_MAX = 70

const DEFAULT_META = {
  title: 'Подорожник — внешний отдел маркетинга и IT: сайты, Директ, SEO',
  description:
    'Внешний отдел маркетинга и IT для малого и среднего бизнеса: сайты, Яндекс.Директ, SEO, аналитика, боты и автоматизация.',
}

/** Если заголовок не влезает в выдачу, первым жертвуем брендом в конце */
function fitTitle(title) {
  if (title.length > TITLE_MAX && title.endsWith(BRAND_SUFFIX)) return title.slice(0, -BRAND_SUFFIX.length)
  return title
}

/** Картинка для соцсетей и мессенджеров: своя на каждую страницу, у служебных — общая */
export function ogImageKey(path, noindex = false) {
  if (noindex) return 'default'
  if (path === '/') return 'home'
  return path.replace(/^\/|\/$/g, '').replace(/\//g, '--')
}

function organization(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: 'Podorozhnik',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/web-app-manifest-512x512.png`,
    description: DEFAULT_META.description,
    email: contacts.email,
    telephone: contacts.phoneRaw,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: contacts.phoneRaw,
      email: contacts.email,
      availableLanguage: 'ru',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
    },
  }
}

function website(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: SITE_NAME,
    inLanguage: 'ru-RU',
    publisher: { '@id': `${siteUrl}/#organization` },
  }
}

function breadcrumbs(siteUrl, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  }
}

function faqPage(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

function service(siteUrl, url, data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    url,
    provider: { '@id': `${siteUrl}/#organization` },
    areaServed: { '@type': 'Country', name: 'Россия' },
  }
}

/** Кейс — статья агентства о проекте */
function article(siteUrl, url, image, data) {
  const agency = { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: SITE_NAME, url: `${siteUrl}/` }
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    image,
    url,
    mainEntityOfPage: url,
    inLanguage: 'ru-RU',
    author: agency,
    publisher: agency,
  }
}

/** Всё, что должно оказаться в <head> страницы */
export function buildHead(route) {
  const meta = route.meta || {}
  const siteUrl = getSiteUrl()
  const title = fitTitle(meta.title || DEFAULT_META.title)
  const description = meta.description || DEFAULT_META.description
  const noindex = Boolean(meta.noindex)
  const path = route.path || '/'
  const url = `${siteUrl}${path}`
  // картинки рисует scripts/og-images.mjs (npm run og)
  const image = `${siteUrl}/og/${ogImageKey(path, noindex)}.jpg`

  const tags = [
    ['name', 'description', description],
    ['name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'],
    ['property', 'og:type', meta.article ? 'article' : 'website'],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:locale', 'ru_RU'],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', noindex ? `${siteUrl}/` : url],
    ['property', 'og:image', image],
    ['property', 'og:image:type', 'image/jpeg'],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['property', 'og:image:alt', title],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
  ]

  const jsonLd = []
  if (!noindex) {
    jsonLd.push(['ld-organization', organization(siteUrl)])
    if (route.name === 'home') jsonLd.push(['ld-website', website(siteUrl)])
    if (meta.breadcrumb) jsonLd.push(['ld-breadcrumb', breadcrumbs(siteUrl, meta.breadcrumb)])
    if (meta.service) jsonLd.push(['ld-service', service(siteUrl, url, meta.service)])
    if (meta.article) jsonLd.push(['ld-article', article(siteUrl, url, image, meta.article)])
    if (meta.faq?.length) jsonLd.push(['ld-faq', faqPage(meta.faq)])
  }

  // на служебных страницах canonical не указываем вовсе
  return { title, tags, canonical: noindex ? null : url, jsonLd }
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** JSON внутри <script>: «</script>» в тексте не должен закрыть тег */
function jsonForScript(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** <head> страницы строкой — для пререндера */
export function renderHead(head) {
  const lines = [`<title>${escapeHtml(head.title)}</title>`]
  for (const [attr, key, content] of head.tags) {
    lines.push(`<meta ${attr}="${key}" content="${escapeHtml(content)}" />`)
  }
  if (head.canonical) lines.push(`<link rel="canonical" href="${escapeHtml(head.canonical)}" />`)
  for (const [id, data] of head.jsonLd) {
    lines.push(`<script type="application/ld+json" id="${id}">${jsonForScript(data)}</script>`)
  }
  return lines.join('\n    ')
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(list) {
  const keep = new Set(list.map(([id]) => id))
  for (const el of document.head.querySelectorAll('script[type="application/ld+json"][id^="ld-"]')) {
    if (!keep.has(el.id)) el.remove()
  }
  for (const [id, data] of list) {
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = id
      document.head.appendChild(el)
    }
    const text = JSON.stringify(data)
    if (el.textContent !== text) el.textContent = text
  }
}

/** Мета-теги после перехода по сайту */
export function applyPageMeta(route) {
  const head = buildHead(route)
  document.title = head.title
  for (const [attr, key, content] of head.tags) setMeta(attr, key, content)
  setCanonical(head.canonical)
  setJsonLd(head.jsonLd)
  return head
}
