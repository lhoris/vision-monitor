/** 저장값은 건드리지 않고 목록·읽기 전용 표시값만 보호한다. */
export function maskName(value?: string | null): string {
  if (!value) return value ?? ''
  const text = value.trim()
  if (text.length <= 1) return '*'
  if (text.length === 2) return `${text[0]}*`
  return `${text[0]}${'*'.repeat(text.length - 2)}${text[text.length - 1]}`
}

export function maskPhone(value?: string | null): string {
  if (!value) return value ?? ''
  const digits = value.replace(/\D/g, '')
  if (digits.length < 8) return '*'.repeat(digits.length)
  const masked = `${digits.slice(0, 3)}****${digits.slice(-4)}`
  return value.includes('-') ? `${masked.slice(0, 3)}-${masked.slice(3, 7)}-${masked.slice(7)}` : masked
}

export function maskEmail(value?: string | null): string {
  if (!value) return value ?? ''
  const at = value.indexOf('@')
  if (at <= 0 || at === value.length - 1) return value
  const local = value.slice(0, at)
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 1))}${value.slice(at)}`
}

export function maskPrivacyValue(field: 'name' | 'email' | 'phone', value?: string | null): string {
  if (field === 'name') return maskName(value)
  if (field === 'email') return maskEmail(value)
  return maskPhone(value)
}
