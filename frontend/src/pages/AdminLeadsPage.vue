<script setup>
import { onMounted, ref } from 'vue'
import AdminTelegram from '../components/admin/AdminTelegram.vue'

const TOKEN_KEY = 'pd_admin_token'
const password = ref('')
const token = ref('')
const error = ref('')
const leads = ref([])
const total = ref(0)
const loading = ref(false)
const tab = ref('leads')

function authHeaders() {
  return { Authorization: `Bearer ${token.value}` }
}

async function login() {
  error.value = ''
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.value }),
  })
  if (!res.ok) {
    error.value = 'Неверный пароль'
    return
  }
  const data = await res.json()
  token.value = data.token
  sessionStorage.setItem(TOKEN_KEY, data.token)
  password.value = ''
  await loadLeads()
}

async function loadLeads() {
  loading.value = true
  error.value = ''
  const res = await fetch('/api/admin/leads', { headers: authHeaders() })
  if (res.status === 401) {
    logout()
    loading.value = false
    return
  }
  if (!res.ok) {
    error.value = 'Не удалось загрузить заявки'
    loading.value = false
    return
  }
  const data = await res.json()
  leads.value = data.items || []
  total.value = data.total || 0
  loading.value = false
}

async function removeLead(id) {
  if (!confirm(`Удалить заявку #${id}?`)) return
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 401) {
    logout()
    return
  }
  if (res.ok) await loadLeads()
}

function logout() {
  token.value = ''
  sessionStorage.removeItem(TOKEN_KEY)
  tab.value = 'leads'
}

function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU')
}

onMounted(() => {
  const stored = sessionStorage.getItem(TOKEN_KEY)
  if (stored) {
    token.value = stored
    loadLeads()
  }
})
</script>

<template>
  <main class="adm">
    <div class="adm__glow" aria-hidden="true"></div>
    <div class="adm__box">
      <form v-if="!token" class="adm__login card2" @submit.prevent="login">
        <p class="kicker">Админ-панель</p>
        <h1 class="adm__title">Вход</h1>
        <p class="adm__hint">Пароль задаётся в <code>ADMIN_PASSWORD</code> (backend/.env)</p>
        <label class="adm__field">
          <span>Пароль</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>
        <p v-if="error" class="adm__error">{{ error }}</p>
        <button class="button button--primary" type="submit">Войти</button>
      </form>

      <section v-else>
        <header class="adm__head">
          <div>
            <p class="kicker">Админ-панель</p>
            <h1 class="adm__title">
              <template v-if="tab === 'leads'">Заявки · {{ total }}</template>
              <template v-else>Telegram</template>
            </h1>
          </div>
          <div class="adm__actions">
            <button
              v-if="tab === 'leads'"
              class="button button--outline"
              type="button"
              :disabled="loading"
              @click="loadLeads"
            >
              Обновить
            </button>
            <button class="button button--outline" type="button" @click="logout">Выйти</button>
          </div>
        </header>

        <nav class="adm__tabs" aria-label="Разделы админки">
          <button type="button" :class="{ 'adm__tabs--on': tab === 'leads' }" @click="tab = 'leads'">
            Заявки
          </button>
          <button
            type="button"
            :class="{ 'adm__tabs--on': tab === 'telegram' }"
            @click="tab = 'telegram'"
          >
            Telegram
          </button>
        </nav>

        <AdminTelegram
          v-if="tab === 'telegram'"
          :token="token"
          @unauthorized="logout"
        />

        <div v-else>
          <p v-if="error" class="adm__error">{{ error }}</p>
          <p v-if="loading" class="adm__hint">Загрузка…</p>

          <ul v-else-if="leads.length" class="adm__list">
            <li v-for="lead in leads" :key="lead.id" class="adm__item card2">
              <div class="adm__item-copy">
                <strong class="adm__item-phone">#{{ lead.id }} · {{ lead.phone }}</strong>
                <p class="adm__item-name">{{ lead.name || 'Без имени' }}</p>
                <p v-if="lead.comment" class="adm__item-comment">{{ lead.comment }}</p>
                <p class="adm__meta">
                  {{ formatDate(lead.created_at) }}
                  · страница
                  <code>{{ lead.source || '/' }}</code>
                </p>
              </div>
              <button class="button button--outline" type="button" @click="removeLead(lead.id)">
                Удалить
              </button>
            </li>
          </ul>

          <p v-else class="adm__empty card2">Заявок пока нет</p>
        </div>
      </section>
    </div>
  </main>
</template>
