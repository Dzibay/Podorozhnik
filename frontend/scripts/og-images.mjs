import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sitePaths } from './routes.mjs'
import { ogImageKey } from '../src/utils/meta.js'
import { contacts } from '../src/data/site.js'
import { getService } from '../src/data/services.js'
import { getNiche, nicheList } from '../src/data/niches.js'
import { getShowcase } from '../src/data/nicheShowcase.js'
import { getProduct } from '../src/data/products.js'
import { getCase } from '../src/data/cases.js'

/**
 * Картинки для соцсетей и мессенджеров (og:image): public/og/<ключ>.jpg на каждую страницу.
 * Карточка в палитре страницы: посадочные ниш и услуг и кейсы — в своих цветах, остальное — в фирменных.
 * Рисует установленный Chrome или Edge без окна, поэтому в сборку (Docker) не входит:
 * после новых страниц или правок заголовков запустите npm run og и закоммитьте картинки.
 * Если картинки для страницы нет, пререндер подставит общую (default.jpg).
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'og')
const SIZE = { width: 1200, height: 630 }

const BRAND = {
  bg: '#ebe9e4',
  ink: '#141312',
  muted: '#5a5650',
  accent: '#e0461f',
  glow: ['#f8a348', '#ff89a9'],
}
const AUDIT = 'Начнём с бесплатного аудита'

/** Заголовки разделов — как на самих страницах */
const STATIC_CARDS = {
  default: { kicker: 'Внешний отдел маркетинга и IT', title: ['', 'Подорожник', ''], note: AUDIT },
  '/': { kicker: 'Внешний отдел маркетинга и IT', title: ['Заявки для', 'производства, стройки', 'и услуг'], note: AUDIT },
  '/services': { kicker: 'Услуги', title: ['Приводим клиентов.', 'Автоматизируем', 'всё, что после.'], note: AUDIT },
  '/dlya': { kicker: `Ниши · ${nicheList.length}`, title: ['Бизнес, который', 'стоит на земле', ''], note: AUDIT },
  '/cases': { kicker: 'Кейсы', title: ['Цифры,', 'а не обещания', ''], note: AUDIT },
  '/agency': { kicker: 'Подход', title: ['Внешний отдел', 'маркетинга и IT', ''], note: AUDIT },
  '/contacts': { kicker: 'Контакты', title: ['Один звонок —', 'и понятно, что делать', ''], note: AUDIT },
  '/privacy': { kicker: 'Документы', title: ['Политика обработки', 'персональных данных', ''], note: '' },
  '/consent': { kicker: 'Документы', title: ['Согласие на обработку', 'персональных данных', ''], note: '' },
}

/** Палитра посадочной: тёмный фон, свои чернила и акцент */
function landingTheme(theme) {
  return {
    bg: theme.bg,
    ink: theme.ink,
    muted: theme.muted || `color-mix(in srgb, ${theme.ink} 62%, ${theme.bg})`,
    accent: theme.accent,
    glow: [theme.accent, theme.accent2 || theme.accent],
  }
}

function card(path) {
  if (STATIC_CARDS[path]) return { ...STATIC_CARDS[path], theme: BRAND }
  const [, section, slug] = path.split('/')
  if (section === 'services') {
    const service = getService(slug)
    const product = getProduct(slug)
    if (!product) return { kicker: 'Услуги', title: ['', service.title, ''], note: AUDIT, theme: BRAND }
    const { hero } = product
    return {
      kicker: `Услуга · ${service.shortTitle}`,
      title: [hero.titleStart, hero.titleAccent, hero.titleEnd],
      note: AUDIT,
      theme: landingTheme(product.theme),
    }
  }
  if (section === 'dlya') {
    const niche = getNiche(slug)
    const { hero } = niche
    return {
      kicker: `Маркетинг для ниши · ${niche.label}`,
      title: [hero.titleStart, hero.titleAccent, hero.titleEnd],
      note: AUDIT,
      theme: getShowcase(slug) ? landingTheme(getShowcase(slug).theme) : BRAND,
    }
  }
  if (section === 'cases') {
    const item = getCase(slug)
    const [accent, ...rest] = item.headline
    return {
      kicker: `Кейс · ${item.nicheLabel}`,
      title: ['', accent, rest.join(' ')],
      note: item.client,
      theme: landingTheme(item.theme),
    }
  }
  throw new Error(`Нет карточки для ${path}`)
}

