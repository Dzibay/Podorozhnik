<script setup>
import { reactive, ref } from 'vue'
import { getIds, track } from '../../analytics/tracker'
import { analyticsEvents } from '../../data/site'
import { formatRuPhone, isValidRuPhone, toE164 } from '../../utils/phone'

const form = reactive({
  name: '',
  phone: '',
  comment: '',
  website: '',
})
const sending = ref(false)
const done = ref(false)
const error = ref('')
const phoneTouched = ref(false)

const phoneInvalid = () => phoneTouched.value && !isValidRuPhone(form.phone)

function onPhoneInput(event) {
  const input = event.target
  const next = formatRuPhone(input.value)
  form.phone = next
  // Курсор в конец — для маски надёжнее, чем пытаться угадать позицию
  requestAnimationFrame(() => {
    const len = next.length
    input.setSelectionRange(len, len)
  })
}

function onPhonePaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') || ''
  form.phone = formatRuPhone(pasted)
  phoneTouched.value = true
}

function onPhoneBlur() {
  phoneTouched.value = true
  if (form.phone) form.phone = formatRuPhone(form.phone)
}

async function submit() {
  error.value = ''
  phoneTouched.value = true

  if (!isValidRuPhone(form.phone)) {
    error.value = 'Введите номер полностью: +7 (XXX) XXX-XX-XX'
    return
  }

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
        phone: toE164(form.phone),
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
  <form class="lead-form" @submit.prevent="submit" novalidate>
    <p v-if="done" class="lead-form__ok">Заявка отправлена. Мы свяжемся с вами.</p>
    <template v-else>
      <label class="lead-form__field">
        <span>Имя</span>
        <input v-model="form.name" type="text" name="name" autocomplete="name" />
      </label>
      <label class="lead-form__field" :class="{ 'lead-form__field--invalid': phoneInvalid() }">
        <span>Телефон</span>
        <input
          :value="form.phone"
          type="tel"
          name="phone"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+7 (___) ___-__-__"
          maxlength="18"
          required
          :aria-invalid="phoneInvalid() ? 'true' : 'false'"
          @input="onPhoneInput"
          @paste="onPhonePaste"
          @blur="onPhoneBlur"
        />
        <span v-if="phoneInvalid()" class="lead-form__hint">Нужен полный номер: +7 (XXX) XXX-XX-XX</span>
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
        <span aria-hidden="true">&rarr;</span>
      </button>
    </template>
  </form>
</template>
