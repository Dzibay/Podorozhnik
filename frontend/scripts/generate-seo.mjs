import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ADMIN_PATH, getSiteUrl, sitePaths } from './routes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const siteUrl = getSiteUrl()

// без lastmod: дата сборки у всех страниц сразу только сбивает поисковики
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitePaths.map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n  </url>`).join('\n')}
</urlset>
`

// Clean-param — для Яндекса: адреса с метками рекламы считаются той же страницей
const robots = `User-agent: *
Allow: /
Disallow: ${ADMIN_PATH}
Disallow: /api/
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&ysclid&gclid&fbclid&_openstat

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8')

console.log(`SEO files generated for ${siteUrl} (${sitePaths.length} urls)`)
