import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

const resources = {
  en: { translation: en },
  ko: { translation: ko },
}

export type SupportedLanguage = 'en' | 'ko'

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko'

const userLanguageKey = (username: string) => `i18nextLng:user:${username}`

export function getUserLanguage(username?: string | null): SupportedLanguage {
  if (typeof window === 'undefined' || !username) return DEFAULT_LANGUAGE
  const saved = localStorage.getItem(userLanguageKey(username))
  return saved === 'en' || saved === 'ko' ? saved : DEFAULT_LANGUAGE
}

export function saveUserLanguage(username: string | null | undefined, language: SupportedLanguage): void {
  if (typeof window === 'undefined' || !username) return
  localStorage.setItem(userLanguageKey(username), language)
}

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const storedUser = JSON.parse(localStorage.getItem('authUser') ?? 'null') as { username?: string } | null
    return getUserLanguage(storedUser?.username)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

i18next.use(initReactI18next).init(
  {
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  },
  (err: any) => {
    if (err) console.error('i18next init error:', err)
  }
)

export default i18next
