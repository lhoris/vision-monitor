import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
    { from: '2026-08-15T08:00:00+09:00', to: '2026-08-15T08:30:00+09:00', status: 'available', seekable: true },
    { from: '2026-08-15T08:30:00+09:00', to: '2026-08-15T08:35:00+09:00', status: 'gap', seekable: false },
  ],
}

const events: CameraEventDto[] = [{
  eventId: 50001,
  cameraId: 1,
  eventType: 'entry_zone_jam',
  severity: 'warning',
  title: 'Entry Zone 치입불 발생',
  occurredAt: '2026-08-15T08:55:00+09:00',
  endedAt: null,
  status: 'active',
  metadata: {},
}]

const renderTimeline = (props: Partial<React.ComponentProps<typeof RecordingTimeline>> = {}) => render(
  <RecordingTimeline playbackSession={playbackSession} events={events} dayStart="2026-08-15T00:00:00" workArea={{ from: 28800, to: 32400 }} {...props} />
)

describe('RecordingTimeline', () => {
  it('renders available and gap timeline segments in overview and detail tracks', () => {
    renderTimeline()

    expect(screen.getAllByLabelText('녹화 가능 구간 2026-08-15T08:00:00+09:00부터 2026-08-15T08:30:00+09:00까지')).toHaveLength(2)
    expect(screen.getAllByLabelText('녹화 공백 구간 2026-08-15T08:30:00+09:00부터 2026-08-15T08:35:00+09:00까지, seek 불가')).toHaveLength(2)
  })

  it('positions event markers by occurredAt and exposes accessible labels', () => {
    renderTimeline()

    const markers = screen.getAllByLabelText('알람 marker 2026-08-15T08:55:00+09:00 Entry Zone 치입불 발생')
    expect(markers).toHaveLength(2)
    expect(markers[0]).toHaveStyle({ left: '37.15277777777778%' })
  })

  it('renders an empty state when there are no segments or events', () => {
    renderTimeline({ playbackSession: { ...playbackSession, timelineSegments: [] }, events: [] })

    expect(screen.getByText('현재 확대 구간에 녹화가 없습니다.')).toBeInTheDocument()
    expect(screen.getByText('표시할 알람이 없습니다.')).toBeInTheDocument()
  })

  it('seeks by mouse click and keyboard arrows on the detail timeline', () => {
    const onSeek = vi.fn()
    renderTimeline({ events: [], onSeek, onWorkAreaChange: () => undefined })

    const timeline = screen.getByRole('slider', { name: '녹화 재생 위치' })
    vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 100, top: 0, bottom: 56, width: 100, height: 56, x: 0, y: 0, toJSON: () => ({}) })

    fireEvent.click(timeline, { clientX: 50 })
    fireEvent.keyDown(timeline, { key: 'ArrowRight' })

    expect(onSeek).toHaveBeenNthCalledWith(1, '2026-08-15T12:00:00')
    expect(onSeek).toHaveBeenNthCalledWith(2, '2026-08-15T08:00:01')
  })

  it('selects an alarm marker and seeks to its occurrence time', () => {
    const onSelectEvent = vi.fn()
    const onSeek = vi.fn()
    renderTimeline({ onSelectEvent, onSeek })

    fireEvent.click(screen.getAllByRole('button', { name: /알람 marker 2026-08-15T08:55:00\+09:00/ })[0])

    expect(onSelectEvent).toHaveBeenCalledWith(50001)
    expect(onSeek).toHaveBeenCalledWith(events[0].occurredAt)
  })

  it('zooms the detail timeline while keeping the full-day overview', () => {
    renderTimeline({ events: [] })

    const timeline = screen.getByRole('slider', { name: '녹화 재생 위치' })
    expect(timeline).toHaveAttribute('aria-valuemin', '0')
    expect(timeline).toHaveAttribute('aria-valuemax', '86400')

    fireEvent.click(screen.getByRole('button', { name: '타임라인 확대' }))

    expect(screen.getByRole('button', { name: '전체 보기' })).toHaveTextContent('2x')
    expect(timeline).toHaveAttribute('aria-valuemin', '9000')
    expect(timeline).toHaveAttribute('aria-valuemax', '52200')
    expect(screen.getByRole('img', { name: '24시간 녹화 개요' })).toBeInTheDocument()
  })

  it('handles Ctrl+wheel inside the timeline without delegating zoom to the browser', () => {
    renderTimeline({ events: [] })
    const timeline = screen.getByRole('slider', { name: '녹화 재생 위치' })
    const preventDefault = vi.spyOn(Event.prototype, 'preventDefault')
    const stopPropagation = vi.spyOn(Event.prototype, 'stopPropagation')

    fireEvent.wheel(timeline, { ctrlKey: true, deltaY: -1 })

    expect(screen.getByRole('button', { name: '전체 보기' })).toHaveTextContent('2x')
    expect(preventDefault).toHaveBeenCalled()
    expect(stopPropagation).toHaveBeenCalled()
    preventDefault.mockRestore()
    stopPropagation.mockRestore()
  })

  it('changes the work area duration with a preset while preserving the center', () => {
    const onWorkAreaChange = vi.fn()
    renderTimeline({ onWorkAreaChange })

    fireEvent.click(screen.getByRole('button', { name: '1분' }))

    expect(onWorkAreaChange).toHaveBeenCalledWith({ from: 30570, to: 30630 })
  })

  it('opens precise time inputs from the work area context menu', () => {
    const onWorkAreaChange = vi.fn()
    renderTimeline({ onWorkAreaChange })

    fireEvent.contextMenu(screen.getByTitle('선택 구간을 드래그하여 이동 · 우클릭하여 정밀 조정'))
    expect(screen.getByRole('dialog', { name: '작업 구간 정밀 조정' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('시작 시각'), { target: { value: '08:15:00' } })
    fireEvent.change(screen.getByLabelText('종료 시각'), { target: { value: '08:17:30' } })
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(onWorkAreaChange).toHaveBeenCalledWith({ from: 29700, to: 29850 })
  })
})
