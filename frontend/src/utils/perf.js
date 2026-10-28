import { computed, onMounted, reactive, ref } from 'vue'

/**
 * Облегчённый режим для телефонов и слабых компьютеров.
 *
 * Включается сразу, если: узкий экран или сенсорный ввод, системное «уменьшить движение»,
 * экономия трафика или медленная сеть, мало ядер или памяти.
 * На остальных устройствах первые секунды меряем частоту кадров: если она стабильно
 * проседает, режим включается на ходу и запоминается до конца сессии.
 *
 * Компоненты читают perf.lite, CSS — класс html.is-lite. В шаблонах — useLite()/useCalm():
 * страницы приходят готовым HTML (полная версия), и до гидрации разметка должна с ним совпадать.
 * Для проверки: ?lite=1 или ?lite=0 в адресе (запоминается в sessionStorage).
 */
export const perf = reactive({ lite: false, why: '' })

const KEY = 'pd-lite'
const mq = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches

function detect() {
  const forced = new URLSearchParams(location.search).get('lite')
  if (forced === '0' || forced === '1') sessionStorage.setItem(KEY, forced === '1' ? 'forced' : 'off')
  const saved = sessionStorage.getItem(KEY)
  if (saved === 'off') return ''
  if (saved) return saved

  if (mq('(max-width: 960px)') || (mq('(pointer: coarse)') && !mq('(pointer: fine)'))) return 'mobile'
  if (mq('(prefers-reduced-motion: reduce)')) return 'reduced-motion'
  const net = navigator.connection
  if (net?.saveData || ['slow-2g', '2g', '3g'].includes(net?.effectiveType)) return 'network'
  if ((navigator.hardwareConcurrency || 8) <= 4) return 'cpu'
  if ((navigator.deviceMemory || 8) <= 4) return 'memory'
  return ''
}

function apply(why) {
  perf.lite = Boolean(why)
  perf.why = why
  document.documentElement.classList.toggle('is-lite', perf.lite)
}

/** Следим за кадрами первые ~25 секунд видимой работы страницы */
function watchFps() {
  let last = performance.now()
  let windowStart = last
  let frames = 0
  let slow = 0
  let watched = 0
  const tick = (now) => {
    const gap = now - last
    last = now
    // вкладка была скрыта или страница ещё грузится — такие окна не считаем
    if (gap > 250 || document.visibilityState !== 'visible' || now < 2000) {
      windowStart = now
      frames = 0
      requestAnimationFrame(tick)
      return
    }
    frames++
    if (now - windowStart >= 1000) {
      const fps = (frames * 1000) / (now - windowStart)
      watched++
      slow = fps < 34 ? slow + 1 : 0
      windowStart = now
      frames = 0
      if (slow >= 2) {
        sessionStorage.setItem(KEY, 'fps')
        apply('fps')
        return
      }
    }
    if (watched < 25) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function installPerf() {
  if (typeof window === 'undefined') return
  apply(detect())

  // поворот планшета или изменение окна могут перевести устройство в «узкие»
  window.matchMedia('(max-width: 960px)').addEventListener('change', (event) => {
    if (sessionStorage.getItem(KEY)) return
    apply(event.matches ? 'mobile' : detect())
  })

  if (!perf.lite) watchFps()
}

/** Спокойный режим: без сцен, завязанных на прокрутку, и бесконечных анимаций */
export const calmMotion = () => perf.lite || mq('(prefers-reduced-motion: reduce)')

/** true после монтирования компонента: на сервере и во время гидрации — false */
function useMounted() {
  const mounted = ref(false)
  onMounted(() => (mounted.value = true))
  return mounted
}

/** perf.lite для шаблонов: до монтирования — полная версия, как в пререндере */
export function useLite() {
  const mounted = useMounted()
  return computed(() => mounted.value && perf.lite)
}

/** calmMotion() для шаблонов и вычислений, от которых зависит разметка */
export function useCalm() {
  const mounted = useMounted()
  return computed(() => mounted.value && calmMotion())
}
