import type { PlaybackSessionDto } from '@/types/cameraFocus'

export const CAMERA_PLAYBACK_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_CAMERA_PLAYBACK_ID = 403

export interface CameraPlaybackRange {
  from: string
  to: string
  eventId?: number
}

export const cameraPlaybackFixtures: Record<number, PlaybackSessionDto> = {
  1: {
    cameraId: 1,
    playbackUrl: 'https://media.example.local/playback/session/playback-cam-1-20260815-0800/index.m3u8',
    playbackProtocol: 'hls',
    sessionId: 'playback-cam-1-20260815-0800',
    expiresAt: '2026-08-15T09:15:00+09:00',
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
      {
        from: '2026-08-15T08:35:00+09:00',
        to: '2026-08-15T09:00:00+09:00',
        status: 'available',
        seekable: true,
      },
    ],
  },
}

export function findCameraPlaybackFixture(cameraId: number): PlaybackSessionDto | undefined {
  const fixture = cameraPlaybackFixtures[cameraId]
  return fixture ? structuredClone(fixture) : undefined
}
