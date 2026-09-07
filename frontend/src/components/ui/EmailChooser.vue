<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { contacts } from '../../data/site'

const props = defineProps({
  /** Дополнительный класс на кнопку-триггер */
  triggerClass: { type: String, default: '' },
})

const open = ref(false)
const copied = ref(false)
const rootRef = ref(null)
const panelRef = ref(null)
let copyTimer = 0

const compose = computed(() => {
  const to = encodeURIComponent(contacts.email)
  const su = encodeURIComponent(contacts.emailSubject)
  const body = encodeURIComponent(contacts.emailBody)
  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`,
    yandex: `https://mail.yandex.ru/compose?to=${to}&subject=${su}&body=${body}`,
  }
})

function toggle() {
  open.value = !open.value
  if (open.value) copied.value = false
}

function close() {
  open.value = false
}

function openCompose(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
  close()
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contacts.email)
  } catch {
    const el = document.createElement('textarea')
    el.value = contacts.email
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
    close()
  }, 900)
}

function onDocPointer(event) {
  if (!open.value) return
  const root = rootRef.value
  if (root && !root.contains(event.target)) close()
}

function onKey(event) {
  if (event.key === 'Escape' && open.value) close()
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  panelRef.value?.querySelector('button')?.focus()
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKey)
  clearTimeout(copyTimer)
})
</script>

<template>
  <div ref="rootRef" class="email-chooser">
    <button
      type="button"
      class="email-chooser__trigger"
      :class="triggerClass"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <slot>{{ contacts.email }}</slot>
    </button>

    <Transition name="email-chooser">
      <div
        v-if="open"
        ref="panelRef"
        class="email-chooser__panel"
        role="dialog"
        aria-label="Написать на почту"
      >
        <p class="email-chooser__label">Написать через</p>
        <button type="button" class="email-chooser__option" @click="openCompose(compose.gmail)">
          Gmail
        </button>
        <button type="button" class="email-chooser__option" @click="openCompose(compose.yandex)">
          Яндекс Почта
        </button>
        <button type="button" class="email-chooser__option" @click="copyEmail">
          {{ copied ? 'Скопировано' : 'Скопировать адрес' }}
        </button>
      </div>
    </Transition>
  </div>
</template>
