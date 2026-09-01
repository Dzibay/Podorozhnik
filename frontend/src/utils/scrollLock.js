let lockCount = 0

function setScrollGap() {
  const gap = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty('--scrollbar-gap', `${gap}px`)
}

export function lockScroll() {
  if (lockCount === 0) {
    setScrollGap()
    document.body.classList.add('is-scroll-locked')
  }
  lockCount += 1
}

export function unlockScroll() {
  if (lockCount <= 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.classList.remove('is-scroll-locked')
    document.documentElement.style.removeProperty('--scrollbar-gap')
  }
}

export function resetScrollLock() {
  lockCount = 0
  document.body.classList.remove('is-scroll-locked')
  document.documentElement.style.removeProperty('--scrollbar-gap')
}
