<script setup>
import { useRoute } from 'vue-router'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'

const route = useRoute()
</script>

<template>
  <a class="skip-link" href="#main">К содержанию</a>
  <SiteHeader v-if="!route.meta.bare" />
  <RouterView />
  <SiteFooter v-if="!route.meta.bare" />
</template>
