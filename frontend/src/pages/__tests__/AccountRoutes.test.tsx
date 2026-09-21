import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { AppRoutes } from '@/App'
import authReducer from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'
import commonCodeReducer from '@/store/slices/commonCodeSlice'
import cameraReducer from '@/store/slices/cameraSlice'
import eventReducer from '@/store/slices/eventSlice'

const { getEvents } = vi.hoisted(() => ({ getEvents: vi.fn().mockResolvedValue(null) }))
vi.mock('@/services/eventService', () => ({ eventService: { getEvents } }))
vi.mock('@/components/Layout', () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }))
vi.mock('@/pages/Live', () => ({ default: () => <h1>Live Dashboard</h1> }))

function CurrentPath() {
  const location = useLocation()
  return <output data-testid="current-path">{location.pathname}</output>
}

function renderRoute(path: string, authenticated = true) {
  const preloadedState = {
    auth: authenticated
      ? { isAuthenticated: true, user: { id: 5, username: 'route-user', role: 'user', permissions: [] }, loading: false, error: null, sessionStatus: 'valid' as const }
      : { isAuthenticated: false, user: null, loading: false, error: null, sessionStatus: 'invalid' as const },
    ui: { sidebarOpen: false, themeMode: 'theme2' as const, notifications: [], modal: { isOpen: false, type: null }, selectedTab: '' },
    commonCode: { version: '', codes: {}, status: 'succeeded' as const, error: null },
  }
  const store = configureStore({ reducer: { auth: authReducer, ui: uiReducer, commonCode: commonCodeReducer, camera: cameraReducer, event: eventReducer }, preloadedState: preloadedState as never })
  return render(<Provider store={store}><I18nextProvider i18n={i18n}><MemoryRouter initialEntries={[path]}><AppRoutes /><CurrentPath /></MemoryRouter></I18nextProvider></Provider>)
}

describe('account routes', () => {
  it('requires authentication for legacy account URLs', () => {
    renderRoute('/account/profile', false)
    expect(screen.getByLabelText(/USER ID/)).toBeInTheDocument()
  })

  it('routes the application root to the live dashboard', () => {
    renderRoute('/')
    expect(screen.getByTestId('current-path')).toHaveTextContent('/live')
  })

  it('keeps the existing system settings page separate from account information', () => {
    renderRoute('/settings')
    expect(screen.queryByText(/First screen after login/)).not.toBeInTheDocument()
  })
})
