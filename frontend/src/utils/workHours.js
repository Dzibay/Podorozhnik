/**
 * Рабочее время по Москве: пн–пт, 10:00–19:00.
 * Вызывать после монтирования: в готовом HTML статус всегда «на связи».
 */
const WORK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

/** online — сейчас рабочее время; back — когда перезвоним, если нет */
export function workStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const day = parts.find((part) => part.type === 'weekday')?.value
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)
  const workday = WORK_DAYS.includes(day)
  // вечер пятницы и выходные — до понедельника, остальные вечера и ночи — до утра
  const back = !workday || (day === 'Fri' && hour >= 19) ? 'в понедельник' : 'утром'
  return { online: workday && hour >= 10 && hour < 19, back }
}
