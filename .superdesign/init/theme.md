# Theme Tokens

## Compact token summary

### Colors
- --color-bg: #050505 (near-black)
- --color-surface: #0c0c0c
- --color-surface-2: #121410
- --color-text: #f5f5f5
- --color-muted: #9b9b9b
- --color-line: #1e1e1e
- --color-line-2: #26281f
- --color-green: #c8ff00 (lime brand accent / CTA fill)
- --color-green-2: #a8e000 (hover)
- --color-cta-ink: #050505 (text on green buttons)

### Typography
- Display / brand: Manrope (--font-display)
- Hero headlines: Inter Tight (--font-hero)
- Body: Inter (--font-body)
- Hero title: clamp(2.3rem, 5.2vw, 4.1rem), weight 800, letter-spacing -0.045em
- Section titles: clamp(1.9rem, 4.2vw, 3.1rem), Manrope 800
- Kicker: 0.75rem, uppercase, green, letter-spacing 0.1em

### Spacing & radii
- Space scale: 4/8/12/16/20/24/32/40/48/64/80/96/120
- Container: 1200px, pad 1.75rem (1.125rem mobile)
- Radii: s 12px, m 20px, l 28px, pill 999px
- Header height: 4.5rem (4rem mobile)

### Motion / effects
- --ease: cubic-bezier(0.22, 1, 0.36, 1)
- Green radial glow overlays
- Chip float animation, marquee 36s
- Card hover: border glow + lift -4px
- Header scroll: blur(12px) + translucent bg
- Buttons: pill shape, primary solid lime, outline green border

### Layout patterns
- Dark agency landing aesthetic
- Two-column hero (copy | 3D visual)
- Numbered card grids with lime accents
- Stats strip under hero
- Scrolling service marquee

## Raw sources


## tokens.css
- Path: `frontend/src/styles/tokens.css`

```css
:root {
  color-scheme: dark;

  --color-bg: #050505;
  --color-surface: #0c0c0c;
  --color-text: #f5f5f5;
  --color-muted: #9b9b9b;
  --color-line: #1e1e1e;
  --color-green: #c8ff00;
  --color-green-2: #a8e000;
  --color-cta-ink: #050505;

  --font-display: "Manrope", sans-serif;
  --font-hero: "Inter Tight", sans-serif;
  --font-body: "Inter", sans-serif;

  --space-4: 0.25rem;
  --space-8: 0.5rem;
  --space-12: 0.75rem;
  --space-16: 1rem;
  --space-20: 1.25rem;
  --space-24: 1.5rem;
  --space-32: 2rem;
  --space-40: 2.5rem;
  --space-48: 3rem;
  --space-64: 4rem;
  --space-80: 5rem;
  --space-96: 6rem;
  --space-120: 7.5rem;

  --container: 1200px;
  --container-pad: 1.75rem;
  --radius-s: 12px;
  --radius-m: 20px;
  --radius-l: 28px;
  --radius-pill: 999px;
  --color-surface-2: #121410;
  --color-line-2: #26281f;
  --glow-green: radial-gradient(
    ellipse 60% 55% at 50% 0%,
    color-mix(in srgb, var(--color-green) 14%, transparent),
    transparent 70%
  );
  --header-height: 4.5rem;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --focus: 0 0 0 3px color-mix(in srgb, var(--color-green) 45%, transparent);
}

@media (max-width: 720px) {
  :root {
    --container-pad: 1.125rem;
    --header-height: 4rem;
  }
}


```


## base.css
- Path: `frontend/src/styles/base.css`

```css
html {
  background: var(--color-bg);
}

#app,
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus);
}

.skip-link {
  position: absolute;
  left: var(--space-16);
  top: var(--space-16);
  z-index: 80;
  transform: translateY(-160%);
  padding: 0.7rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-green);
  color: var(--color-cta-ink);
}

.skip-link:focus {
  transform: translateY(0);
}

.kicker {
  margin-bottom: var(--space-12);
  color: var(--color-green);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.kicker a {
  color: inherit;
}

.lead {
  max-width: 36rem;
  color: var(--color-muted);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}


```


