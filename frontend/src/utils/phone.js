/** Российский телефон: маска, нормализация, валидация. */

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

/** Цифры в каноне 7XXXXXXXXXX (до 11 знаков). */
export function normalizeRuPhoneDigits(raw) {
  let digits = digitsOnly(raw)
  if (!digits) return ''

  // «8…» → «7…»
  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  // Набрали локальный номер без кода страны
  if (!digits.startsWith('7') && digits.length <= 10) {
    digits = `7${digits}`
  }

  // Лишняя семёрка в начале после автодополнения (+7 и ещё 7)
  if (digits.startsWith('77') && digits.length > 11) {
    digits = `7${digits.slice(2)}`
  }

  return digits.slice(0, 11)
}

/** Отображение: +7 (999) 123-45-67 */
export function formatRuPhone(raw) {
  const digits = normalizeRuPhoneDigits(raw)
  if (!digits) return ''

  const rest = digits.startsWith('7') ? digits.slice(1) : digits
  let out = '+7'
  if (!rest.length) return out

  out += ` (${rest.slice(0, 3)}`
  if (rest.length < 3) return out
  out += ')'

  if (rest.length === 3) return out
  out += ` ${rest.slice(3, 6)}`
  if (rest.length <= 6) return out

  out += `-${rest.slice(6, 8)}`
  if (rest.length <= 8) return out

  out += `-${rest.slice(8, 10)}`
  return out
}

export function isValidRuPhone(raw) {
  const digits = normalizeRuPhoneDigits(raw)
  return digits.length === 11 && digits.startsWith('7')
}

/** E.164 для API: +79001234567 */
export function toE164(raw) {
  const digits = normalizeRuPhoneDigits(raw)
  return digits ? `+${digits}` : ''
}
