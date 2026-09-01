<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import PainSection from '../components/home/PainSection.vue'
import PromiseSection from '../components/home/PromiseSection.vue'
import CapabilitiesSection from '../components/home/CapabilitiesSection.vue'
import ProcessSection from '../components/home/ProcessSection.vue'
import CtaSection from '../components/home/CtaSection.vue'
</script>

<template>
  <main id="main" class="home">
    <HeroSection />

    <!-- 2. Pain: узнавание проблемы -->
    <PainSection />

    <!-- 3. Promise: наш ответ -->
    <PromiseSection />

    <!-- 4. Capabilities: три направления -->
    <CapabilitiesSection />

    <!-- 5. Process -->
    <ProcessSection />

    <!-- 6. CTA: разделённый экран, справа пятно-сердце -->
    <CtaSection />
  </main>
</template>
