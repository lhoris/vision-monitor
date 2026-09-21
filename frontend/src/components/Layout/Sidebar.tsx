import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAppBranding } from '@/hooks/useAppBranding'
import type { ReactNode } from 'react'
import { hasAdminAccess } from '@/store/slices/authSlice'

interface NavItem {
  path: string
  labelKey: string
  icon: ReactNode
}

interface NavGroup {
  labelKey: string
  items: NavItem[]
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function AlarmIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function ModelIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  )
}

function UserAccessIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-6a4 4 0 11-8 0 4 4 0 018 0zm6 1l1.5 1.5L22 7" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.5 4a6.5 6.5 0 01-.1 1.1l1.1.9-2 3.4-1.3-.5a7 7 0 01-1.9 1.1L16 19.5h-4l-.3-1.5a7 7 0 01-1.9-1.1l-1.3.5-2-3.4 1.1-.9A6.5 6.5 0 017.5 12c0-.4 0-.8.1-1.1l-1.1-.9 2-3.4 1.3.5a7 7 0 011.9-1.1L12 4.5h4l.3 1.5a7 7 0 011.9 1.1l1.3-.5 2 3.4-1.1.9c.1.4.1.7.1 1.1z" />
    </svg>
  )
}

const generalNavItems: NavItem[] = [
  { path: '/live', labelKey: 'navigation.live', icon: <CameraIcon /> },
  { path: '/events', labelKey: 'navigation.events', icon: <AlarmIcon /> },
]

const adminNavGroups: NavGroup[] = [
  {
    labelKey: 'navigation.admin.communicationModel',
    items: [
      { path: '/admin/model-management', labelKey: 'navigation.admin.modelRestart', icon: <ModelIcon /> },
      { path: '/admin/videos', labelKey: 'navigation.admin.videos', icon: <CameraIcon /> },
    ],
  },
  {
    labelKey: 'navigation.admin.systemManagement',
    items: [
      { path: '/admin/users', labelKey: 'navigation.admin.users', icon: <UserAccessIcon /> },
      { path: '/admin/common-codes', labelKey: 'navigation.admin.commonCodes', icon: <SettingsIcon /> },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const branding = useAppBranding()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)
  const user = useAppSelector((state) => state.auth.user)
  const showAdminMenu = hasAdminAccess(user)

  const handleNavigate = () => {
    if (window.innerWidth < 768) {
      dispatch(toggleSidebar())
    }
  }

  const renderItem = (item: NavItem) => {
    const isActive = location.pathname === item.path

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleNavigate}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {item.icon}
        <span className="min-w-0 truncate">{t(item.labelKey)}</span>
      </Link>
    )
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <nav
        className={`fixed z-50 flex h-screen w-72 flex-col border-r border-gray-800 bg-gray-900 text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold">{branding.title}</h1>
          <p className="mt-1 text-xs text-gray-400">{branding.subtitle}</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <section className="space-y-2">
            {generalNavItems.map(renderItem)}
          </section>

          {showAdminMenu && (
            <section aria-label={t('navigation.admin.title')} className="space-y-4 border-t border-gray-800 pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('navigation.admin.title')}
              </p>
              {adminNavGroups.map((group) => (
                <div key={group.labelKey} role="group" aria-label={t(group.labelKey)} className="space-y-2">
                  <p className="px-3 text-xs font-semibold text-gray-400">
                    {t(group.labelKey)}
                  </p>
                  <div className="space-y-1">
                    {group.items.map(renderItem)}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="border-t border-gray-800 px-6 py-4 text-xs text-gray-400">
          <p>v1.0.0</p>
        </div>
      </nav>
    </>
  )
}
