<script setup>
/** Линейные иконки ниш в едином стиле: 48×48, обводка 1.5. */
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <svg
    class="niche-icon"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'factory'">
      <path d="M5 42V22l10 6v-6l10 6v-6l10 6V8h6v34z" />
      <path d="M3 42h42M12 35h4M22 35h4M32 35h4" />
    </template>
    <template v-else-if="name === 'crane'">
      <path d="M12 42V8M12 8l26 4M12 8 5 12M12 14l26-2M36 12v10" />
      <path d="M33 22h6v6h-6zM8 42h8M12 20l-4 4M12 26l-4 4" />
    </template>
    <template v-else-if="name === 'sofa'">
      <path d="M8 22v-6a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v6" />
      <path d="M6 22a3 3 0 0 1 3 3v5h30v-5a3 3 0 1 1 6 0v9H3v-9a3 3 0 0 1 3-3ZM8 34v4M40 34v4M15 30v-4h18v4" />
    </template>
    <template v-else-if="name === 'house'">
      <path d="M6 22 24 7l18 15M10 19v23h28V19" />
      <path d="M20 42V30h8v12M4 42h40M33 10v5" />
    </template>
    <template v-else-if="name === 'tooth'">
      <path d="M24 10c-3-3-9-4-12 0-3.5 4.5-1 10 0 14 1 5 2 16 5 16 3 0 3-10 7-10s4 10 7 10c3 0 4-11 5-16 1-4 3.5-9.5 0-14-3-4-9-3-12 0Z" />
      <path d="M19 15c2 1 3 1 5 0" />
    </template>
    <template v-else-if="name === 'car'">
      <path d="M6 30v-6l4-9h28l4 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2ZM6 24h36" />
      <circle cx="14" cy="32" r="4" />
      <circle cx="34" cy="32" r="4" />
      <path d="M16 15l-2 9M32 15l2 9" />
    </template>
    <template v-else-if="name === 'scale'">
      <path d="M24 6v34M14 42h20M10 12h28M24 9v3" />
      <path d="M10 12 4 26a6 6 0 0 0 12 0zM38 12l-6 14a6 6 0 0 0 12 0z" />
    </template>
    <template v-else-if="name === 'sparkle'">
      <path d="M22 6c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z" />
      <path d="M36 28c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6ZM10 34v6M7 37h6" />
    </template>
    <template v-else-if="name === 'truck'">
      <path d="M4 12h24v22H4zM28 20h9l7 8v6H28" />
      <circle cx="12" cy="36" r="4" />
      <circle cx="36" cy="36" r="4" />
      <path d="M8 18h10" />
    </template>
    <template v-else-if="name === 'plate'">
      <circle cx="24" cy="26" r="13" />
      <circle cx="24" cy="26" r="7" />
      <path d="M6 10v8a3 3 0 0 0 3 3v19M9 10v8M12 10v8a3 3 0 0 1-3 3M42 10c-3 2-4 6-4 11h4v19" />
    </template>
    <template v-else-if="name === 'scissors'">
      <circle cx="12" cy="36" r="5" />
      <circle cx="36" cy="36" r="5" />
      <path d="M15.5 32.5 34 8M32.5 32.5 14 8M22 22h4" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M24 12c-5-4-12-4-18-2v28c6-2 13-2 18 2 5-4 12-4 18-2V10c-6-2-13-2-18 2ZM24 12v28" />
      <path d="M11 17c3-1 6-1 8 0M29 17c3-1 6-1 8 0M11 23c3-1 6-1 8 0" />
    </template>
  </svg>
</template>
