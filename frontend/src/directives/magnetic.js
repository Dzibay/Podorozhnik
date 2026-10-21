/**
 * v-magnetic — элемент слегка «притягивается» к курсору.
 * Значение директивы — сила притяжения (по умолчанию 0.3).
 */
const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const magnetic = {
  mounted(el, binding) {
    if (!fine) return
    const strength = binding.value ?? 0.3
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    el._magMove = (event) => {
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`
    }
    el._magLeave = () => {
      el.style.transform = ''
    }
    el.addEventListener('pointermove', el._magMove)
    el.addEventListener('pointerleave', el._magLeave)
  },
  unmounted(el) {
    el.removeEventListener('pointermove', el._magMove)
    el.removeEventListener('pointerleave', el._magLeave)
  },
}
