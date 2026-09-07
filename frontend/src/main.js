import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installAnalytics } from './analytics/tracker'
import { contacts } from './data/site'
import { applyOrganizationJsonLd } from './utils/meta'
import './styles/main.css'

const app = createApp(App)
app.use(router)
installAnalytics(router)
applyOrganizationJsonLd(contacts)
app.mount('#app')
