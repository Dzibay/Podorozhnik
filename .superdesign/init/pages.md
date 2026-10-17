# Page Dependency Trees

## / (Home Page)
Entry: frontend/src/pages/HomePage.vue
Shell: frontend/src/App.vue → SiteHeader, SiteFooter, LiveNotifications, SiteFloat
Dependencies:
- frontend/src/components/home/HeroSection.vue
  - frontend/src/components/ui/AppButton.vue
  - frontend/src/data/home.js (hero copy)
  - frontend/src/data/site.js
- frontend/src/components/home/ForWhomSection.vue
- frontend/src/components/home/PainSection.vue
- frontend/src/components/home/AlternativesSection.vue
- frontend/src/components/home/PromiseSection.vue
- frontend/src/components/home/CapabilitiesSection.vue
- frontend/src/components/home/OfferSection.vue
- frontend/src/components/home/EconomicsSection.vue
- frontend/src/components/home/CasesSection.vue
- frontend/src/components/home/ProcessSection.vue
- frontend/src/components/home/PricingSection.vue
- frontend/src/components/home/TeamSection.vue
- frontend/src/components/home/UrgencySection.vue
- frontend/src/components/home/FaqSection.vue
- frontend/src/components/home/CtaSection.vue
- Styles: frontend/src/styles/home2.css, tokens.css, header.css, buttons.css, footer.css

## /services
Entry: frontend/src/pages/ServicesPage.vue
- Uses shell layouts + services.css

## /cases
Entry: frontend/src/pages/CasesPage.vue

## /agency
Entry: frontend/src/pages/AgencyPage.vue

## /contacts
Entry: frontend/src/pages/ContactsPage.vue
- LeadForm, contacts data

## /dlya/:slug (niche landing)
Entry: frontend/src/pages/NicheLandingPage.vue
- bare layout (no header/footer shell)
