import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar } from '@/store/slices/uiSlice'
import type { User } from '@/store/slices/authSlice'
import type { ReactNode } from 'react'

interface NavItem {
  path: string
  labelKey: string
  icon: ReactNode
}

interface NavGroup {
  labelKey?: string
  items: NavItem[]
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function PlaybackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8M5 5h14v14H5z" />
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

function PolicyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M6 4h12v7c0 5-3.5 8-6 9-2.5-1-6-4-6-9V4z" />
    </svg>
  )
}

const generalNavItems: NavItem[] = [
  { path: '/live', labelKey: 'navigation.live', icon: <CameraIcon /> },
  { path: '/playback', labelKey: 'navigation.playback', icon: <PlaybackIcon /> },
  { path: '/events', labelKey: 'navigation.events', icon: <EventIcon /> },
]

const adminNavGroups: NavGroup[] = [
  {
    labelKey: 'navigation.admin.communicationModel',
    items: [
      {
        path: '/admin/monitoring-communication',
        labelKey: 'navigation.admin.monitoringCommunication',
        icon: <NetworkIcon />,
      },
      {
        path: '/admin/control-communication',
        labelKey: 'navigation.admin.controlCommunication',
        icon: <NetworkIcon />,
      },
      {
        path: '/admin/external-addresses',
        labelKey: 'navigation.admin.externalAddresses',
        icon: <NetworkIcon />,
      },
      {
        path: '/admin/model-restart',
        labelKey: 'navigation.admin.modelRestart',
        icon: <ModelIcon />,
      },
      {
        path: '/admin/video-models/new',
        labelKey: 'navigation.admin.videoModelCreate',
        icon: <ModelIcon />,
      },
    ],
  },
  {
    labelKey: 'navigation.admin.accessManagement',
    items: [
      { path: '/admin/users', labelKey: 'navigation.admin.users', icon: <UserAccessIcon /> },
      { path: '/admin/roles', labelKey: 'navigation.admin.roles', icon: <UserAccessIcon /> },
      {
        path: '/admin/permission-policies',
        labelKey: 'navigation.admin.permissionPolicies',
        icon: <PolicyIcon />,
      },
      { path: '/admin/menu-access', labelKey: 'navigation.admin.menuAccess', icon: <PolicyIcon /> },
    ],
  },
]

function canAccessAdminMenu(user: User | null): boolean {
  return user?.role === 'admin' || Boolean(user?.permissions?.includes('admin:access'))
}

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)
  const user = useAppSelector((state) => state.auth.user)
  const showAdminMenu = canAccessAdminMenu(user)

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
          <h1 className="text-xl font-bold">Vision Monitor</h1>
          <p className="mt-1 text-xs text-gray-400">Manufacturing VMS</p>
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
                <div key={group.labelKey} className="space-y-2">
                  <p className="px-3 text-xs font-semibold text-gray-400">
                    {group.labelKey ? t(group.labelKey) : ''}
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
