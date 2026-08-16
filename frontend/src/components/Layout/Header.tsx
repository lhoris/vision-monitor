import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  toggleSidebar,
  setThemeMode,
} from '@/store/slices/uiSlice'
import type { ThemeMode } from '@/store/slices/uiSlice'
import { logoutUser } from '@/store/slices/authSlice'

const themeOptions: Array<{
  id: ThemeMode
  swatch: string
}> = [
  {
    id: 'theme1',
    swatch: 'bg-sky-500',
  },
  {
    id: 'theme2',
    swatch: 'bg-indigo-500',
  },
  {
    id: 'theme3',
    swatch: 'bg-emerald-500',
  },
]

const getThemeLabel = (theme: ThemeMode, language: string): string => {
  const themeNumber = theme.replace('theme', '')
  return language === 'ko' ? `테마 ${themeNumber}` : `Theme ${themeNumber}`
}

const getThemeDescription = (theme: ThemeMode, language: string): string => {
  const descriptions: Record<ThemeMode, { en: string; ko: string }> = {
    theme1: {
      en: 'Bright control room',
      ko: '밝은 관제실',
    },
    theme2: {
      en: 'Classic dark VMS',
      ko: '기본 다크 VMS',
    },
    theme3: {
      en: 'Mint command center',
      ko: '민트 관제 센터',
    },
  }

  return language === 'ko' ? descriptions[theme].ko : descriptions[theme].en
}

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const themeMode = useAppSelector((state) => state.ui.themeMode)
  const notifications = useAppSelector((state) => state.ui.notifications)
  const user = useAppSelector((state) => state.auth.user)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  const selectedTheme = themeOptions.find((theme) => theme.id === themeMode) ?? themeOptions[1]
  const selectedThemeLabel = getThemeLabel(selectedTheme.id, i18n.language)

  const handleThemeChange = (theme: ThemeMode) => {
    dispatch(setThemeMode(theme))
    setThemeMenuOpen(false)
  }

  const handleLogout = () => {
    setProfileMenuOpen(false)
    dispatch(logoutUser())
    navigate('/login')
  }

  const handleLanguageChange = async (lang: 'en' | 'ko') => {
    await i18n.changeLanguage(lang)
    setLanguageMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false)
      }
    }

    if (profileMenuOpen || languageMenuOpen || themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [profileMenuOpen, languageMenuOpen, themeMenuOpen])

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                AI Vision Monitor
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-500">Intelligent VMS</p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              title="Select theme"
            >
              <span className={`h-4 w-4 rounded-full ${selectedTheme.swatch}`} />
              <span className="hidden sm:inline">{selectedThemeLabel}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${themeMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {themeOptions.map((theme) => {
                  const label = getThemeLabel(theme.id, i18n.language)
                  const description = getThemeDescription(theme.id, i18n.language)

                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                        themeMode === theme.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full ${theme.swatch}`} />
                      <span>
                        <span className="block">{label}</span>
                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                          {description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              title={t('header.language')}
            >
              <span className="text-lg">
                {i18n.language === 'ko' ? '🇰🇷' : '🇺🇸'}
              </span>
              <span className="hidden sm:inline">
                {i18n.language === 'ko' ? '한국어' : 'English'}
              </span>
            </button>
            {languageMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    i18n.language === 'en'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors flex items-center gap-2`}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
                <button
                  onClick={() => handleLanguageChange('ko')}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    i18n.language === 'ko'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors flex items-center gap-2`}
                >
                  <span>🇰🇷</span>
                  <span>한국어</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Notifications">
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              <div className="absolute top-full mt-2 right-0 hidden group-hover:block bg-gray-900 dark:bg-gray-950 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                {notifications.length > 0 ? `${notifications.length} alert(s)` : 'No alerts'}
              </div>
            </button>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={`${user?.username || 'User'}`}
            >
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-semibold">
                  {user?.username.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                {user?.username}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-in fade-in-0 zoom-in-95 origin-top-right">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    User ID: {user?.id}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      // 프로필 페이지로 이동 (나중에 구현)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      // 설정 페이지로 이동
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      // 도움말 페이지로 이동
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Help & Support</span>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
