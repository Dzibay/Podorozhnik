/**
 * v-reveal — плавное появление элемента при попадании в экран.
 * v-reveal            → сдвиг снизу + fade
 * v-reveal="'scale'"  → вариант анимации (fade | scale)
 * v-reveal.lines      → только класс is-in (для построчных заголовков .lines)
 */
let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  )
  return observer
}

export const reveal = {
  mounted(el, binding) {
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    if (!binding.modifiers.lines) {
      el.setAttribute('data-reveal', binding.value || '')
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

/** Подсветка под курсором для карточек: выставляет --mx/--my на [data-spot] и .card2 */
export function installSpotlight() {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(hover: hover)').matches) return
  document.addEventListener(
    'pointermove',
    (event) => {
      const el = event.target.closest?.('[data-spot], .card2')
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      el.style.setProperty('--my', `${event.clientY - rect.top}px`)
    },
    { passive: true },
  )
}