## buttons.css
- Path: `frontend/src/styles/buttons.css`

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 3rem;
  padding: 0.8rem 1.25rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition:
    background-color 220ms var(--ease),
    color 220ms var(--ease),
    border-color 220ms var(--ease);
}

.button--primary {
  background: var(--color-green);
  color: var(--color-cta-ink);
}

.button--secondary,
.button--outline {
  border: 1px solid var(--color-green);
  background: transparent;
  color: var(--color-text);
}

.button--primary:hover {
  background: var(--color-green-2);
}

.button--secondary:hover,
.button--outline:hover {
  background: color-mix(in srgb, var(--color-green) 12%, transparent);
}

.button--outline {
  min-height: 2.75rem;
  padding-inline: 1.75rem;
  font-weight: 600;
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}


```


## layout.css
- Path: `frontend/src/styles/layout.css`

```css
.container {
  width: min(var(--container), calc(100% - var(--container-pad) * 2));
  margin-inline: auto;
}

.section {
  padding: var(--space-80) 0;
  border-top: 1px solid var(--color-line);
}

.section__head {
  max-width: 40rem;
  margin-bottom: var(--space-40);
}

.section__head h2,
.page h1 {
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 4.5vw, 3.4rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.05;
}

.section__head .lead,
.page__intro .lead {
  margin-top: var(--space-20);
}

.section__more {
  margin-top: var(--space-40);
}

.section__more a {
  color: var(--color-green);
}

.page {
  flex: 1;
  padding: calc(var(--header-height) + var(--space-64)) 0 var(--space-120);
}

.page__intro {
  max-width: 40rem;
  margin-bottom: var(--space-48);
}

.page__narrow {
  max-width: 42rem;
}

.page h2 {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-12);
}

.stack {
  display: grid;
  gap: var(--space-24);
  max-width: 42rem;
}

.stack__item h3,
.stack__item h2 {
  margin-bottom: var(--space-8);
}

.stack__item p,
.capability-group > p,
.block p,
.process-list p {
  color: var(--color-muted);
}

.capability-group {
  max-width: 48rem;
  padding: var(--space-32) 0;
  border-top: 1px solid var(--color-line);
}

.capability-group h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-8);
}

.capability-group > p {
  margin-bottom: var(--space-20);
}

.link-list,
.bullets,
.process-list,
.footer__list {
  display: grid;
  gap: var(--space-12);
}

.link-list a {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.link-list a:hover {
  color: var(--color-green);
}

.link-list span {
  color: var(--color-muted);
}

.process-list {
  list-style: none;
  display: grid;
  gap: var(--space-24);
  max-width: 48rem;
}

.process-list li {
  display: grid;
  gap: var(--space-8);
  padding-bottom: var(--space-24);
  border-bottom: 1px solid var(--color-line);
}

.process-list__num {
  color: var(--color-green);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.process-list h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.block {
  margin-top: var(--space-48);
}

.block--cta {
  padding-top: var(--space-40);
  border-top: 1px solid var(--color-line);
}

.bullets {
  list-style: disc;
  padding-left: 1.25rem;
  color: var(--color-muted);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--space-24);
}

@media (max-width: 720px) {
  .section {
    padding: var(--space-64) 0;
  }
}

```


## header.css
- Path: `frontend/src/styles/header.css`

```css
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--header-height);
  background: transparent;
  backdrop-filter: none;
  border-bottom: 1px solid transparent;
  transition:
    background-color 320ms var(--ease),
    border-color 320ms var(--ease),
    backdrop-filter 320ms var(--ease);
}

.header--scrolled {
  background: color-mix(in srgb, var(--color-bg) 86%, transparent);
  backdrop-filter: blur(12px);
  border-bottom-color: var(--color-line);
}

.header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-16);
  height: 100%;
}

.header__brand {
  justify-self: start;
  font-family: var(--font-display);
  font-size: clamp(0.72rem, 1.4vw, 0.85rem);
  font-weight: 800;
  letter-spacing: 0.12em;
}

.header__nav {
  display: flex;
  align-items: center;
  justify-self: center;
  gap: clamp(1rem, 2.5vw, 2rem);
}

