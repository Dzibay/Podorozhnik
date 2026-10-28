import { onMounted, onUnmounted, ref } from 'vue'
import { isHydrating } from './hydration'

/**
 * Отсчёт чисел при появлении на экране: progress от 0 до 1 с замедлением к концу.
 * В готовом HTML числа сразу итоговые — их видят поисковики и посетители без JS.
 * Если при загрузке блок уже на экране, числа так и остаются; если ниже — обнуляются
 * и отсчитываются, когда до них докрутят. При переходе по сайту — всегда с нуля.
 */
export function useCountUp(target, { duration = 1600, threshold = 0 } = {}) {
  const progress = ref(1)
  let observer = null
  let frame = 0

  function run() {
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration))
      progress.value = 1 - Math.pow(1 - t, 4)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let waiting = !isHydrating()
    if (waiting) progress.value = 0
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          if (waiting) run()
        } else if (!waiting) {
          waiting = true
          progress.value = 0
        }
      },
      { threshold },
    )
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
  })

  return progress
}
