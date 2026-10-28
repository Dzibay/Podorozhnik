import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sitePaths } from './routes.mjs'

/**
 * Пререндер: каждая публичная страница сохраняется готовым HTML (dist/<путь>/index.html),
 * чтобы поисковики и мессенджеры видели текст, заголовки и мета-теги без JavaScript.
 * В браузере Vue оживляет этот HTML, а не рисует страницу заново.
 * Запускается после двух сборок: клиентской (dist) и серверной (dist-ssr).
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDist = join(root, 'dist-ssr')

// кириллица заголовков и текста нужна на первом экране любой страницы — грузим её сразу,
// не дожидаясь, пока браузер разберёт стили
const fontPreloads = readdirSync(join(dist, 'assets'))
  .filter((file) => /^(unbounded|golos-text)-cyrillic-wght-normal-[\w-]+\.woff2$/.test(file))
  .map((file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${file}">`)
if (fontPreloads.length !== 2) throw new Error(`Пререндер: ожидали 2 шрифта для предзагрузки, нашли ${fontPreloads.length}`)

const template = readFileSync(join(dist, 'index.html'), 'utf8').replace(
  '</head>',
  () => `  ${fontPreloads.join('\n    ')}\n  </head>`,
)
const readManifest = (file) => JSON.parse(readFileSync(join(dist, '.vite', file), 'utf8'))
// ssr-manifest: какие чанки нужны модулям, отрисованным на странице; manifest: что импортирует каждый чанк
const ssrManifest = readManifest('ssr-manifest.json')
const manifest = readManifest('manifest.json')
const chunkByFile = new Map(Object.values(manifest).map((chunk) => [`/${chunk.file}`, chunk]))
const { render } = await import(pathToFileURL(join(ssrDist, 'entry-server.js')).href)

// то, что шаблон уже подключает (общий бандл и стили), второй раз не добавляем
const inTemplate = new Set([...template.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]))

/**
 * Стили и предзагрузка чанков, из которых собрана страница, вместе со всем, что они
 * импортируют (например, данными посадочных): иначе браузер узнает о них, только скачав чанк.
 */
function assetLinks(modules) {
  const seen = new Set(inTemplate)
  const css = []
  const js = []
  const addCss = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    css.push(`<link rel="stylesheet" crossorigin href="${file}">`)
  }
  const addJs = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    js.push(`<link rel="modulepreload" crossorigin href="${file}">`)
    const chunk = chunkByFile.get(file)
    for (const key of chunk?.imports || []) addJs(`/${manifest[key].file}`)
    for (const style of chunk?.css || []) addCss(`/${style}`)
  }
  for (const id of modules) {
    for (const file of ssrManifest[id] || []) {
      if (file.endsWith('.css')) addCss(file)
      else if (file.endsWith('.js')) addJs(file)
    }
  }
  return [...js, ...css].join('\n    ')
}

// у новой страницы картинки для соцсетей может ещё не быть (их рисует npm run og) — тогда общая
const noOgImage = new Set()
function withOgFallback(head) {
  return head.replace(/\/og\/([a-z0-9-]+)\.jpg/g, (match, key) => {
    if (existsSync(join(dist, 'og', `${key}.jpg`))) return match
    noOgImage.add(key)
    return '/og/default.jpg'
  })
}

function page(rendered) {
  // функции вместо строк: «$» в тексте страницы не должен читаться как шаблон замены
  return template
    .replace('<!--app-head-->', () => withOgFallback(rendered.head))
    .replace('</head>', () => `  ${assetLinks(rendered.modules)}\n  </head>`)
    .replace('<!--app-html-->', () => rendered.html)
    .replace('<!--app-teleports-->', () => rendered.teleports)
}

function save(file, html) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html, 'utf8')
}

for (const path of sitePaths) {
  const rendered = await render(path)
  if (rendered.status !== 200 || rendered.path !== path) {
    throw new Error(`Пререндер ${path}: вместо страницы ${rendered.status} ${rendered.path}`)
  }
  save(path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html'), page(rendered))
}

// страница 404: nginx отдаёт её с кодом 404 на любой неизвестный адрес
const missing = await render('/404')
if (missing.status !== 404) throw new Error('Пререндер 404: роутер не отдал страницу «не найдено»')
save(join(dist, '404.html'), page(missing))

// пустая оболочка для админки: она рисуется в браузере и не индексируется
save(
  join(dist, 'spa.html'),
  template
    .replace('<!--app-head-->', '<title>Подорожник</title>\n    <meta name="robots" content="noindex, nofollow" />')
    .replace('<!--app-html-->', '')
    .replace('<!--app-teleports-->', ''),
)

rmSync(join(dist, '.vite'), { recursive: true, force: true })
rmSync(ssrDist, { recursive: true, force: true })

console.log(`Prerendered ${sitePaths.length} pages + 404.html + spa.html`)
if (noOgImage.size) {
  console.warn(`Нет картинки для соцсетей (взята общая): ${[...noOgImage].join(', ')}. Запустите npm run og`)
}
