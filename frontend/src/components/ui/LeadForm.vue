<script setup>
import { reactive, ref, watch } from 'vue'
import { getIds, track } from '../../analytics/tracker'
import { analyticsEvents, routes } from '../../data/site'
import { formatRuPhone, isValidRuPhone, toE164 } from '../../utils/phone'

const props = defineProps({
  submitLabel: { type: String, default: 'Отправить' },
  /** Предзаполненный комментарий (например, запрос чек-листа) */
  presetComment: { type: String, default: '' },
  /** Показывать поле «Задача» */
  showComment: { type: Boolean, default: true },
  /** Показывать поле «Сайт» */
  showWebsiteField: { type: Boolean, default: false },
  /** Метка источника в заявке */
  sourceSuffix: { type: String, default: '' },
  successMessage: { type: String, default: 'Заявка отправлена. Мы свяжемся с вами.' },
})

const emit = defineEmits(['success'])

const form = reactive({
  name: '',
  phone: '',
  comment: props.presetComment,
  siteUrl: '',
  website: '',
  agree: false,
})
const sending = ref(false)
const done = ref(false)
const error = ref('')
const phoneTouched = ref(false)

watch(
  () => props.presetComment,
  (value, prev) => {
    if (!form.comment || form.comment === prev) form.comment = value
  },
)

const phoneInvalid = () => phoneTouched.value && !isValidRuPhone(form.phone)

function onPhoneInput(event) {
  const input = event.target
  const next = formatRuPhone(input.value)
  form.phone = next
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

function buildComment() {
  const parts = []
  if (props.presetComment) parts.push(props.presetComment)
  if (form.siteUrl.trim()) parts.push(`Сайт: ${form.siteUrl.trim()}`)
  if (form.comment.trim() && form.comment.trim() !== props.presetComment) {
    parts.push(form.comment.trim())
  }
  return parts.filter(Boolean).join('\n')
}

async function submit() {
  error.value = ''
  phoneTouched.value = true

  if (!isValidRuPhone(form.phone)) {
    error.value = 'Введите номер полностью: +7 (XXX) XXX-XX-XX'
    return
  }

  if (!form.agree) {
    error.value = 'Нужно согласие на обработку персональных данных.'
    return
  }

  if (sending.value) return
  sending.value = true
  track('form_start')
  try {
    const ids = getIds()
    const source = `${location.pathname}${props.sourceSuffix || ''}`
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: toE164(form.phone),
        comment: buildComment(),
        website: form.website,
        source,
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
    emit('success')
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
    <p v-if="done" class="lead-form__ok">{{ successMessage }}</p>
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
      <label v-if="showWebsiteField" class="lead-form__field">
        <span>Сайт (если есть)</span>
        <input
          v-model="form.siteUrl"
          type="text"
          name="site_url"
          autocomplete="url"
          placeholder="example.ru"
        />
      </label>
      <label v-if="showComment" class="lead-form__field">
        <span>Задача</span>
        <textarea v-model="form.comment" name="comment" rows="4" />
      </label>
      <label class="lead-form__honeypot" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </label>
      <label class="lead-form__agree">
        <input v-model="form.agree" type="checkbox" name="agree" />
        <span>
          Соглашаюсь на
          <RouterLink :to="routes.consent" target="_blank">обработку персональных данных</RouterLink>
          и подтверждаю ознакомление с
          <RouterLink :to="routes.privacy" target="_blank">политикой конфиденциальности</RouterLink>
        </span>
      </label>
      <p v-if="error" class="lead-form__error">{{ error }}</p>
      <button class="button button--primary" type="submit" :disabled="sending">
        {{ sending ? 'Отправляем…' : submitLabel }}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </template>
  </form>
</template>
