<script setup>
import { useRoute } from 'vue-router'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import CaseToast from './components/layout/CaseToast.vue'
import SiteFloat from './components/layout/SiteFloat.vue'
import SiteCursor from './components/layout/SiteCursor.vue'

const route = useRoute()
</script>

<template>
  <a class="skip-link" href="#main">К содержанию</a>
  <SiteHeader v-if="!route.meta.bare" />
  <RouterView />
  <SiteFooter v-if="!route.meta.bare" />
  <CaseToast />
  <SiteFloat />
  <SiteCursor />
</template>
