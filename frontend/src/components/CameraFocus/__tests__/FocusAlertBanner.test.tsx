import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FocusAlertBanner } from '../FocusAlertBanner'
import type { ActiveAlertDto } from '@/types/cameraFocus'

const alert: ActiveAlertDto = {
  alertId: 90001,
  cameraId: 1,
  severity: 'warning',
  message: '[경고!] Entry Zone 치입불 발생 중',
  location: 'Entry Zone',
  startedAt: '2026-08-15T08:55:00+09:00',
  status: 'active',
  relatedEventId: 50001,
  metadata: {},
}

describe('FocusAlertBanner', () => {
  it('renders an urgent themed alert toast until the user clicks it', async () => {
    render(<FocusAlertBanner alerts={[alert]} />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('긴급 경고')
    expect(toast).toHaveTextContent('[경고!] Entry Zone 치입불 발생 중')
    expect(toast).toHaveTextContent('Entry Zone')
    expect(toast).toHaveTextContent('warning')
    expect(toast).toHaveTextContent('active')

    fireEvent.click(toast)

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('renders nothing when there are no active alerts', () => {
    const { container } = render(<FocusAlertBanner alerts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
