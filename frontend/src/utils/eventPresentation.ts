import type { Event } from '@/types'

type Translate = (key: string) => string

export function getEventTypeLabel(type: string, t: Translate): string {
  const key = `events.types.${type}`
  const translated = t(key)
  return translated === key ? `${t('events.otherType')}: ${type.replace(/_/g, ' ')}` : translated
}

export function getEventDescription(event: Event, language: string, t: Translate): string {
  const localeKey = language.startsWith('ko') ? 'descriptionKo' : 'descriptionEn'
  const localizedMetadata = event.metadata?.[localeKey]
  if (typeof localizedMetadata === 'string' && localizedMetadata.trim()) return localizedMetadata

  const key = `events.descriptions.${event.type}`
  const translated = t(key)
  return translated === key ? event.description : translated
}
