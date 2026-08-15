import { render, screen } from '@testing-library/react'
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
  it('renders severity, message, location, and status for active alerts', () => {
    render(<FocusAlertBanner alerts={[alert]} />)

    expect(screen.getByRole('status')).toHaveTextContent('warning')
    expect(screen.getByRole('status')).toHaveTextContent('[경고!] Entry Zone 치입불 발생 중')
    expect(screen.getByRole('status')).toHaveTextContent('Entry Zone')
    expect(screen.getByRole('status')).toHaveTextContent('active')
  })

  it('renders nothing when there are no active alerts', () => {
    const { container } = render(<FocusAlertBanner alerts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