.header__link {
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: clamp(0.82rem, 1.2vw, 0.95rem);
  transition: color 180ms var(--ease);
}

.header__link:hover,
.header__link[aria-current="page"] {
  color: var(--color-text);
}

.header__actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 0.75rem;
  flex-shrink: 0;
}

.header__phone {
  color: color-mix(in srgb, var(--color-text) 78%, transparent);
  font-family: var(--font-display);
  font-size: clamp(0.8rem, 1.1vw, 0.92rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition: color 180ms var(--ease);
}

.header__phone:hover,
.header__phone:focus-visible {
  color: var(--color-green);
}

.header__cta.button {
  min-height: 2.5rem;
  padding: 0.55rem 1.35rem;
  border: 1px solid var(--color-green);
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.header__cta.button:hover {
  background: color-mix(in srgb, var(--color-green) 12%, transparent);
  border-color: var(--color-green);
  color: var(--color-text);
}

.header__cta--mobile.button {
  width: 100%;
  min-height: 2.75rem;
  padding-inline: 1.75rem;
  font-size: 0.95rem;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--color-green);
  border-radius: 50%;
  background: transparent;
  color: var(--color-text);
  transition:
    background-color 220ms var(--ease),
    border-color 220ms var(--ease),
    color 220ms var(--ease);
}

.menu-toggle:hover,
.menu-toggle[aria-expanded="true"] {
  background: color-mix(in srgb, var(--color-green) 12%, transparent);
  border-color: var(--color-green);
}

.menu-toggle span,
.menu-toggle span::before,
.menu-toggle span::after {
  display: block;
  width: 1rem;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
  transition:
    transform 220ms var(--ease),
    top 220ms var(--ease),
    background 220ms var(--ease);
}

.menu-toggle span {
  position: relative;
}

.menu-toggle span::before,
.menu-toggle span::after {
  content: "";
  position: absolute;
  left: 0;
}

.menu-toggle span::before {
  top: -5px;
}

.menu-toggle span::after {
  top: 5px;
}

.menu-toggle[aria-expanded="true"] span {
  background: transparent;
}

.menu-toggle[aria-expanded="true"] span::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-toggle[aria-expanded="true"] span::after {
  top: 0;
  transform: rotate(-45deg);
}

.mobile-nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: color-mix(in srgb, #050505 82%, transparent);
  backdrop-filter: blur(12px);
}

.mobile-nav-backdrop-enter-active,
.mobile-nav-backdrop-leave-active {
  transition: opacity 320ms var(--ease);
}

.mobile-nav-backdrop-enter-from,
.mobile-nav-backdrop-leave-to {
  opacity: 0;
}

.mobile-nav {
  position: fixed;
  inset: var(--header-height) 0 0;
  z-index: 48;
  display: flex;
  flex-direction: column;
  height: calc(100svh - var(--header-height));
  max-height: calc(100dvh - var(--header-height));
  padding: var(--space-12) var(--container-pad) var(--space-20);
  overflow: hidden;
  background: #0b0f0b;
  border-top: 1px solid color-mix(in srgb, var(--color-green) 18%, var(--color-line));
  will-change: transform, opacity;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:
    transform 420ms var(--ease),
    opacity 320ms var(--ease);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  transform: translateY(-104%);
  opacity: 0;
}

.mobile-nav-enter-to,
.mobile-nav-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.mobile-nav__list {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.mobile-nav__link {
  display: block;
  padding: clamp(0.7rem, 2.4svh, 1rem) 0;
  border-bottom: 1px solid var(--color-line);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 4vw, 1.45rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  transition: color 180ms var(--ease);
}

.mobile-nav__link:hover {
  color: var(--color-green);
}

.mobile-nav__cta {
  flex-shrink: 0;
  display: grid;
  gap: var(--space-12);
  padding-top: var(--space-16);
}

.mobile-nav__phone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  border: 1px solid color-mix(in srgb, var(--color-green) 40%, var(--color-line));
  border-radius: var(--radius-pill);
  color: var(--color-green);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

@media (max-width: 960px) {
  .header__inner {
    display: flex;
    justify-content: space-between;
  }

  .header__nav {
    display: none;
  }

  .header__actions .button {
    display: none;
  }

  .header__phone {
    font-size: 0.82rem;
  }

  .menu-toggle {
    display: inline-flex;
  }
}

@media (max-width: 520px) {
  .header__phone {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-toggle span,
  .menu-toggle span::before,
  .menu-toggle span::after,
  .mobile-nav-enter-active,
  .mobile-nav-leave-active,
  .mobile-nav-backdrop-enter-active,
  .mobile-nav-backdrop-leave-active {
    transition: none;
  }

  .mobile-nav-enter-from,
  .mobile-nav-leave-to {
    transform: none;
    opacity: 1;
  }
}

```


## footer.css
- Path: `frontend/src/styles/footer.css`

```css
.footer {
  margin-top: auto;
  padding: var(--space-64) 0 var(--space-40);
  border-top: 1px solid var(--color-line);
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1fr;
  gap: var(--space-40);
}

.footer__brand {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.footer__tagline {
  max-width: 18rem;
  margin-top: var(--space-12);
  color: var(--color-muted);
}

.footer__contacts {
  display: grid;
  gap: var(--space-8);
  margin-top: var(--space-24);
}

.footer__phone,
.footer__email {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: color 180ms var(--ease);
}

.footer__phone:hover,
.footer__phone:focus-visible {
  color: var(--color-green);
}

.footer .email-chooser__panel {
  left: 0;
  right: auto;
}

.footer__title {
  margin-bottom: var(--space-16);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.footer__list {
  gap: 0.55rem;
}

.footer__list a:hover {
  color: var(--color-green);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-16);
  margin-top: var(--space-48);
  padding-top: var(--space-24);
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-size: 0.88rem;
}

.footer__docs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem 1.25rem;
  margin: 0;
}

.footer__docs a:hover {
  color: var(--color-green);
}

@media (max-width: 900px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 620px) {
  .footer__grid,
  .footer__bottom {
    grid-template-columns: 1fr;
    display: grid;
  }
}

```


## form.css
- Path: `frontend/src/styles/form.css`

```css
.lead-form {
  display: grid;
  gap: var(--space-20);
  width: 100%;
}

.lead-form__field {
  display: grid;
  gap: var(--space-8);
}

.lead-form__field span {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.lead-form input,
.lead-form textarea {
  width: 100%;
  padding: 0.95rem 1.1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text);
  font: inherit;
  transition:
    border-color 220ms var(--ease),
    background-color 220ms var(--ease);
}

.lead-form textarea {
  border-radius: var(--radius-s);
  min-height: 7.5rem;
  resize: vertical;
}

.lead-form input::placeholder,
.lead-form textarea::placeholder {
  color: color-mix(in srgb, var(--color-muted) 75%, transparent);
}

.lead-form input:hover,
.lead-form textarea:hover {
  border-color: color-mix(in srgb, var(--color-green) 35%, var(--color-line));
}

.lead-form input:focus,
.lead-form textarea:focus {
  outline: none;
  border-color: var(--color-green);
  background: color-mix(in srgb, var(--color-green) 4%, transparent);
  box-shadow: var(--focus);
}

.lead-form__field--invalid input {
  border-color: #ff8f7a;
}

.lead-form__field--invalid input:focus {
  border-color: #ff8f7a;
  box-shadow: 0 0 0 3px color-mix(in srgb, #ff8f7a 35%, transparent);
}

.lead-form__hint {
  font-size: 0.85rem;
  color: #ff8f7a;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 500;
}

.lead-form .button {
  margin-top: var(--space-8);
  width: 100%;
  justify-content: space-between;
  padding-inline: 1.5rem;
}

.lead-form__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.lead-form__agree {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  color: var(--color-muted);
  font-size: 0.88rem;
  line-height: 1.45;
}

.lead-form__agree input {
  width: 1.05rem;
  height: 1.05rem;
  margin-top: 0.15rem;
  padding: 0;
  flex: 0 0 auto;
  border-radius: 0.2rem;
  accent-color: var(--color-green);
}

.lead-form__agree a {
  color: var(--color-green);
}

.lead-form__error {
  margin: 0;
  color: #ff8f7a;
  font-size: 0.95rem;
}

.lead-form__ok {
  margin: 0;
  color: var(--color-green);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

```


## float.css
- Path: `frontend/src/styles/float.css`

```css
/* Live toast + floating CTA */

.live-toast {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: calc(5.5rem + env(safe-area-inset-bottom));
  z-index: 80;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  width: min(22rem, calc(100vw - 2rem));
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-line-2);
  border-radius: var(--radius-m);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 50px -28px rgba(0, 0, 0, 0.75);
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
  transition:
    opacity 320ms var(--ease),
    transform 320ms var(--ease);
}

.live-toast--on {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.live-toast__live {
  position: absolute;
  top: 0.55rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-green);
}

.live-toast__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--color-green);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-green) 55%, transparent);
  animation: live-pulse 1.6s ease-out infinite;
}

