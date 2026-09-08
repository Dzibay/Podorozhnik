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
const togglingId = ref(null)
const removingId = ref(null)
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
  testOk.value = ''
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
  togglingId.value = person.id
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
  } finally {
    togglingId.value = null
  }
}

async function removePerson(person) {
  if (!confirm(`Убрать «${person.name || person.chat_id}» из рассылки?`)) return
  removingId.value = person.id
  actionError.value = ''
  try {
    const res = await api(`/api/admin/telegram/recipients/${person.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('del')
    recipients.value = recipients.value.filter((r) => r.id !== person.id)
  } catch (err) {
    if (err.message !== 'unauthorized') actionError.value = 'Не удалось удалить'
  } finally {
    removingId.value = null
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
    <!-- First load -->
    <div v-if="!loaded || (loading && !checks.length && !recipients.length)" class="adm-state">
      <span class="adm-spinner adm-spinner--lg" aria-hidden="true" />
      <p>Проверяем Telegram…</p>
    </div>

    <template v-else>
      <div v-if="loading" class="tg__busy" aria-live="polite">
        <span class="adm-spinner" aria-hidden="true" />
        Обновляем данные…
      </div>

      <p v-if="loadError" class="adm__error" role="alert">{{ loadError }}</p>
      <p v-if="actionError" class="adm__error" role="alert">{{ actionError }}</p>
      <p v-if="testOk" class="tg__ok" role="status">{{ testOk }}</p>

      <div v-if="!reachable" class="tg__card tg__card--warn">
        <header class="tg__card-h">
          <div>
            <h2>Нет связи с ботом</h2>
            <p v-if="tgError" class="tg__text">{{ tgError }}</p>
            <p v-if="hint" class="tg__hint">{{ hint }}</p>
          </div>
          <button type="button" class="adm-btn adm-btn--ghost" :disabled="loading" @click="load">
            <span v-if="loading" class="adm-spinner" aria-hidden="true" />
            {{ loading ? 'Проверяем…' : 'Проверить' }}
          </button>
        </header>
        <ul v-if="checks.length" class="tg__checks">
          <li
            v-for="c in checks"
            :key="c.id"
            :class="{ 'tg__checks--ok': c.ok, 'tg__checks--bad': !c.ok }"
          >
            <span class="tg__dot" aria-hidden="true" />
            <div>
              <strong>{{ c.title }}</strong>
              <small>{{ c.detail }}</small>
            </div>
          </li>
        </ul>
        <p class="tg__hint">
          Токен и API — в <code>backend/.env</code>
          (<code>TELEGRAM_BOT_TOKEN</code>,
          <code>TELEGRAM_API_BASE</code>). Получателей добавляете здесь.
        </p>
      </div>

      <div v-if="pending.length" class="tg__card">
        <h2>Ждут добавления</h2>
        <p class="tg__hint">Написали боту Start, но ещё не в рассылке.</p>
        <ul class="tg__list">
          <li v-for="p in pending" :key="p.chat_id">
            <div class="tg__person">
              <strong>{{ p.name }}</strong>
              <small>
                <span v-if="p.username">@{{ p.username }}</span>
                <span v-if="p.at">{{ p.username ? ' · ' : '' }}{{ p.at }}</span>
              </small>
            </div>
            <button
              type="button"
              class="adm-btn adm-btn--primary"
              :disabled="addingId === p.chat_id || loading"
              @click="addPerson(p.chat_id, p.name, p.username)"
            >
              <span v-if="addingId === p.chat_id" class="adm-spinner" aria-hidden="true" />
              {{ addingId === p.chat_id ? 'Добавляем…' : 'Добавить' }}
            </button>
          </li>
        </ul>
      </div>

      <div class="tg__card" :class="{ 'tg__card--dim': loading }">
        <header class="tg__card-h">
          <h2>
            Получают заявки
            <em>{{ recipients.filter((r) => r.enabled).length }}</em>
          </h2>
          <div class="tg__actions">
            <button type="button" class="adm-btn adm-btn--ghost" :disabled="loading" @click="load">
              <span v-if="loading" class="adm-spinner" aria-hidden="true" />
              {{ loading ? 'Обновляем…' : 'Обновить' }}
            </button>
            <button
              type="button"
              class="adm-btn adm-btn--ghost"
              :disabled="testing || loading || !recipients.length"
              @click="sendTest"
            >
              <span v-if="testing" class="adm-spinner" aria-hidden="true" />
              {{ testing ? 'Отправляем…' : 'Тестовое сообщение' }}
            </button>
          </div>
        </header>

        <ul v-if="recipients.length" class="tg__list">
          <li v-for="r in recipients" :key="r.id">
            <div class="tg__person">
              <strong :class="{ 'tg__off': !r.enabled }">{{ r.name || r.chat_id }}</strong>
              <small>
                <span v-if="r.username">@{{ r.username }}</span>
                <span v-if="!r.enabled">{{ r.username ? ' · ' : '' }}на паузе</span>
              </small>
            </div>
            <div class="tg__row-actions">
              <button
                type="button"
                class="adm-btn adm-btn--ghost adm-btn--sm"
                :disabled="togglingId === r.id || removingId === r.id"
                @click="toggle(r)"
              >
                <span v-if="togglingId === r.id" class="adm-spinner" aria-hidden="true" />
                {{
                  togglingId === r.id
                    ? '…'
                    : r.enabled
                      ? 'Пауза'
                      : 'Включить'
                }}
              </button>
              <button
                type="button"
                class="adm-btn adm-btn--danger adm-btn--sm"
                :disabled="removingId === r.id || togglingId === r.id"
                @click="removePerson(r)"
              >
                <span v-if="removingId === r.id" class="adm-spinner" aria-hidden="true" />
                {{ removingId === r.id ? '…' : 'Убрать' }}
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="tg__empty">
          Список пуст. Напишите боту Start — человек появится в «Ждут добавления». Или укажите
          <code>TELEGRAM_CHAT_ID</code> в env.
        </p>
      </div>
    </template>
  </section>
</template>
