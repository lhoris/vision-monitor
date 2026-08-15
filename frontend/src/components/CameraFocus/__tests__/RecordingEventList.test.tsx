import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecordingEventList } from '../RecordingEventList'
import type { CameraEventDto } from '@/types/cameraFocus'

const events: CameraEventDto[] = [
  {
    eventId: 50001,
    cameraId: 1,
    eventType: 'entry_zone_jam',
    severity: 'warning',
    title: 'Entry Zone 치입불 발생',
    occurredAt: '2026-08-15T08:55:00+09:00',
    endedAt: null,
    status: 'active',
    metadata: {},
  },
]

describe('RecordingEventList', () => {
  it('selects an event by click and keyboard', () => {
    const onSelect = vi.fn()
    render(<RecordingEventList events={events} selectedEventId={null} onSelectEvent={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Entry Zone 치입불 발생 2026-08-15T08:55:00+09:00 warning' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Entry Zone 치입불 발생 2026-08-15T08:55:00+09:00 warning' }), {
      key: 'Enter',
    })

    expect(onSelect).toHaveBeenCalledWith(50001)
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('marks the selected event row', () => {
    render(<RecordingEventList events={events} selectedEventId={50001} onSelectEvent={() => undefined} />)

    expect(screen.getByRole('button', { name: 'Entry Zone 치입불 발생 2026-08-15T08:55:00+09:00 warning' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
