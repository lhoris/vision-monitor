import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { Events } from '@/pages/Events'
import { store } from '@/store'
import { fetchEvents, setFilter } from '@/store/slices/eventSlice'
import type { Event } from '@/types'

const alarmFixtures: Event[] = [
  {
    id: 11,
    cameraId: 1,
    type: 'motion_detected',
    severity: 'critical',
    description: 'Motion detected',
    timestamp: new Date('2026-09-21T09:00:00Z'),
    acknowledged: false,
  },
  {
    id: 12,
    cameraId: 2,
    type: 'camera_offline',
    severity: 'medium',
    description: 'Camera lost connection',
    timestamp: new Date('2026-09-21T08:00:00Z'),
    acknowledged: true,
  },
]

describe('Events', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    store.dispatch(setFilter({}))
    store.dispatch(fetchEvents.fulfilled({
      content: alarmFixtures,
      totalElements: alarmFixtures.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: 100,
    }, 'events-test', undefined))
  })

  afterEach(async () => {
    cleanup()
    store.dispatch(fetchEvents.fulfilled({
      content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 100,
    }, 'events-test-reset', undefined))
    await i18n.changeLanguage('en')
    vi.restoreAllMocks()
  })

  const renderEvents = () => render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}><Events /></I18nextProvider>
    </Provider>
  )

  it('shows localized alarm details and acknowledges without implying equipment control', async () => {
    renderEvents()

    expect(screen.getByRole('button', { name: 'Motion Detected' })).toBeInTheDocument()
    expect(screen.getByText('Unacknowledged Critical')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    fireEvent.click(screen.getByRole('button', { name: 'Motion Detected' }))
    expect(screen.getByText(/does not issue equipment-control commands/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge alarm' }))
    await waitFor(() => expect(screen.getAllByText('Acknowledged').length).toBeGreaterThan(0))
  })

  it('switches the alarm screen to Korean', async () => {
    renderEvents()
    expect(screen.getByRole('button', { name: 'Motion Detected' })).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('ko') })

    expect(await screen.findByRole('heading', { name: '알람' })).toBeInTheDocument()
    expect(screen.getAllByText('움직임 감지').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: '움직임 감지' }))
    expect(screen.getByText(/설비 제어 명령을 실행하거나 원인을 해소하지는 않습니다/)).toBeInTheDocument()
  })
})
