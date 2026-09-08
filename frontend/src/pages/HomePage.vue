<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import ForWhomSection from '../components/home/ForWhomSection.vue'
import PainSection from '../components/home/PainSection.vue'
import PromiseSection from '../components/home/PromiseSection.vue'
import CapabilitiesSection from '../components/home/CapabilitiesSection.vue'
import OfferSection from '../components/home/OfferSection.vue'
import ProcessSection from '../components/home/ProcessSection.vue'
import PricingSection from '../components/home/PricingSection.vue'
import TeamSection from '../components/home/TeamSection.vue'
import FaqSection from '../components/home/FaqSection.vue'
import CtaSection from '../components/home/CtaSection.vue'
</script>

<template>
  <main id="main" class="home">
    <!-- 1. Hero: оффер + CTA + плашка доверия -->
    <HeroSection />

    <!-- 2. Для кого: ниши -->
    <ForWhomSection />

    <!-- 3. Зеркало боли -->
    <PainSection />

    <!-- 4. Решение: один отдел вместо подрядчиков -->
    <PromiseSection />

    <!-- 5. Что берём на себя: 4 направления услуг -->
    <CapabilitiesSection />

    <!-- 6. Киллер-оффер: сайт за 24 часа -->
    <OfferSection />

    <!-- 7. Как работаем: 4 шага CJM -->
    <ProcessSection />

    <!-- 8. Тарифы -->
    <PricingSection />

    <!-- 9. Команда + принципы -->
    <TeamSection />

    <!-- 10. FAQ -->
    <FaqSection />

    <!-- 11. Финальная CTA -->
    <CtaSection />
  </main>
</template>
