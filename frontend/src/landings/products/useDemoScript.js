import { onMounted, onUnmounted, ref } from 'vue'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Проигрывает сценарий демо: список шагов [{ at: мс от начала, run() }].
 * Играет, только пока демо на экране и вкладка видна; после последнего шага
 * ждёт `hold` и начинает сначала. При «уменьшить движение» сразу показывает
 * финальный кадр — все шаги подряд без пауз.
 *
 * `build(scenario)` пересобирает шаги под выбранный сценарий и сбрасывает состояние.
 * `onEnd` вызывается один раз, когда сценарий доигран, — вместо повтора.
 */
export function useDemoScript(root, build, { hold = 3500, onEnd = null } = {}) {
  const playing = ref(false)
  let steps = []
  let index = 0
  let clock = 0
  let last = 0
  let raf = 0
  let visible = false
  let observer = null
  let scenario = null

  function load(next) {
    scenario = next
    steps = build(next).sort((a, b) => a.at - b.at)
    index = 0
    clock = 0
    if (reducedMotion()) {
      steps.forEach((s) => s.run())
      index = steps.length
    }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick)
    // после возврата на вкладку не перескакиваем весь пропущенный кусок
    clock += Math.min(now - last, 100)
    last = now
    while (index < steps.length && steps[index].at <= clock) steps[index++].run()
    const end = (steps.at(-1)?.at || 0) + hold
    if (index < steps.length || clock <= end) return
    // дальше — следующий сценарий (его включает страница) или повтор этого
    if (onEnd) {
      cancelAnimationFrame(raf)
      onEnd()
    } else load(scenario)
  }

  function sync() {
    const should = visible && !document.hidden && !reducedMotion()
    if (should === playing.value) return
    playing.value = should
    if (should) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    } else cancelAnimationFrame(raf)
  }

  function restart(next = scenario) {
    load(next)
  }

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') visible = true
    else {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        sync()
      })
      observer.observe(root.value)
    }
    document.addEventListener('visibilitychange', sync)
    sync()
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    observer?.disconnect()
    document.removeEventListener('visibilitychange', sync)
  })

  return { load, restart, playing }
}

/** Помощник для сценариев: шаги идут друг за другом с паузами, `at` копится сам */
export function timeline() {
  const steps = []
  let at = 0
  const api = {
    wait(ms) {
      at += ms
      return api
    },
    do(run) {
      steps.push({ at, run })
      return api
    },
    steps,
  }
  return api
}
