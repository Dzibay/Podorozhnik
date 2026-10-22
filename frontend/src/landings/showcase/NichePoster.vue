<script setup>
import NicheIcon from '../../components/ui/NicheIcon.vue'

/** Заглушка вместо 3D-сцены: композиция в палитре ниши — сетка, кольца, иконка и теги */
defineProps({
  icon: { type: String, required: true },
  tags: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="ns-poster" aria-hidden="true">
    <div class="ns-poster__grid" />
    <div class="ns-poster__stage">
      <span class="ns-poster__ring ns-poster__ring--outer" />
      <span class="ns-poster__ring ns-poster__ring--inner" />
      <span class="ns-poster__core">
        <NicheIcon :name="icon" />
      </span>
      <span
        v-for="(tag, i) in tags.slice(0, 3)"
        :key="tag"
        class="ns-poster__tag"
        :class="`ns-poster__tag--${i + 1}`"
      >{{ tag }}</span>
    </div>
  </div>
</template>