@keyframes live-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-green) 55%, transparent);
  }
  70% {
    box-shadow: 0 0 0 0.55rem transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

.live-toast__icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--color-line-2);
  color: var(--color-green);
}

.live-toast__icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.live-toast__event {
  margin: 0 2.5rem 0.15rem 0;
  font-weight: 700;
  font-size: 0.95rem;
}

.live-toast__company,
.live-toast__time {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.35;
}

.site-float__fab {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 85;
  display: grid;
  place-items: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  background: var(--color-green);
  color: var(--color-cta-ink);
  box-shadow: 0 14px 40px -18px color-mix(in srgb, var(--color-green) 70%, transparent);
  transition: transform 200ms var(--ease);
}

.site-float__fab:hover {
  transform: translateY(-2px) scale(1.03);
}

.site-float__fab svg {
  width: 1.35rem;
  height: 1.35rem;
}

.site-float__bar {
  display: none;
}

@media (max-width: 720px) {
  .live-toast {
    left: max(0.75rem, env(safe-area-inset-left));
    right: max(0.75rem, env(safe-area-inset-right));
    bottom: calc(4.75rem + env(safe-area-inset-bottom));
    width: auto;
  }

  .site-float__fab {
    display: none;
  }

  .site-float__bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 85;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.65rem max(0.75rem, env(safe-area-inset-right))
      calc(0.65rem + env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
    border-top: 1px solid var(--color-line-2);
    background: color-mix(in srgb, var(--color-bg) 92%, transparent);
    backdrop-filter: blur(14px);
  }

  .site-float__btn {
    display: grid;
    place-items: center;
    min-height: 2.75rem;
    border: 1px solid var(--color-line-2);
    border-radius: var(--radius-pill);
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.92rem;
    text-decoration: none;
  }

  .site-float__btn--primary {
    border-color: transparent;
    background: var(--color-green);
    color: var(--color-cta-ink);
  }

  body {
    padding-bottom: 4.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .live-toast,
  .live-toast__dot,
  .site-float__fab {
    animation: none;
    transition: none;
  }
}

```


## email-chooser.css
- Path: `frontend/src/styles/email-chooser.css`

```css
.email-chooser {
  position: relative;
  display: inline-flex;
}

.email-chooser__trigger {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: color 180ms var(--ease);
}

.email-chooser__trigger:hover,
.email-chooser__trigger:focus-visible,
.email-chooser__trigger[aria-expanded="true"] {
  color: var(--color-green);
}

.email-chooser__panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + 0.65rem);
  z-index: 60;
  min-width: 14.5rem;
  padding: 0.65rem;
  border: 1px solid color-mix(in srgb, var(--color-green) 30%, var(--color-line));
  border-radius: calc(var(--radius-s) + 2px);
  background: #0d110d;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.email-chooser__panel--below {
  top: calc(100% + 0.65rem);
  bottom: auto;
}

