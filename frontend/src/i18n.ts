import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

const resources = {
  en: { translation: en },
  ko: { translation: ko },
}

const getInitialLanguage = (): 'en' | 'ko' => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null
  if (saved === 'en' || saved === 'ko') return saved
  return 'en'
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

// localStorage에 자동 저장
i18next.on('languageChanged', (lng: string) => {
  localStorage.setItem('i18nextLng', lng)
})

export default i18next
