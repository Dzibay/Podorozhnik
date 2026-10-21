import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installAnalytics } from './analytics/tracker'
import { contacts } from './data/site'
import { applyOrganizationJsonLd } from './utils/meta'
import { installPerf } from './utils/perf'
import { installSpotlight, reveal } from './directives/reveal'
import { magnetic } from './directives/magnetic'
import './styles/main.css'

installPerf()

const app = createApp(App)
app.use(router)
app.directive('reveal', reveal)
app.directive('magnetic', magnetic)
installAnalytics(router)
applyOrganizationJsonLd(contacts)
app.mount('#app')
installSpotlight()
