import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Выжимки из больших файлов данных — виртуальные модули virtual:<имя>.
 * В чанк попадает только нужное (slug, название, карточка), а не тексты всех посадочных:
 * подвал, главная, каталог ниш и хаб услуг не тянут сотни килобайт.
 * При сборке выжимка считается заранее и вшивается как JSON; при разработке —
 * на лету из исходника, чтобы правки данных подхватывались сразу.
 * pick — самодостаточная функция: при разработке её текст вставляется в код модуля.
 */
const dataIndexes = {
  'niche-index': {
    source: '/src/data/niches.js',
    name: 'nicheIndex',
    pick: (data) => data.nicheList.map(({ slug, label }) => ({ slug, label })),
  },
  'niche-cards': {
    source: '/src/data/niches.js',
    name: 'nicheCards',
    pick: (data) => data.nicheList.map(({ slug, label, card }) => ({ slug, label, card })),
  },
  'product-accents': {
    source: '/src/data/products.js',
    name: 'productAccents',
    pick: (data) => Object.fromEntries(Object.entries(data.products).map(([slug, item]) => [slug, item.theme.accent])),
  },
}

function dataIndex() {
  const prefix = 'virtual:'
  let serve = false
  let root = process.cwd()
  return {
    name: 'data-index',
    configResolved(config) {
      serve = config.command === 'serve'
      root = config.root
    },
    resolveId(source) {
      return source.startsWith(prefix) && dataIndexes[source.slice(prefix.length)] ? `\0${source}` : null
    },
    async load(id) {
      if (!id.startsWith(`\0${prefix}`)) return null
      const { source, name, pick } = dataIndexes[id.slice(prefix.length + 1)]
      if (serve) return `import * as data from '${source}'\nexport const ${name} = (${pick})(data)\n`
      const data = await import(pathToFileURL(join(root, source)).href)
      return `export const ${name} = ${JSON.stringify(pick(data))}\n`
    },
  }
}

/**
 * vite preview отвечает так же, как nginx в проде (nginx.conf): /agency → dist/agency/index.html,
 * /services/ → 301 на /services, /admin-panel → spa.html, неизвестный адрес → 404.html с кодом 404.
 * Сам preview на любой адрес без «/» в конце отдаёт главную — и проверка сборки врёт.
 */
function previewLikeNginx() {
  let outDir = ''
  const isFile = (path) => existsSync(path) && statSync(path).isFile()
  return {
    name: 'preview-like-nginx',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://preview')
        let path
        try {
          path = decodeURIComponent(url.pathname)
        } catch {
          return next()
        }
        if (!['GET', 'HEAD'].includes(req.method) || /^\/(api|uploads)\//.test(path)) return next()
        if (path.length > 1 && path.endsWith('/')) {
          res.writeHead(301, { Location: path.slice(0, -1) + url.search }).end()
          return
        }
        if (path === '/admin-panel') req.url = `/spa.html${url.search}`
        else if (path === '/' || isFile(join(outDir, path))) return next()
        else if (isFile(join(outDir, path, 'index.html'))) req.url = `${path}/index.html${url.search}`
        else {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(readFileSync(join(outDir, '404.html')))
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [vue(), dataIndex(), previewLikeNginx()],
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  build: {
    // карты «модуль → чанки» для пререндера: каждой странице свои стили и предзагрузка
    manifest: !isSsrBuild,
    ssrManifest: !isSsrBuild,
    // самый большой чанк — three.js (~550 КБ): он грузится лениво и только для 3D-сцен
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
}))
