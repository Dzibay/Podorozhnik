<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { routes } from '../../data/site'
import { cookieNoteOpen } from '../../utils/cookieNote'

/**
 * Уведомление о cookie и Яндекс Метрике — висит, пока посетитель не нажмёт «Понятно».
 * Появляется только в браузере, после первой прокрутки или через 10 с: на телефоне оно
 * иначе закрывает кнопки первого экрана, а пререндер и первая отрисовка его не видят.
 */
const KEY = 'pd_cookie_ok'
const OPEN_AFTER = 10000
const route = useRoute()
let timer = 0

function seen() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function accept() {
  cookieNoteOpen.value = false
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* приватный режим: покажем снова при следующем визите */
  }
}

function open() {
  clearTimeout(timer)
  window.removeEventListener('scroll', open)
  cookieNoteOpen.value = true
}

onMounted(() => {
  if (route.meta.admin || seen()) return
  timer = setTimeout(open, OPEN_AFTER)
  window.addEventListener('scroll', open, { passive: true })
})

onUnmounted(() => {
  clearTimeout(timer)
  window.removeEventListener('scroll', open)
})
</script>

<template>
  <Transition name="cookie-note">
    <aside
      v-if="cookieNoteOpen && !route.meta.admin"
      class="cookie-note"
      :class="{ 'cookie-note--bare': route.meta.bare }"
      aria-label="Файлы cookie"
    >
      <p class="cookie-note__text">
        Сайт использует cookie и Яндекс Метрику. Оставаясь на сайте, вы соглашаетесь
        с <RouterLink :to="routes.privacy">политикой обработки данных</RouterLink>.
      </p>
      <button type="button" class="cookie-note__ok" @click="accept">Понятно</button>
    </aside>
  </Transition>
</template>
