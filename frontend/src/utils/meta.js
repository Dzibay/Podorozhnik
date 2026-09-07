/**
 * Базовый URL сайта без завершающего слэша.
 * Prod: задайте VITE_SITE_URL при сборке (например https://podorozhnik-agency.ru).
 */
export function getSiteUrl() {
  const raw = (import.meta.env.VITE_SITE_URL || 'https://podorozhnik-agency.ru').trim()
  return raw.replace(/\/$/, '')
}

const DEFAULT_META = {
  title: 'Подорожник — от идеи до продаж',
  description:
    'Full-cycle digital: сайты, SaaS, боты, CRM, автоматизация, маркетинг и таргетинг.',
}

function setMeta(attr, key, content) {
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove()
}

/** Организация — один раз на всех публичных страницах */
export function applyOrganizationJsonLd(contacts) {
  const siteUrl = getSiteUrl()
  setJsonLd('ld-organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Подорожник',
    alternateName: 'Podorozhnik',
    url: siteUrl,
    email: contacts.email,
    telephone: contacts.phoneTel.replace(/^tel:/, ''),
    description: DEFAULT_META.description,
    sameAs: [],
  })
}

export function applyPageMeta(route) {
  const siteUrl = getSiteUrl()
  const title = route.meta?.title || DEFAULT_META.title
  const description = route.meta?.description || DEFAULT_META.description
  const noindex = !!route.meta?.noindex
  const path = route.path || '/'
  const url = `${siteUrl}${path === '/' ? '/' : path}`
  const image = `${siteUrl}/og.svg`

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

  if (noindex) {
    // На служебных страницах canonical не указываем на главную
    document.head.querySelector('link[rel="canonical"]')?.remove()
  } else {
    setLink('canonical', url)
  }

  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:site_name', 'Подорожник')
  setMeta('property', 'og:locale', 'ru_RU')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', noindex ? siteUrl + '/' : url)
  setMeta('property', 'og:image', image)

  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)

  // Хлебные крошки на страницах услуг
  if (route.name === 'service' && route.meta?.breadcrumb) {
    setJsonLd('ld-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: route.meta.breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    })
  } else {
    removeJsonLd('ld-breadcrumb')
  }
}
