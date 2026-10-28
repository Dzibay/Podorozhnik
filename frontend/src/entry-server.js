import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory } from 'vue-router'
import { createApp } from './createApp'
import { buildHead, renderHead } from './utils/meta'

/** Пререндер одной страницы: HTML приложения, <head> и модули, которые она использует */
export async function render(url) {
  const { app, router } = createApp({ history: createMemoryHistory(), hydrate: true })
  await router.push(url)
  await router.isReady()

  const ctx = {}
  const html = await renderToString(app, ctx)
  const route = router.currentRoute.value

  return {
    html,
    head: renderHead(buildHead(route)),
    teleports: ctx.teleports?.['#teleports'] || '',
    modules: [...(ctx.modules || [])],
    path: route.path,
    status: route.name === 'not-found' ? 404 : 200,
  }
}
