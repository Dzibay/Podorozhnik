<script setup>
import { onMounted, ref } from 'vue'

const TOKEN_KEY = 'pd_admin_token'
const password = ref('')
const token = ref('')
const error = ref('')
const leads = ref([])
const total = ref(0)
const loading = ref(false)

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
  await loadLeads()
}

async function loadLeads() {
  loading.value = true
  error.value = ''
  const res = await fetch('/api/admin/leads', { headers: authHeaders() })
  if (res.status === 401) {
    logout()
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
  if (res.ok) await loadLeads()
}

function logout() {
  token.value = ''
  sessionStorage.removeItem(TOKEN_KEY)
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
    <div class="adm__box">
      <form v-if="!token" class="adm__login" @submit.prevent="login">
        <h1>Админка</h1>
        <input v-model="password" type="password" placeholder="Пароль" />
        <p v-if="error" class="adm__error">{{ error }}</p>
        <button class="button button--primary" type="submit">Войти</button>
      </form>

      <section v-else>
        <header class="adm__head">
          <h1>Заявки · {{ total }}</h1>
          <div class="adm__actions">
            <button class="button button--secondary" type="button" @click="loadLeads">Обновить</button>
            <button class="button button--ghost" type="button" @click="logout">Выйти</button>
          </div>
        </header>
        <p v-if="loading">Загрузка…</p>
        <ul v-else class="adm__list">
          <li v-for="lead in leads" :key="lead.id" class="adm__item">
            <div>
              <strong>#{{ lead.id }} · {{ lead.phone }}</strong>
              <p>{{ lead.name || 'Без имени' }}</p>
              <p v-if="lead.comment">{{ lead.comment }}</p>
              <p class="adm__meta">{{ formatDate(lead.created_at) }} · {{ lead.source || '/' }}</p>
            </div>
            <button class="button button--ghost" type="button" @click="removeLead(lead.id)">Удалить</button>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