const escape = (text = '') =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const LEAF = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <defs><linearGradient id="leaf" x1="6" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#e0461f"/><stop offset="0.55" stop-color="#f27a3a"/><stop offset="1" stop-color="#ff89a9"/>
  </linearGradient></defs>
  <path d="M16 1.5c8.2 3.8 11.6 11.6 9.6 19.2-1.5 5.4-5.4 8.6-9.6 8.6s-8.1-3.2-9.6-8.6C4.4 13.1 7.8 5.3 16 1.5Z" fill="url(#leaf)"/>
  <g stroke="#f6f3ec" stroke-width="1.15" stroke-linecap="round" opacity="0.9">
    <path d="M16 4.5v23.2"/><path d="M16 4.5c-3.6 4.4-4.7 13.2-2.2 22.6"/><path d="M16 4.5c3.6 4.4 4.7 13.2 2.2 22.6"/>
    <path d="M16 4.5c-5.4 4.2-7.5 11.6-5.6 19.6"/><path d="M16 4.5c5.4 4.2 7.5 11.6 5.6 19.6"/>
  </g>
  <path d="M16 29.3v2.2" stroke="#e0461f" stroke-width="1.6" stroke-linecap="round"/>
</svg>`

function html({ kicker, title, note, theme }) {
  const [start, accent, end] = title.map(escape)
  // тире не начинает строку: держится за предыдущее слово неразрывным пробелом
  const heading = `${start} <em>${accent}</em> ${end}`.replace(/ (<em>)?— /g, ' $1— ')
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>
  html, body { margin: 0; width: ${SIZE.width}px; height: ${SIZE.height}px; overflow: hidden; }
  body {
    --bg: ${theme.bg}; --ink: ${theme.ink}; --muted: ${theme.muted}; --accent: ${theme.accent};
    position: relative; background: var(--bg); color: var(--ink);
    font-family: 'Golos Text Variable', sans-serif; -webkit-font-smoothing: antialiased;
  }
  .glow {
    position: absolute; right: -260px; bottom: -330px; width: 900px; height: 900px; border-radius: 50%;
    background: radial-gradient(closest-side, ${theme.glow[0]} 0%, color-mix(in srgb, ${theme.glow[1]} 55%, transparent) 45%, transparent 100%);
    opacity: 0.5;
  }
  .card { position: absolute; inset: 0; padding: 60px 72px 56px; display: flex; flex-direction: column; }
  .top, .bottom { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
  .brand { display: flex; align-items: center; gap: 14px; font-family: 'Unbounded Variable'; font-weight: 700; font-size: 30px; letter-spacing: -0.01em; }
  .brand svg { width: 46px; height: 46px; }
  .site, .phone { font-family: 'JetBrains Mono Variable', monospace; font-size: 22px; }
  .site { color: var(--muted); }
  .main { margin: auto 0; padding-right: 40px; }
  .kicker { font-family: 'JetBrains Mono Variable', monospace; font-size: 22px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); margin: 0 0 24px; }
  h1 { font-family: 'Unbounded Variable'; font-weight: 700; font-size: 76px; line-height: 1.06; letter-spacing: -0.025em; margin: 0; text-wrap: balance; }
  h1 em { font-style: normal; color: var(--accent); }
  .note { font-size: 24px; color: var(--muted); max-width: 720px; }
  .phone { font-weight: 500; white-space: nowrap; }
</style></head><body>
  <div class="glow"></div>
  <div class="card">
    <div class="top">
      <div class="brand">${LEAF}<span>Подорожник</span></div>
      <div class="site">podorozhnik-agency.ru</div>
    </div>
    <div class="main">
      <p class="kicker">${escape(kicker)}</p>
      <h1>${heading}</h1>
    </div>
    <div class="bottom">
      <div class="note">${escape(note)}</div>
      <div class="phone">${escape(contacts.phoneDisplay)}</div>
    </div>
  </div>
  <script>
    // длинный заголовок уменьшаем, пока он не влезет в три строки
    window.fit = () => {
      const h1 = document.querySelector('h1')
      let size = 76
      while (h1.offsetHeight > 3 * size * 1.06 + 2 && size > 44) {
        size -= 2
        h1.style.fontSize = size + 'px'
      }
    }
  </script>
</body></html>`
}