.email-chooser__label {
  margin: 0 0 0.4rem;
  padding: 0 0.55rem;
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.email-chooser__option {
  display: block;
  width: 100%;
  padding: 0.7rem 0.75rem;
  border: 0;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 180ms var(--ease),
    color 180ms var(--ease);
}

.email-chooser__option:hover,
.email-chooser__option:focus-visible {
  background: color-mix(in srgb, var(--color-green) 12%, transparent);
  color: var(--color-green);
}

.email-chooser-enter-active,
.email-chooser-leave-active {
  transition:
    opacity 180ms var(--ease),
    transform 180ms var(--ease);
}

.email-chooser-enter-from,
.email-chooser-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* На контактах панель удобнее снизу от кнопки */
.contacts-direct .email-chooser__panel {
  top: calc(100% + 0.65rem);
  bottom: auto;
}

```


## main.css
- Path: `frontend/src/styles/main.css`

```css
@import "./tokens.css";

@import "./reset.css";

@import "./base.css";

@import "./layout.css";

@import "./buttons.css";

@import "./header.css";
@import "./home2.css";
@import "./services.css";
@import "./pages.css";
@import "./email-chooser.css";
@import "./footer.css";

@import "./admin.css";

@import "./form.css";

@import "./float.css";

body.is-scroll-locked {
  overflow: hidden;
  padding-right: var(--scrollbar-gap, 0px);
}

body.is-scroll-locked .header {
  padding-right: var(--scrollbar-gap, 0px);
}

```


### home2.css (first 400 lines — hero + shared section patterns)

```css
/* ============================================================
   Редизайн главной: тёмная сцена, зелёное свечение, 3D-визуалы,
   номерные карточки со скруглениями, крупная типографика.
   ============================================================ */

/* ---------- Общая сетка секций ---------- */

.section2 {
  position: relative;
  padding: clamp(4rem, 8vw, 7rem) 0;
}

.section2__head {
  max-width: 44rem;
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.section2__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 4.2vw, 3.1rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.04;
}

.section2__lead {
  margin: var(--space-20) 0 0;
  max-width: 38rem;
  color: var(--color-muted);
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.55;
}

.section2__foot {
  margin-top: clamp(2rem, 4vw, 3rem);
}

.note2 {
  margin-top: var(--space-24);
  max-width: 42rem;
  padding-left: var(--space-16);
  border-left: 2px solid var(--color-green);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-muted);
}

