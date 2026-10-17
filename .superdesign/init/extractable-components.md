# Extractable Components

## SiteHeader
- Source: `frontend/src/components/layout/SiteHeader.vue`
- Category: layout
- Description: Fixed top nav with wordmark ПОДОРОЖНИК, nav links, phone, outline CTA, mobile menu
- Extractable props: activePath (string, default: "/"), isHome (boolean, default: true), isScrolled (boolean, default: false)
- Hardcoded: nav labels (Услуги, Кейсы, Тарифы, Агентство, Контакты), CTA "Бесплатный аудит", phone display

## SiteFooter
- Source: `frontend/src/components/layout/SiteFooter.vue`
- Category: layout
- Description: Footer with brand, contacts, service groups, niches, legal links
- Extractable props: none critical (content from data modules)
- Hardcoded: structure, titles Направления / Ниши / Компания

## AppButton
- Source: `frontend/src/components/ui/AppButton.vue`
- Category: basic
- Description: Pill button as RouterLink / anchor / button; primary or outline
- Extractable props: href (string), variant (string, default: primary), label via slot
- Hardcoded: button class names

## LeadForm
- Source: `frontend/src/components/ui/LeadForm.vue`
- Category: basic
- Description: Lead capture form (name, phone, optional website/comment, consent)
- Extractable props: submitLabel (string), showComment (boolean), showWebsiteField (boolean)
- Hardcoded: field labels, consent copy

## SiteFloat
- Source: `frontend/src/components/layout/SiteFloat.vue`
- Category: layout
- Description: Mobile floating call/lead bar + FAB
- Extractable props: hasTelegram (boolean, default: false)
- Hardcoded: labels Позвонить / Заявка
