import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installAnalytics } from './analytics/tracker'
import './styles/main.css'

const app = createApp(App)
app.use(router)
installAnalytics(router)
app.mount('#app')
