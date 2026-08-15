import type { LiveStreamDto } from '@/types/cameraFocus'
import { buildCameraStreamPageUrl } from '@/streaming/config'

export const CAMERA_LIVE_STREAM_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_CAMERA_LIVE_STREAM_ID = 403

interface UnavailableLiveStreamFixture {
  cameraId: number
  status: 'inactive' | 'maintenance' | 'error'
}

type CameraLiveStreamFixture = LiveStreamDto | UnavailableLiveStreamFixture

export const cameraLiveStreamFixtures: Record<number, CameraLiveStreamFixture> = {
  1: {
    cameraId: 1,
    streamUrl: buildCameraStreamPageUrl(1),
    streamProtocol: 'stream_page',
    expiresAt: '2026-08-15T09:05:00+09:00',
    status: 'active',
    resolution: '1920x1080',
    fps: 30,
    metadata: {
      provider: 'external-vms',
      latencyClass: 'live',
    },
  },
  2: {
    cameraId: 2,
    streamUrl: buildCameraStreamPageUrl(2),
    streamProtocol: 'stream_page',
    expiresAt: '2026-08-15T09:05:00+09:00',
    status: 'active',
    resolution: '1280x720',
    fps: 24,
    metadata: {
      provider: 'external-vms',
      latencyClass: 'near-live',
    },
  },
  3: buildStreamPageFixture(3),
  4: buildStreamPageFixture(4),
  5: buildStreamPageFixture(5),
  6: buildStreamPageFixture(6),
  7: buildStreamPageFixture(7),
  8: {
    cameraId: 8,
    status: 'maintenance',
  },
}

export function findCameraLiveStreamFixture(cameraId: number): CameraLiveStreamFixture | undefined {
  const fixture = cameraLiveStreamFixtures[cameraId]
  return fixture ? structuredClone(fixture) : undefined
}

export function isLiveStreamDto(fixture: CameraLiveStreamFixture): fixture is LiveStreamDto {
  return 'streamUrl' in fixture
}

function buildStreamPageFixture(cameraId: number): LiveStreamDto {
  return {
    cameraId,
    streamUrl: buildCameraStreamPageUrl(cameraId),
    streamProtocol: 'stream_page',
    expiresAt: '2026-08-15T09:05:00+09:00',
    status: 'active',
    resolution: '1920x1080',
    fps: 30,
    metadata: {
      provider: 'go2rtc',
      latencyClass: 'live',
    },
  }
}
