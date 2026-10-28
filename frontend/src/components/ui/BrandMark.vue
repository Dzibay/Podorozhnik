<script setup>
import { useId } from 'vue'

/** Знак бренда: лист подорожника с дуговыми прожилками. */
defineProps({
  mono: { type: Boolean, default: false },
})
// одинаковый id на сервере и в браузере: случайный ломал бы гидрацию
const gradientId = `pd-leaf-${useId()}`
</script>

<template>
  <svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <defs>
      <linearGradient :id="gradientId" x1="6" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#e0461f" />
        <stop offset="0.55" stop-color="#f27a3a" />
        <stop offset="1" stop-color="#ff89a9" />
      </linearGradient>
    </defs>
    <path
      d="M16 1.5c8.2 3.8 11.6 11.6 9.6 19.2-1.5 5.4-5.4 8.6-9.6 8.6s-8.1-3.2-9.6-8.6C4.4 13.1 7.8 5.3 16 1.5Z"
      :fill="mono ? 'currentColor' : `url(#${gradientId})`"
    />
    <g :stroke="mono ? 'var(--paper, #ebe9e4)' : '#f6f3ec'" stroke-width="1.15" stroke-linecap="round" opacity="0.9">
      <path d="M16 4.5v23.2" />
      <path d="M16 4.5c-3.6 4.4-4.7 13.2-2.2 22.6" />
      <path d="M16 4.5c3.6 4.4 4.7 13.2 2.2 22.6" />
      <path d="M16 4.5c-5.4 4.2-7.5 11.6-5.6 19.6" />
      <path d="M16 4.5c5.4 4.2 7.5 11.6 5.6 19.6" />
    </g>
    <path d="M16 29.3v2.2" :stroke="mono ? 'currentColor' : '#e0461f'" stroke-width="1.6" stroke-linecap="round" />
  </svg>
</template>