/* ---------- Базовая карточка ---------- */

.card2 {
  position: relative;
  padding: clamp(1.5rem, 2.5vw, 2rem);
  border: 1px solid var(--color-line-2);
  border-radius: var(--radius-l);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-green) 4%, transparent), transparent 40%),
    var(--color-surface-2);
  overflow: hidden;
  transition:
    border-color 260ms var(--ease),
    transform 260ms var(--ease),
    box-shadow 260ms var(--ease);
}

.card2--art {
  padding-right: clamp(5.5rem, 14vw, 8rem);
}

.card2__art {
  position: absolute;
  top: 0.35rem;
  right: 0.15rem;
  width: clamp(5.5rem, 14vw, 8rem);
  height: auto;
  max-height: 70%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  opacity: 0.95;
  filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--color-green) 18%, transparent));
  transition: transform 400ms var(--ease), opacity 260ms var(--ease);
}

.card2__art--sm {
  width: clamp(4.5rem, 11vw, 6.5rem);
  top: 0.5rem;
  right: 0.25rem;
}

.card2:hover .card2__art {
  transform: translateY(-4px) scale(1.04);
  opacity: 1;
}

.card2:hover {
  border-color: color-mix(in srgb, var(--color-green) 45%, var(--color-line-2));
  box-shadow: 0 20px 60px -30px color-mix(in srgb, var(--color-green) 25%, transparent);
}

a.card2 {
  display: block;
  color: inherit;
  text-decoration: none;
}

a.card2:hover {
  transform: translateY(-4px);
}

.card2__index {
  display: inline-block;
  margin-bottom: var(--space-16);
  font-family: var(--font-hero);
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--color-green);
}

.card2__arrow {
  position: absolute;
  top: clamp(1.25rem, 2vw, 1.75rem);
  right: clamp(1.25rem, 2vw, 1.75rem);
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid var(--color-line-2);
  border-radius: 50%;
  color: var(--color-green);
  font-size: 1.05rem;
  transition:
    background-color 260ms var(--ease),
    color 260ms var(--ease),
    transform 260ms var(--ease);
}

