/**
 * v-play: пока элемент на экране, у него есть класс is-playing —
 * по нему CSS-анимации внутри (например, мини-превью услуг) ставятся на ход.
 */
export const play = {
  mounted(el) {
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-playing')
      return
    }
    el._playIo = new IntersectionObserver(([entry]) => el.classList.toggle('is-playing', entry.isIntersecting))
    el._playIo.observe(el)
  },
  unmounted(el) {
    el._playIo?.disconnect()
  },
}
