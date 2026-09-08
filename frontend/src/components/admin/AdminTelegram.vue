<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  token: { type: String, required: true },
})
const emit = defineEmits(['unauthorized'])

const loading = ref(false)
const loaded = ref(false)
const loadError = ref('')
const actionError = ref('')
const reachable = ref(false)
const tgError = ref('')
const hint = ref('')
const checks = ref([])
const recipients = ref([])
const pending = ref([])
const addingId = ref('')
const testing = ref(false)
const testOk = ref('')

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${props.token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 401) {
    emit('unauthorized')
    throw new Error('unauthorized')
  }
  return res
}

async function load() {
  loading.value = true
  loadError.value = ''
  actionError.value = ''
  try {
    const res = await api('/api/admin/telegram')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    reachable.value = Boolean(data.reachable)
    tgError.value = data.error || ''
    hint.value = data.hint || ''
    checks.value = data.checks || []
    recipients.value = data.recipients || []
    pending.value = data.pending || []
    loaded.value = true
  } catch (err) {
    if (err.message !== 'unauthorized') loadError.value = 'Не удалось загрузить Telegram'
    loaded.value = true
  } finally {
    loading.value = false
  }
}

async function addPerson(chatId, name = '', username = '') {
  addingId.value = chatId
  actionError.value = ''
  testOk.value = ''
  try {
    const res = await api('/api/admin/telegram/recipients', {
      method: 'POST',
      body: JSON.stringify({ chat_id: chatId, name, username }),
    })
    if (!res.ok) throw new Error('add')
    await load()
  } catch (err) {
    if (err.message !== 'unauthorized') actionError.value = 'Не удалось добавить получателя'
  } finally {
    addingId.value = ''
  }
}

async function toggle(person) {
  actionError.value = ''
  try {
    const res = await api(`/api/admin/telegram/recipients/${person.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled: !person.enabled }),
    })
    if (!res.ok) throw new Error('toggle')
    person.enabled = !person.enabled
  } catch (err) {
    if (err.message !== 'unauthorized') actionError.value = 'Не удалось изменить получателя'
  }
}

async function removePerson(person) {
  if (!confirm(`Убрать «${person.name || person.chat_id}» из рассылки?`)) return
  actionError.value = ''
  try {
    const res = await api(`/api/admin/telegram/recipients/${person.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('del')
    recipients.value = recipients.value.filter((r) => r.id !== person.id)
  } catch (err) {
    if (err.message !== 'unauthorized') actionError.value = 'Не удалось удалить'
  }
}

async function sendTest() {
  testing.value = true
  actionError.value = ''
  testOk.value = ''
  try {
    const res = await api('/api/admin/telegram/test', { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      actionError.value = data.detail || 'Тест не отправился'
      return
    }
    testOk.value = `Отправлено: ${data.sent} из ${data.total}`
  } catch (err) {
    if (err.message !== 'unauthorized') actionError.value = 'Тест не отправился'
  } finally {
    testing.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="tg">
    <p v-if="loadError" class="adm__error">{{ loadError }}</p>
    <p v-if="actionError" class="adm__error">{{ actionError }}</p>
    <p v-if="testOk" class="tg__ok">{{ testOk }}</p>

    <template v-if="loaded">
      <div v-if="!reachable" class="tg__card tg__card--warn card2">
        <header class="tg__card-h">
          <div>
            <h2>Нет связи с ботом</h2>
            <p v-if="tgError">{{ tgError }}</p>
            <p v-if="hint" class="tg__hint">{{ hint }}</p>
          </div>
          <button type="button" class="button button--outline" :disabled="loading" @click="load">
            {{ loading ? 'Проверяем…' : 'Проверить' }}
          </button>
        </header>
        <ul v-if="checks.length" class="tg__checks">
          <li v-for="c in checks" :key="c.id" :class="{ 'tg__checks--ok': c.ok, 'tg__checks--bad': !c.ok }">
            <span class="tg__dot" aria-hidden="true" />
            <div>
              <strong>{{ c.title }}</strong>
              <small>{{ c.detail }}</small>
            </div>
          </li>
        </ul>
        <p class="tg__hint">
          Токен и API задаются в <code>backend/.env</code>
          (<code>TELEGRAM_BOT_TOKEN</code>, при необходимости
          <code>TELEGRAM_API_BASE</code>). Получателей добавляете здесь.
        </p>
      </div>

      <div v-if="pending.length" class="tg__card card2">
        <h2>Ждут добавления</h2>
        <p class="tg__hint">Написали боту Start, но ещё не в рассылке.</p>
        <ul class="tg__list">
          <li v-for="p in pending" :key="p.chat_id">
            <div>
              <strong>{{ p.name }}</strong>
              <small>
                <span v-if="p.username">@{{ p.username }}</span>
                <span v-if="p.at">{{ p.username ? ' · ' : '' }}{{ p.at }}</span>
              </small>
            </div>
            <button
              type="button"
              class="button button--primary"
              :disabled="addingId === p.chat_id"
              @click="addPerson(p.chat_id, p.name, p.username)"
            >
              {{ addingId === p.chat_id ? '…' : 'Добавить' }}
            </button>
          </li>
        </ul>
      </div>

      <div class="tg__card card2">
        <header class="tg__card-h">
          <h2>
            Получают заявки
            <em>{{ recipients.filter((r) => r.enabled).length }}</em>
          </h2>
          <div class="tg__actions">
            <button type="button" class="button button--outline" :disabled="loading" @click="load">
              {{ loading ? 'Обновляем…' : 'Обновить' }}
            </button>
            <button
              type="button"
              class="button button--outline"
              :disabled="testing || !recipients.length"
              @click="sendTest"
            >
              {{ testing ? 'Отправляем…' : 'Тестовое сообщение' }}
            </button>
          </div>
        </header>
        <ul v-if="recipients.length" class="tg__list">
          <li v-for="r in recipients" :key="r.id">
            <div>
              <strong :class="{ 'tg__off': !r.enabled }">{{ r.name || r.chat_id }}</strong>
              <small>
                <span v-if="r.username">@{{ r.username }}</span>
                <span v-if="!r.enabled">{{ r.username ? ' · ' : '' }}на паузе</span>
              </small>
            </div>
            <div class="tg__row-actions">
              <button type="button" class="button button--outline" @click="toggle(r)">
                {{ r.enabled ? 'Пауза' : 'Включить' }}
              </button>
              <button type="button" class="button button--outline" @click="removePerson(r)">
                Убрать
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="tg__empty">
          Список пуст. Напишите боту Start в Telegram — человек появится в «Ждут добавления».
          Либо укажите <code>TELEGRAM_CHAT_ID</code> в env.
        </p>
      </div>
    </template>
  </section>
</template>