a.card2:hover .card2__arrow {
  background: var(--color-green);
  color: var(--color-cta-ink);
  transform: rotate(-45deg);
}

/* ---------- HERO ---------- */

.hero2 {
  position: relative;
  padding: calc(var(--header-height) + clamp(2rem, 5vw, 4rem)) 0 0;
  overflow: hidden;
}

.hero2__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 55% 45% at 78% 30%,
      color-mix(in srgb, var(--color-green) 10%, transparent),
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 35% at 10% 85%,
      color-mix(in srgb, var(--color-green) 5%, transparent),
      transparent 70%
    );
}

.hero2__grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.hero2__title {
  margin: 0 0 var(--space-20);
  font-family: var(--font-hero);
  font-size: clamp(2.3rem, 5.2vw, 4.1rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.0;
}

.hero2__title-accent {
  color: var(--color-green);
  text-shadow: 0 0 48px color-mix(in srgb, var(--color-green) 45%, transparent);
}

.hero2__sub {
  margin: 0 0 var(--space-32);
  max-width: 32rem;
  color: var(--color-muted);
  font-size: clamp(1rem, 1.8vw, 1.1rem);
  line-height: 1.55;
}

.hero2__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12);
}

.hero2__visual {
  position: relative;
}

.hero2__img-card {
  position: relative;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-line-2);
  background: radial-gradient(
      ellipse 80% 70% at 50% 30%,
      color-mix(in srgb, var(--color-green) 7%, transparent),
      transparent 75%
    ),
    var(--color-surface-2);
  overflow: visible;
}

.hero2__img-card img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: inherit;
  mix-blend-mode: screen;
}

.hero2__chip {
  position: absolute;
  display: grid;
  gap: 0.1rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-line-2);
  border-radius: var(--radius-m);
  background: color-mix(in srgb, var(--color-bg) 78%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 50px -20px rgba(0, 0, 0, 0.8);
}

.hero2__chip strong {
  font-family: var(--font-hero);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-green);
}

.hero2__chip span {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.hero2__chip--1 {
  top: 8%;
  left: -6%;
  animation: chip-float 7s ease-in-out infinite;
}

.hero2__chip--2 {
  bottom: 10%;
  right: -4%;
  animation: chip-float 7s ease-in-out 1.6s infinite;
}

@keyframes chip-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Статс-бар */
.hero2__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: clamp(2.5rem, 5vw, 4rem) 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--color-line-2);
  border-radius: var(--radius-l);
  background: var(--color-surface-2);
  overflow: hidden;
}

.hero2__stats li {
  display: grid;
  gap: 0.3rem;
  padding: clamp(1.25rem, 2.5vw, 1.9rem);
  border-left: 1px solid var(--color-line-2);
}

.hero2__stats li:first-child {
  border-left: none;
}

.hero2__stats strong {
  font-family: var(--font-hero);
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-green);
}

.hero2__stats span {
  font-size: 0.82rem;
  line-height: 1.35;
  color: var(--color-muted);
}

/* Бегущая строка */
.hero2__marquee {
  margin-top: clamp(2.5rem, 5vw, 4rem);
  padding: 1rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  overflow: hidden;
  white-space: nowrap;
}

.hero2__marquee-track {
  display: inline-flex;
  animation: marquee 36s linear infinite;
}

.hero2__marquee-row {
  display: inline-flex;
}

.hero2__marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 1.4rem;
  padding-right: 1.4rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.hero2__marquee-item i {
  font-style: normal;
  color: var(--color-green);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero2__marquee-track,
  .hero2__chip--1,
  .hero2__chip--2 {
    animation: none;
  }
}

/* ---------- Для кого ---------- */

.niche2-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-20);
}

.niche2-card {
  padding-right: clamp(5.5rem, 14vw, 8rem);
  padding-bottom: 4rem;
}

.niche2-card .card2__arrow {
  top: auto;
  bottom: 1.25rem;
  right: clamp(1.25rem, 2vw, 1.75rem);
  z-index: 2;
}

.niche2-card__title {
  margin: 0 0 var(--space-12);
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.niche2-card__text {
  margin: 0 0 var(--space-20);
  color: var(--color-muted);
```
