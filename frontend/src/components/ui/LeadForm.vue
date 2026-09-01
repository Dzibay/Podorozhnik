<script setup>
import { reactive, ref } from 'vue'
import { getIds, track } from '../../analytics/tracker'
import { analyticsEvents } from '../../data/site'

const form = reactive({
  name: '',
  phone: '',
  comment: '',
  website: '',
})
const sending = ref(false)
const done = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (sending.value) return
  sending.value = true
  track('form_start')
  try {
    const ids = getIds()
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        comment: form.comment,
        website: form.website,
        source: location.pathname,
        visitor_id: ids.visitorId,
        session_id: ids.sessionId,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.detail || 'Не удалось отправить заявку')
    }
    done.value = true
    track(analyticsEvents.briefSubmitted)
    track('form_submit')
  } catch (err) {
    error.value = err.message || 'Не удалось отправить заявку'
    track('form_error')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="lead-form" @submit.prevent="submit">
    <p v-if="done" class="lead-form__ok">Заявка отправлена. Мы свяжемся с вами.</p>
    <template v-else>
      <label class="lead-form__field">
        <span>Имя</span>
        <input v-model="form.name" type="text" name="name" autocomplete="name" />
      </label>
      <label class="lead-form__field">
        <span>Телефон</span>
        <input v-model="form.phone" type="tel" name="phone" autocomplete="tel" required />
      </label>
      <label class="lead-form__field">
        <span>Задача</span>
        <textarea v-model="form.comment" name="comment" rows="4" />
      </label>
      <label class="lead-form__honeypot" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </label>
      <p v-if="error" class="lead-form__error">{{ error }}</p>
      <button class="button button--primary" type="submit" :disabled="sending">
        {{ sending ? 'Отправляем…' : 'Отправить' }}
      </button>
    </template>
  </form>
</template>
