import { createApp as createClientApp, createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'
import { reveal } from './directives/reveal'
import { magnetic } from './directives/magnetic'
import { play } from './directives/play'
// шрифты лежат на нашем сервере: без запросов к Google и без блокирующего чужого CSS
import '@fontsource-variable/unbounded'
import '@fontsource-variable/golos-text'
import '@fontsource-variable/jetbrains-mono'
import './styles/main.css'

/**
 * Приложение для браузера и для пререндера.
 * hydrate — оживить готовый HTML из пререндера, а не рисовать страницу заново.
 */
export function createApp({ history, hydrate = false } = {}) {
  const app = hydrate ? createSSRApp(App) : createClientApp(App)
  const router = createAppRouter(history)
  app.use(router)
  app.directive('reveal', reveal)
  app.directive('magnetic', magnetic)
  app.directive('play', play)
  return { app, router }
}
