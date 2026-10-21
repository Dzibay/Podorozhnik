import { onMounted, onUnmounted, ref } from 'vue'
import { calmMotion } from '../../utils/perf'

/**
 * Прогресс прокрутки элемента, 0…1.
 * pass — от момента, когда верх элемента показался снизу, до ухода низа за верх экрана.
 * pin  — для секций со sticky-содержимым: от верха секции у верха экрана до её конца.
 * В спокойном режиме сразу 1 и без слушателей прокрутки.
 */
export function useScrollProgress(target, mode = 'pass') {
  const progress = ref(0)
  let frame = 0

  function measure() {
    frame = 0
    const el = target.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const value = mode === 'pin' ? -rect.top / Math.max(1, rect.height - vh) : (vh - rect.top) / (vh + rect.height)
    progress.value = Math.min(1, Math.max(0, value))
  }

  function onScroll() {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    if (calmMotion()) {
      progress.value = 1
      return
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  onUnmounted(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  return progress
}

export { calmMotion }
