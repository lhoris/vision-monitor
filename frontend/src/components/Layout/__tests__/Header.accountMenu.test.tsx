import { Provider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '@/store'
import type { Event } from '@/types'
import i18n from '@/i18n'
import { Header } from '@/components/Layout/Header'
import { acknowledgeEvent, fetchEvents } from '@/store/slices/eventSlice'

vi.mock('@/services/authService', () => ({
  authService: {
    getMyProfile: vi.fn().mockResolvedValue({ id: 1, username: 'tester', name: 'Tester', role: 'USER' }),
    changePassword: vi.fn(),
  },
}))

function CurrentPath() {
  const location = useLocation()
  return <output data-testid="current-path">{location.pathname}</output>
}

function renderHeader() {
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/live']}>
          <Header />
          <CurrentPath />
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  )
}

describe('Header account menu', () => {
  afterEach(() => {
    cleanup()
    store.dispatch(fetchEvents.fulfilled({
      content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 100,
    }, 'header-test-reset', undefined))
  })

  it('opens the original menu first and opens profile/help only when selected', async () => {
    await i18n.changeLanguage('en')
    renderHeader()

    fireEvent.click(screen.getByLabelText(/Open account center|怨꾩젙/))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /My Profile/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /^Settings$/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Help & Support/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: /My Profile/ }))
    expect(screen.getByRole('dialog', { name: /Account Center/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /My Profile/ })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: /Help & Support/ }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent(/Quick Guide/)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('routes the Settings menu item to the existing system settings page', async () => {
    await i18n.changeLanguage('en')
    renderHeader()
    fireEvent.click(screen.getByLabelText(/Open account center|怨꾩젙/))
    fireEvent.click(screen.getByRole('menuitem', { name: /^Settings$/ }))
    expect(screen.getByTestId('current-path')).toHaveTextContent('/settings')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows unacknowledged alarms in the bell menu and opens the alarm list', async () => {
    await i18n.changeLanguage('en')
    const alarm: Event = {
      id: 71,
      cameraId: 1,
      type: 'cooling_bed_temperature_high',
      severity: 'critical',
      description: 'Cooling bed high temperature',
      timestamp: new Date('2026-09-21T09:00:00Z'),
      acknowledged: false,
      metadata: { descriptionEn: 'Coil C260921-014 exceeded its cooling-bed temperature limit.' },
    }
    store.dispatch(fetchEvents.fulfilled({
      content: [alarm], totalElements: 1, totalPages: 1, currentPage: 0, pageSize: 100,
    }, 'header-test', undefined))
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: '1 unacknowledged alarms' }))
    expect(screen.getByRole('dialog', { name: 'Unacknowledged Alarms' })).toHaveTextContent('Cooling Bed Temperature Above Limit')
    expect(screen.getByRole('dialog', { name: 'Unacknowledged Alarms' })).toHaveTextContent('Coil C260921-014 exceeded')

    fireEvent.click(screen.getByRole('button', { name: 'View alarm list' }))
    expect(screen.getByTestId('current-path')).toHaveTextContent('/events')

    store.dispatch(acknowledgeEvent(alarm.id))
  })
})
