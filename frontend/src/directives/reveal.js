/**
 * v-reveal — плавное появление элемента при попадании в экран.
 * v-reveal            → сдвиг снизу + fade
 * v-reveal="'scale'"  → вариант анимации (fade | scale)
 * v-reveal.lines      → только класс is-in (для построчных заголовков .lines)
 *
 * В пререндере элементы сразу открыты (класс is-in): текст виден до загрузки JS и без него.
 * При гидрации то, что уже на экране, остаётся как есть, а всё ниже прячется
 * и появляется с анимацией при прокрутке — как при обычном переходе по сайту.
 */
let observer = null
let hydrateObserver = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        show(entry.target)
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  )
  return observer
}

/* без отступа снизу: элемент у нижнего края экрана уже виден, его не прячем */
function getHydrateObserver() {
  if (hydrateObserver) return hydrateObserver
  hydrateObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target
      hydrateObserver.unobserve(el)
      if (entry.isIntersecting) {
        show(el)
        continue
      }
      el._revealed = false
      el.classList.remove('is-in')
      watch(el)
    }
  })
  return hydrateObserver
}

function show(el) {
  el._revealed = true
  el.classList.add('is-in')
}

function watch(el) {
  if (el._revealKind !== null) el.setAttribute('data-reveal', el._revealKind)
  getObserver().observe(el)
}

export const reveal = {
  getSSRProps() {
    return { class: 'is-in' }
  },
  mounted(el, binding) {
    if (typeof IntersectionObserver === 'undefined') {
      show(el)
      return
    }
    el._revealKind = binding.modifiers.lines ? null : binding.value || ''
    // открыт пререндером — решаем после первой отрисовки, на экране ли он
    if (el.classList.contains('is-in')) {
      el._revealed = true
      getHydrateObserver().observe(el)
      return
    }
    watch(el)
  },
  // динамический :class перезаписывает className и стирает is-in — возвращаем его
  updated(el) {
    if (el._revealed) el.classList.add('is-in')
  },
  unmounted(el) {
    observer?.unobserve(el)
    hydrateObserver?.unobserve(el)
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
