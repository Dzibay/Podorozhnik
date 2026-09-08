const ENDPOINT = '/api/t'
const FLUSH_MS = 4000
const MAX_BATCH = 20
const SESSION_IDLE_MS = 30 * 60 * 1000
const VISITOR_KEY = 'pd_vid'
const SESSION_KEY = 'pd_sid'
const SESSION_AT_KEY = 'pd_sid_at'
const SOURCE_KEY = 'pd_src'

const queue = []
let flushTimer = 0
let installed = false
let currentPath = ''
let pageStartedAt = 0
const scrollSeen = new Set()

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function read(key, store) {
  try {
    return store.getItem(key) || ''
  } catch {
    return ''
  }
}

function write(key, value, store) {
  try {
    store.setItem(key, value)
  } catch {
    /* private mode / quota */
  }
}

function visitorId() {
  let id = read(VISITOR_KEY, localStorage)
  if (!id) {
    id = uid()
    write(VISITOR_KEY, id, localStorage)
  }
  return id
}

function touchSession() {
  const now = Date.now()
  const last = Number(read(SESSION_AT_KEY, sessionStorage) || 0)
  let id = read(SESSION_KEY, sessionStorage)
  if (!id || (last && now - last > SESSION_IDLE_MS)) {
    id = uid()
    write(SESSION_KEY, id, sessionStorage)
    try {
      sessionStorage.removeItem(SOURCE_KEY)
    } catch {
      /* ignore */
    }
  }
  write(SESSION_AT_KEY, String(now), sessionStorage)
  return id
}

function stripTrackingParams(search) {
  const params = new URLSearchParams(search)
  for (const key of [...params.keys()]) {
    const k = key.toLowerCase()
    if (
      k.startsWith('utm_') ||
      k === 'yclid' ||
      k === 'gclid' ||
      k === 'fbclid' ||
      k === 'ysclid' ||
      k === 'ymclid' ||
      k === '_openstat'
    ) {
      params.delete(key)
    }
  }
  const q = params.toString()
  return q ? `?${q}` : ''
}

function pagePath(route) {
  if (route) return `${route.path}${stripTrackingParams(route.query ? toQuery(route.query) : location.search)}`
  return `${location.pathname}${stripTrackingParams(location.search)}`
}

function toQuery(query) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query || {})) {
    if (v == null || v === '') continue
    params.set(k, Array.isArray(v) ? v[0] : String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

function hostOf(url) {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

function sessionSource() {
  const cached = read(SOURCE_KEY, sessionStorage)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      /* fallthrough */
    }
  }
  const params = new URLSearchParams(location.search)
  const ref = document.referrer || ''
  const sameHost = ref && hostOf(ref) === location.host
  const src = {
    referrer: sameHost ? '' : ref.slice(0, 400),
    utm_source: (params.get('utm_source') || '').slice(0, 80),
    utm_medium: (params.get('utm_medium') || '').slice(0, 80),
    utm_campaign: (params.get('utm_campaign') || '').slice(0, 120),
    utm_content: (params.get('utm_content') || '').slice(0, 80),
    utm_term: (params.get('utm_term') || '').slice(0, 80),
  }
  write(SOURCE_KEY, JSON.stringify(src), sessionStorage)
  return src
}

function deviceType() {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function isAdminRoute(route) {
  if (route?.meta?.bare) return true
  const path = location.pathname
  return path === '/admin-panel' || path.startsWith('/admin-panel/') || path.includes('pd-panel-')
}

export function getIds() {
  return { visitorId: visitorId(), sessionId: touchSession() }
}

export function track(event, extra = {}) {
  if (!event || isAdminRoute()) return
  const src = sessionSource()
  const ids = getIds()
  queue.push({
    event: String(event).toLowerCase().slice(0, 32),
    t: Date.now(),
    visitor_id: ids.visitorId,
    session_id: ids.sessionId,
    path: extra.path || currentPath || pagePath(),
    title: (extra.title || document.title || '').slice(0, 160),
    referrer: src.referrer,
    utm_source: src.utm_source,
    utm_medium: src.utm_medium,
    utm_campaign: src.utm_campaign,
    utm_content: src.utm_content,
    utm_term: src.utm_term,
    label: (extra.label || '').slice(0, 120),
    href: (extra.href || '').slice(0, 400),
    props: extra.props && typeof extra.props === 'object' ? extra.props : {},
    device: deviceType(),
    viewport_w: window.innerWidth,
  })
  if (queue.length >= MAX_BATCH) flush()
  else scheduleFlush()
}

export function trackNow(event, extra = {}) {
  track(event, extra)
  flush(true)
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    flushTimer = 0
    flush()
  }, FLUSH_MS)
}

