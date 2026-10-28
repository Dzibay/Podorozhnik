import { services } from '../src/data/services.js'
import { nicheList } from '../src/data/niches.js'
import { cases } from '../src/data/cases.js'

/** Публичные страницы сайта: по ним строятся sitemap.xml, пререндер и картинки для соцсетей */
export const ADMIN_PATH = '/admin-panel'

export const staticPaths = ['/', '/services', '/dlya', '/cases', '/agency', '/contacts', '/privacy', '/consent']

export const sitePaths = [
  ...staticPaths,
  ...services.map((item) => `/services/${item.slug}`),
  ...nicheList.map((item) => `/dlya/${item.slug}`),
  ...cases.map((item) => `/cases/${item.slug}`),
]

export function getSiteUrl() {
  const raw = (process.env.VITE_SITE_URL || process.env.SITE_ADDRESS || 'https://podorozhnik-agency.ru').trim()
  return (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/$/, '')
}
