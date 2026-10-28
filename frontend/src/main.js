import { START_LOCATION } from 'vue-router'
import { createApp } from './createApp'
import { installAnalytics } from './analytics/tracker'
import { applyPageMeta } from './utils/meta'
import { installPerf } from './utils/perf'
import { installSpotlight } from './directives/reveal'
import { mountApp } from './utils/hydration'

const METRIKA_ID = 112383883

installPerf()

const root = document.getElementById('app')
// страница пришла готовым HTML из пререндера — оживляем его; пустая оболочка (админка) — рисуем с нуля
const hydrate = Boolean(root.firstElementChild)
const { app, router } = createApp({ hydrate })

router.afterEach((to, from) => {
  const head = applyPageMeta(to)
  // первый просмотр Метрика считает сама; переходы внутри сайта — отдельными хитами
  if (from === START_LOCATION || to.path === from.path || to.meta.admin) return
  window.ym?.(METRIKA_ID, 'hit', location.origin + to.fullPath, {
    title: head.title,
    referer: location.origin + from.fullPath,
  })
})
installAnalytics(router)

// после выкладки старые файлы сборки удаляются: вкладка, открытая до неё, не найдёт код новой
// страницы — тогда открываем её обычной загрузкой (не чаще раза в минуту, чтобы не зациклиться)
const STALE_BUILD = /dynamically imported module|module script failed|unable to preload css/i
router.onError((error, to) => {
  if (!STALE_BUILD.test(error?.message || '')) return
  const last = Number(sessionStorage.getItem('pd-stale-reload')) || 0
  if (Date.now() - last < 60_000) return
  sessionStorage.setItem('pd-stale-reload', String(Date.now()))
  window.location.assign(to.fullPath)
})

router.isReady().then(() => {
  mountApp(app, root, hydrate)
  installSpotlight()
})