/** Шрифты сайта (@fontsource) одним файлом: woff2 вшиты как data:, страницам не нужен сервер */
function fontsCss() {
  const families = ['unbounded', 'golos-text', 'jetbrains-mono']
  return families
    .map((name) => {
      const dir = join(root, 'node_modules', '@fontsource-variable', name)
      return readFileSync(join(dir, 'index.css'), 'utf8').replace(/url\(\.\/files\/([^)]+)\)/g, (_, file) => {
        const data = readFileSync(join(dir, 'files', file)).toString('base64')
        return `url(data:font/woff2;base64,${data})`
      })
    })
    .join('\n')
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const found = candidates.find((path) => existsSync(path))
  if (!found) throw new Error('Не найден Chrome или Edge: укажите путь в CHROME_PATH')
  return found
}

/** Минимальный клиент DevTools-протокола: браузер без окна, одна вкладка 1200×630 */
async function openBrowser(profile) {
  const child = spawn(findBrowser(), [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ])
  const endpoint = await new Promise((resolve, reject) => {
    let log = ''
    child.stderr.on('data', (chunk) => {
      log += chunk
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/)
      if (match) resolve(match[1])
    })
    child.on('exit', () => reject(new Error(`Браузер закрылся:\n${log}`)))
  })
  const socket = new WebSocket(endpoint)
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })
  let lastId = 0
  const pending = new Map()
  const listeners = new Set()
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    } else listeners.forEach((listener) => listener(message))
  }
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++lastId
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params, sessionId }))
    })
  const event = (name, sessionId) =>
    new Promise((resolve) => {
      const listener = (message) => {
        if (message.method === name && message.sessionId === sessionId) {
          listeners.delete(listener)
          resolve(message.params)
        }
      }
      listeners.add(listener)
    })

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const page = (method, params) => send(method, params, sessionId)
  await page('Page.enable')
  await page('Emulation.setDeviceMetricsOverride', { ...SIZE, deviceScaleFactor: 1, mobile: false })

  return {
    async shoot(url) {
      const loaded = event('Page.loadEventFired', sessionId)
      await page('Page.navigate', { url })
      await loaded
      await page('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => fit())', awaitPromise: true })
      const { data } = await page('Page.captureScreenshot', { format: 'jpeg', quality: 88 })
      return Buffer.from(data, 'base64')
    },
    async close() {
      await send('Browser.close').catch(() => {})
      socket.close()
    },
  }
}

const work = mkdtempSync(join(tmpdir(), 'pd-og-'))
writeFileSync(join(work, 'fonts.css'), fontsCss())
mkdirSync(outDir, { recursive: true })

const browser = await openBrowser(join(work, 'profile'))
try {
  for (const path of ['default', ...sitePaths]) {
    const key = path === 'default' ? 'default' : ogImageKey(path)
    const file = join(work, `${key}.html`)
    writeFileSync(file, html(card(path)))
    writeFileSync(join(outDir, `${key}.jpg`), await browser.shoot(pathToFileURL(file).href))
  }
} finally {
  await browser.close()
  rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
console.log(`OG: ${sitePaths.length + 1} картинок в public/og`)