function flush(useBeacon = false) {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = 0
  }
  if (!queue.length) return
  const events = queue.splice(0, MAX_BATCH)
  const body = JSON.stringify({ events })
  try {
    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(ENDPOINT, blob)) return
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}

function textOf(el) {
  return (el.getAttribute('aria-label') || el.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function onClick(e) {
  const el = e.target?.closest?.('a, button, [data-track], [role="button"]')
  if (!el || el.disabled || el.closest('.adm')) return

  const href = (el.getAttribute('href') || '').trim()
  const named = (el.getAttribute('data-track') || '').trim()
  if (el.hasAttribute('data-notrack') || el.closest('[data-notrack]')) return
  const label = named || textOf(el)
  if (!label && !href) return

  const abs = href && !href.startsWith('#') && !href.startsWith('javascript:')
  const extra = {
    label,
    href: abs ? href : href.startsWith('tel:') || href.startsWith('mailto:') ? href : '',
    props: named && label !== textOf(el) ? { text: textOf(el) } : undefined,
  }

  if (href.startsWith('tel:')) {
    trackNow('tel', extra)
    return
  }
  if (href.startsWith('mailto:')) {
    trackNow('mail', { ...extra, props: { ...(extra.props || {}), provider: 'mailto' } })
    return
  }

  const external = href.startsWith('http') && hostOf(href) && hostOf(href) !== location.host
  track(external ? 'outbound' : 'click', extra)
}

function onScroll() {
  const doc = document.documentElement
  const h = doc.scrollHeight - window.innerHeight
  if (h <= 80) return
  const pct = (window.scrollY / h) * 100
  for (const depth of [25, 50, 75, 100]) {
    if (pct >= depth && !scrollSeen.has(depth)) {
      scrollSeen.add(depth)
      track('scroll', { label: `${depth}%`, props: { depth } })
    }
  }
}

let scrollTick = 0
function onScrollRaf() {
  if (scrollTick) return
  scrollTick = requestAnimationFrame(() => {
    scrollTick = 0
    onScroll()
  })
}

function emitLeave() {
  if (!pageStartedAt) return
  const ms = Date.now() - pageStartedAt
  if (ms < 400) return
  track('leave', { props: { ms } })
  pageStartedAt = 0
}

export function trackPageview(route) {
  if (isAdminRoute(route)) return
  emitLeave()
  currentPath = pagePath(route)
  pageStartedAt = Date.now()
  scrollSeen.clear()
  track('pageview', {
    path: currentPath,
    title: route?.meta?.title || document.title,
  })
}

export function installAnalytics(router) {
  if (installed || typeof window === 'undefined') return
  if (navigator.webdriver) return
  installed = true

  document.addEventListener('click', onClick, { capture: true, passive: true })
  window.addEventListener('scroll', onScrollRaf, { passive: true })

  const onHide = () => {
    emitLeave()
    flush(true)
  }
  window.addEventListener('pagehide', onHide)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide()
    else if (!pageStartedAt) pageStartedAt = Date.now()
  })

  router.afterEach((to) => {
    if (to.meta?.bare) return
    requestAnimationFrame(() => trackPageview(to))
  })
}
