# Podorozhnik × Raw Form Design System

## Product context
**ПОДОРОЖНИК** — внешний отдел маркетинга и IT. Продаёт стабильный поток заявок для производства, стройки и понятных услуг. Ключевые офферы: сайт за 24 часа, Яндекс.Директ, SEO, аналитика, боты, абонентка от 45 000 ₽. Главный CTA: бесплатный аудит.

## Style direction
High-contrast **Brutalist Poster** system (Raw Form): typographic drama, atmospheric soft gradients, sharp grid hierarchy. Replaces container-heavy dark SaaS UI. Swiss Brutalism energy + warm refined palette.

## Color (LOCKED)
| Role | Hex | Use |
|------|-----|-----|
| Base | `#E4E2DD` | page background |
| Primary | `#1E1E1E` | text, solid CTAs, footer bg |
| Accent Red | `#DB4A2B` | CTAs secondary, selection, hover accents, scrollbar thumb |
| Warm Orange | `#F8A348` | gradient blobs, category dividers |
| Soft Pink | `#FF89A9` | hover title shift, accent moments |
| Muted price/meta | `#444444` | secondary metadata |
| Campaign surface | `#D9D6D0` | campaign/blocks |
| Inverse text | `#E4E2DD` | text on dark footer |

Selection: background `#DB4A2B`, text white.  
Scrollbar: 8px, thumb `#DB4A2B`, track `#E4E2DD`.

## Typography (LOCKED)
- **Clash Display** — headings, wordmark, hero, category dividers. Weight 700, tracking `-0.05em`, leading `0.75` for display sizes. Uppercase where specified.
- **Satoshi** — body, nav links, metadata. Weight 400–500 (medium for nav).
- Do NOT use Manrope, Inter, Inter Tight, or serif faces.

### Type scale cues
- Hero headline: ~18vw, uppercase, line-height 0.75; second line indented ~15vw
- Category divider: ~12vw, uppercase, tracking tighter, opacity ~0.9
- Campaign headline: ~6vw, leading 0.9
- Nav links: Satoshi medium, 14px, tracking 0.1em
- Product/meta labels: Satoshi bold uppercase, 14px, tracking 0.15em
- Body subtext: max-width 400px, ~20px

## Shape & interaction
- Buttons: **rectangular, no border-radius** (anti-pill)
- Interactive CTA: bg `#1E1E1E`, text `#E4E2DD`; hover white fill slides L→R (`transform -100% → 0`), text → `#DB4A2B`, 0.3s ease-out
- Secondary CTA: text link `#DB4A2B` + arrow
- Global entrance: slide-up, `cubic-bezier(0.16, 1, 0.3, 1)`, 0.8s
- Atmosphere: absolute blobs `~60vw`, colors `#DB4A2B` / `#F8A348`, `filter: blur(140px)`, `mix-blend-mode: multiply`, slow pulse opacity 0.6–0.9 over 10–15s

## Layout patterns
1. **Nav** — fixed minimal: left brand Clash Display uppercase; center Satoshi links; right actions (phone / audit). Dark text on desktop.
2. **Hero** — full viewport; three blurred pulsing blobs; massive Clash Display headline; Satoshi sub; primary black CTA + red text secondary.
3. **Category dividers** — full-width, 128px vertical pad, faint `#F8A348/20%` radial; huge Clash Display section titles alternating L/R align.
4. **Content grids** — borderless; prefer asymmetric/editorial stacks over rounded cards; thin dividers `#1E1E1E/20%`.
5. **Campaign / offer blocks** — surface `#D9D6D0`, 12-col grid, left big type / right stacked links with circular arrow borders.
6. **Footer** — bg `#1E1E1E`, text `#E4E2DD`; 4-col; massive year watermark `#FFFFFF/10%` ~10vw.

## Content mapping (homepage)
Keep Russian Podorozhnik copy and section jobs, restyled into Raw Form:
- Hero: «Стабильный поток заявок…» + audit CTAs + stats as typographic metrics (not rounded cards)
- For whom / pain / capabilities / pricing / cases / process / FAQ / CTA → brutalist sections with category dividers between major blocks
- Marquee services may become a horizontal typographic strip
- Wordmark stays **ПОДОРОЖНИК** in Clash Display (no invented logo marks)

## Hard constraints
- Use ONLY fonts/colors/shapes above
- No dark-mode black `#050505` page, no lime `#c8ff00`, no pill buttons, no glass lime 3D leaf aesthetic in redesign drafts
- Prefer typography + blobs over heavy bordered card UI
- Motion: smooth cubic-bezier, premium — not playful bounce
