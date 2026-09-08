import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { services } from '../src/data/services.js'
import { nicheList } from '../src/data/niches.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const raw = (process.env.VITE_SITE_URL || process.env.SITE_ADDRESS || 'https://podorozhnik-agency.ru').trim()
const siteUrl = (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/$/, '')

const ADMIN_PATH = '/admin-panel'

const staticPaths = ['/', '/services', '/agency', '/contacts']
const servicePaths = services.map((item) => `/services/${item.slug}`)
const nichePaths = nicheList.map((item) => `/dlya/${item.slug}`)
const paths = [...staticPaths, ...servicePaths, ...nichePaths]

const today = new Date().toISOString().slice(0, 10)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path === '/' ? '/' : path}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: ${ADMIN_PATH}

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(join(publicDir, 'sitemap.xml'), `${sitemap}\n`, 'utf8')
writeFileSync(join(publicDir, 'robots.txt'), `${robots}\n`, 'utf8')

console.log(`SEO files generated for ${siteUrl} (${paths.length} urls)`)
