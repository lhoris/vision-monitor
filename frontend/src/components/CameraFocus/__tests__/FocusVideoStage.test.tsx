import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FocusVideoStage } from '../FocusVideoStage'
import type { CameraEventDto, CameraFocusDto, EventDetailDto, LiveStreamDto, PlaybackSessionDto } from '@/types/cameraFocus'

vi.mock('@/components/StreamPlayer/LiveStreamPlayer', () => ({
  LiveStreamPlayer: ({ camera }: { camera: { name: string; streamUrl: string } }) => (
    <div data-testid="focus-live-player">{camera.name}:{camera.streamUrl}</div>
  ),
}))

vi.mock('@/components/StreamPlayer/StreamPlayerComponent', () => ({
  StreamPlayerComponent: ({ source }: { source: { url: string; protocol: string; label?: string } }) => (
    <div data-testid="focus-playback-player">{source.protocol}:{source.url}:{source.label}</div>
  ),
}))

const camera: CameraFocusDto = {
  cameraId: 1,
  cameraName: 'Entry Zone CAM-01',
  processType: '냉각',
  zoneName: 'Entry Zone',
  lineName: 'Line 1',
  location: '제조 구역 A',
  status: 'online',
  recordingEnabled: true,
  capabilities: {
    live: true,
    recording: true,
    ptz: false,
    overlay: false,
  },
  lastSeenAt: '2026-08-15T08:59:30+09:00',
  recentEventSummary: {
    lastEventId: 50001,
    lastSeverity: 'warning',
    lastOccurredAt: '2026-08-15T08:55:00+09:00',
    openCount: 2,
  },
}

const liveStream: LiveStreamDto = {
  cameraId: 1,
  streamUrl: 'http://220.81.187.50:1984/stream.html?src=video_high1',
  streamProtocol: 'stream_page',
  expiresAt: '2026-08-15T09:05:00+09:00',
  status: 'active',
  resolution: '1920x1080',
  fps: 30,
  metadata: {
    provider: 'external-vms',
    latencyClass: 'live',
  },
}

const playbackSession: PlaybackSessionDto = {
  cameraId: 1,
  playbackUrl: 'https://media.example.local/playback/session/playback-cam-1-20260815-0800/index.m3u8',
  playbackProtocol: 'hls',
  sessionId: 'playback-cam-1-20260815-0800',
  expiresAt: '2026-08-15T09:15:00+09:00',
  availableFrom: '2026-08-15T08:00:00+09:00',
  availableTo: '2026-08-15T09:00:00+09:00',
  seekable: true,
  preRollSeconds: 10,
  timelineSegments: [],
}

const eventDetail: EventDetailDto = {
  eventId: 50001,
  cameraId: 1,
  eventType: 'entry_zone_jam',
  severity: 'warning',
  title: 'Entry Zone 치입불 발생',
  occurredAt: '2026-08-15T08:55:00+09:00',
  endedAt: null,
  status: 'active',
  playbackHint: {
    from: '2026-08-15T08:54:00+09:00',
    to: '2026-08-15T08:57:00+09:00',
    seekAt: '2026-08-15T08:54:50+09:00',
  },
  metadata: {},
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

describe('FocusVideoStage', () => {
  it('renders loading state while live stream is loading', () => {
    render(<FocusVideoStage mode="live" camera={camera} liveStream={null} liveLoading />)

    expect(screen.getByText('영상을 불러오는 중입니다.')).toBeInTheDocument()
  })

  it('passes opaque live stream URL to LiveStreamPlayer in live mode', () => {
    render(<FocusVideoStage mode="live" camera={camera} liveStream={liveStream} liveLoading={false} />)

    expect(screen.getByTestId('focus-live-player')).toHaveTextContent(
      'Entry Zone CAM-01:http://220.81.187.50:1984/stream.html?src=video_high1'
    )
  })

  it('does not mount live player in recording mode', () => {
    render(
      <FocusVideoStage
        mode="recording"
        camera={camera}
        liveStream={liveStream}
        liveLoading={false}
        selectedEventId={50001}
      />
    )

    expect(screen.queryByTestId('focus-live-player')).not.toBeInTheDocument()
    expect(screen.getByText('녹화 영상 영역')).toBeInTheDocument()
  })

  it('passes opaque playback URL to StreamPlayerComponent in recording mode', () => {
    render(
      <FocusVideoStage
        mode="recording"
        camera={camera}
        liveStream={liveStream}
        playbackSession={playbackSession}
        liveLoading={false}
      />
    )

    expect(screen.queryByTestId('focus-live-player')).not.toBeInTheDocument()
    expect(screen.getByTestId('focus-playback-player')).toHaveTextContent(
      'hls:https://media.example.local/playback/session/playback-cam-1-20260815-0800/index.m3u8'
    )
    expect(screen.getByTestId('focus-playback-player')).not.toHaveTextContent(
      'http://220.81.187.50:1984/stream.html?src=video_high1'
    )
  })

  it('uses playbackHint seekAt as the recording player seek target', () => {
    render(
      <FocusVideoStage
        mode="recording"
        camera={camera}
        playbackSession={playbackSession}
        events={events}
        selectedEventDetail={eventDetail}
        selectedEventId={50001}
      />
    )

    expect(screen.getByTestId('focus-playback-player')).toHaveTextContent('seek:2026-08-15T08:54:50+09:00')
  })

  it('keeps the event list visible when playback loading fails', () => {
    render(
      <FocusVideoStage
        mode="recording"
        camera={camera}
        playbackSession={null}
        playbackError="PLAYBACK_UNAVAILABLE"
        events={events}
      />
    )

    expect(screen.getByText('녹화 영상을 불러오지 못했습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entry Zone 치입불 발생 2026-08-15T08:55:00+09:00 warning' })).toBeInTheDocument()
  })

  it('keeps playback visible when event loading fails', () => {
    render(
      <FocusVideoStage
        mode="recording"
        camera={camera}
        playbackSession={playbackSession}
        events={[]}
        eventsError="EVENTS_UNAVAILABLE"
      />
    )

    expect(screen.getByTestId('focus-playback-player')).toBeInTheDocument()
    expect(screen.getByText('이벤트 목록을 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('renders live stream error state without metadata dependency', () => {
    render(
      <FocusVideoStage
        mode="live"
        camera={camera}
        liveStream={null}
        liveLoading={false}
        liveError="STREAM_UNAVAILABLE"
      />
    )

    expect(screen.getByText('실시간 영상을 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('renders live forbidden state distinctly', () => {
    render(
      <FocusVideoStage
        mode="live"
        camera={camera}
        liveStream={null}
        liveLoading={false}
        liveError="FORBIDDEN"
      />
    )

    expect(screen.getByText('이 카메라에 접근 권한이 없습니다.')).toBeInTheDocument()
  })
})
