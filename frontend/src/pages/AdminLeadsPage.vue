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
const loggingIn = ref(false)
const tab = ref('leads')

function authHeaders() {
  return { Authorization: `Bearer ${token.value}` }
}

async function login() {
  error.value = ''
  loggingIn.value = true
  try {
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
  } finally {
    loggingIn.value = false
  }
}

async function loadLeads() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/admin/leads', { headers: authHeaders() })
    if (res.status === 401) {
      logout()
      return
    }
    if (!res.ok) {
      error.value = 'Не удалось загрузить заявки'
      return
    }
    const data = await res.json()
    leads.value = data.items || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
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

    <div class="adm__shell">
      <!-- Login -->
      <form v-if="!token" class="adm-login" @submit.prevent="login">
        <p class="adm-login__kicker">Админ-панель</p>
        <h1 class="adm-login__title">Вход</h1>
        <p class="adm-login__hint">
          Пароль из <code>ADMIN_PASSWORD</code> в <code>backend/.env</code>
        </p>

        <label class="adm-login__field">
          <span>Пароль</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        <p v-if="error" class="adm__error" role="alert">{{ error }}</p>

        <button class="adm-btn adm-btn--primary adm-btn--block" type="submit" :disabled="loggingIn">
          <span v-if="loggingIn" class="adm-spinner" aria-hidden="true" />
          {{ loggingIn ? 'Входим…' : 'Войти' }}
        </button>
      </form>

      <!-- Panel -->
      <section v-else class="adm-panel">
        <header class="adm-panel__head">
          <div class="adm-panel__titles">
            <p class="adm-login__kicker">Админ-панель</p>
            <h1 class="adm-panel__title">
              <template v-if="tab === 'leads'">Заявки · {{ total }}</template>
              <template v-else>Telegram</template>
            </h1>
          </div>
          <div class="adm-panel__actions">
            <button
              v-if="tab === 'leads'"
              class="adm-btn adm-btn--ghost"
              type="button"
              :disabled="loading"
              @click="loadLeads"
            >
              <span v-if="loading" class="adm-spinner" aria-hidden="true" />
              {{ loading ? 'Обновляем…' : 'Обновить' }}
            </button>
            <button class="adm-btn adm-btn--ghost" type="button" @click="logout">Выйти</button>
          </div>
        </header>

        <nav class="adm-tabs" aria-label="Разделы админки">
          <button
            type="button"
            class="adm-tabs__btn"
            :class="{ 'adm-tabs__btn--on': tab === 'leads' }"
            @click="tab = 'leads'"
          >
            Заявки
          </button>
          <button
            type="button"
            class="adm-tabs__btn"
            :class="{ 'adm-tabs__btn--on': tab === 'telegram' }"
            @click="tab = 'telegram'"
          >
            Telegram
          </button>
        </nav>

        <AdminTelegram v-if="tab === 'telegram'" :token="token" @unauthorized="logout" />

        <div v-else class="adm-leads">
          <p v-if="error" class="adm__error" role="alert">{{ error }}</p>

          <div v-if="loading && !leads.length" class="adm-state">
            <span class="adm-spinner adm-spinner--lg" aria-hidden="true" />
            <p>Загружаем заявки…</p>
          </div>

          <ul v-else-if="leads.length" class="adm-leads__list" :class="{ 'adm-leads__list--dim': loading }">
            <li v-for="lead in leads" :key="lead.id" class="adm-lead">
              <div class="adm-lead__body">
                <div class="adm-lead__top">
                  <strong class="adm-lead__phone">{{ lead.phone }}</strong>
                  <span class="adm-lead__id">#{{ lead.id }}</span>
                </div>
                <p class="adm-lead__name">{{ lead.name || 'Без имени' }}</p>
                <p v-if="lead.comment" class="adm-lead__comment">{{ lead.comment }}</p>
                <p class="adm-lead__meta">
                  {{ formatDate(lead.created_at) }}
                  <span aria-hidden="true">·</span>
                  <code>{{ lead.source || '/' }}</code>
                </p>
              </div>
              <button class="adm-btn adm-btn--danger" type="button" @click="removeLead(lead.id)">
                Удалить
              </button>
            </li>
          </ul>

          <div v-else class="adm-state adm-state--empty">
            <p>Заявок пока нет</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
