import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecordingTimeline } from '../RecordingTimeline'
import type { CameraEventDto, PlaybackSessionDto } from '@/types/cameraFocus'

const playbackSession: PlaybackSessionDto = {
  cameraId: 1,
  playbackUrl: 'https://media.example.local/playback/session/index.m3u8',
  playbackProtocol: 'hls',
  sessionId: 'session-1',
  expiresAt: null,
  availableFrom: '2026-08-15T08:00:00+09:00',
  availableTo: '2026-08-15T09:00:00+09:00',
  seekable: true,
  preRollSeconds: 10,
  timelineSegments: [
    {
      from: '2026-08-15T08:00:00+09:00',
      to: '2026-08-15T08:30:00+09:00',
      status: 'available',
      seekable: true,
    },
    {
      from: '2026-08-15T08:30:00+09:00',
      to: '2026-08-15T08:35:00+09:00',
      status: 'gap',
      seekable: false,
    },
  ],
}

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

describe('RecordingTimeline', () => {
  it('renders available and gap timeline segments with seekability labels', () => {
    render(<RecordingTimeline playbackSession={playbackSession} events={events} />)

    expect(screen.getByLabelText('녹화 가능 구간 2026-08-15T08:00:00+09:00부터 2026-08-15T08:30:00+09:00까지')).toBeInTheDocument()
    expect(screen.getByLabelText('녹화 공백 구간 2026-08-15T08:30:00+09:00부터 2026-08-15T08:35:00+09:00까지, seek 불가')).toBeInTheDocument()
  })

  it('positions event markers by occurredAt and exposes accessible labels', () => {
    render(<RecordingTimeline playbackSession={playbackSession} events={events} />)

    const marker = screen.getByLabelText('이벤트 marker 2026-08-15T08:55:00+09:00 Entry Zone 치입불 발생')
    expect(marker).toBeInTheDocument()
    expect(marker).toHaveStyle({ left: '91.67%' })
  })

  it('renders an empty state when there are no segments or events', () => {
    render(<RecordingTimeline playbackSession={{ ...playbackSession, timelineSegments: [] }} events={[]} />)

    expect(screen.getByText('표시할 녹화 구간이 없습니다.')).toBeInTheDocument()
    expect(screen.getByText('표시할 이벤트가 없습니다.')).toBeInTheDocument()
  })
})
