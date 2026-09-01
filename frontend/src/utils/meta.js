const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

const DEFAULT_META = {
  title: 'Подорожник — от идеи до продаж',
  description:
    'Full-cycle digital: сайты, SaaS, боты, CRM, автоматизация, маркетинг и таргетинг.',
}

function setTag(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(attrs.rel ? 'link' : 'meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value))
}

export function applyPageMeta(route) {
  const title = route.meta?.title || DEFAULT_META.title
  const description = route.meta?.description || DEFAULT_META.description
  const noindex = !!route.meta?.noindex
  const url = noindex ? `${SITE_URL}/` : SITE_URL + route.path

  document.title = title
  setTag('meta[name="description"]', { name: 'description', content: description })
  setTag('link[rel="canonical"]', { rel: 'canonical', href: url })
  setTag('meta[property="og:title"]', { property: 'og:title', content: title })
  setTag('meta[property="og:description"]', { property: 'og:description', content: description })
  setTag('meta[property="og:url"]', { property: 'og:url', content: url })
  setTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  setTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description })

  const robots = noindex ? 'noindex, nofollow' : 'index, follow'
  setTag('meta[name="robots"]', { name: 'robots', content: robots })
}
