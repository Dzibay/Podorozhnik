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
    <template v-else-if="name === 'cross'">
      <path d="M19 6h10v13h13v10H29v13H19V29H6V19h13z" />
      <path d="M24 15v4M24 29v4" />
    </template>
    <template v-else-if="name === 'paw'">
      <path d="M24 26c-6 0-11 7-11 11 0 3 3 4 6 3s3-1 5-1 3 0 5 1 6 0 6-3c0-4-5-11-11-11Z" />
      <ellipse cx="15" cy="17" rx="3" ry="4.5" />
      <ellipse cx="33" cy="17" rx="3" ry="4.5" />
      <ellipse cx="21" cy="10" rx="2.8" ry="4" />
      <ellipse cx="27" cy="10" rx="2.8" ry="4" />
    </template>
    <template v-else-if="name === 'dumbbell'">
      <path d="M8 17v14M13 13v22M35 13v22M40 17v14" />
      <path d="M13 24h22M4 24h4M40 24h4" />
    </template>
    <template v-else-if="name === 'blocks'">
      <path d="M6 26h16v16H6zM26 26h16v16H26zM16 8h16v16H16z" />
      <path d="M12 34h4M32 32l4 4m0-4-4 4M24 12l3 6h-6z" />
    </template>
    <template v-else-if="name === 'tent'">
      <path d="M4 40 24 8l20 32zM24 8v32" />
      <path d="M17 40l7-12 7 12M2 40h44M38 8l2-2M10 8 8 6" />
    </template>
    <template v-else-if="name === 'glass'">
      <path d="M13 6h10l-1 12a4 4 0 0 1-8 0zM18 22v16M13 40h10" />
      <path d="M27 10h10l-1 12a4 4 0 0 1-8 0zM32 26v12M28 40h8M14 13h8M28 16h8" />
    </template>
    <template v-else-if="name === 'keys'">
      <circle cx="16" cy="18" r="9" />
      <circle cx="16" cy="18" r="3" />
      <path d="M22.5 24.5 40 42M33 35l4-4M37 39l3-3" />
    </template>
    <template v-else-if="name === 'window'">
      <path d="M10 6h28v34H10zM24 6v34M10 22h28" />
      <path d="M6 40h36M20 18v-4M28 18v-4" />
    </template>
    <template v-else-if="name === 'cabin'">
      <path d="M4 22 24 8l20 14M9 19v22h30V19" />
      <path d="M9 26h30M9 33h30M20 41v-9h8v9M35 13V7h4v9" />
    </template>
    <template v-else-if="name === 'valve'">
      <path d="M4 30h12v-6h16v6h12M4 38h12v-6M32 32v6h12" />
      <path d="M24 24v-8M17 12h14M24 16v-4" />
      <path d="M38 12c0 2 3 4 3 7a3 3 0 0 1-6 0c0-3 3-5 3-7Z" />
    </template>
    <template v-else-if="name === 'excavator'">
      <path d="M4 34h26v6H4zM8 34v-8h14v8M13 26v-6h9v6" />
      <path d="M22 22 34 10l8 10M42 20l-4 6h6z" />
      <circle cx="9" cy="37" r="1.5" />
      <circle cx="25" cy="37" r="1.5" />
    </template>
    <template v-else-if="name === 'camera'">
      <path d="M6 12h24l6 4v8l-6 4H6z" />
      <circle cx="26" cy="20" r="3" />
      <path d="M14 28v6H6M14 34h2M40 14l4-2v16l-4-2" />
    </template>
    <template v-else-if="name === 'calculator'">
      <path d="M10 4h28v40H10z" />
      <path d="M15 9h18v8H15zM16 23h2M23 23h2M30 23h2M16 29h2M23 29h2M30 29h2M16 35h2M23 35h2M30 33v6" />
    </template>
    <template v-else-if="name === 'boxes'">
      <path d="M4 28h18v14H4zM26 28h18v14H26zM15 12h18v16H15z" />
      <path d="M11 28v5M35 28v5M24 12v6M2 42h44" />
    </template>
    <template v-else-if="name === 'people'">
      <circle cx="17" cy="16" r="6" />
      <circle cx="33" cy="18" r="5" />
      <path d="M6 40c0-7 5-12 11-12s11 5 11 12M30 28c7 0 12 4 12 11" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M4 8h6l5 22h24l4-16H12" />
      <circle cx="18" cy="38" r="3" />
      <circle cx="34" cy="38" r="3" />
      <path d="M20 21h16" />
    </template>
    <template v-else-if="name === 'wrench'">
      <path d="M30 6a10 10 0 0 0-9 14L6 35a4 4 0 0 0 6 6l15-15a10 10 0 0 0 14-9l-6 6-6-1-1-6 6-6c-1-.4-2.6-1-4-1Z" />
      <path d="M9 38h0" />
    </template>
    <template v-else-if="name === 'flower'">
      <circle cx="24" cy="15" r="4" />
      <path d="M24 11c-2-6 6-6 4 0M28 15c6-2 6 6 0 4M24 19c2 6-6 6-4 0M20 15c-6 2-6-6 0-4" />
      <path d="M24 19v23M24 34c-6 0-9-4-9-8 5 0 9 3 9 8ZM24 30c5 0 8-3 8-7-5 0-8 3-8 7Z" />
    </template>
  </svg>
</template>
