import type { CameraFocusDto } from '@/types/cameraFocus'

export const CAMERA_FOCUS_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_CAMERA_FOCUS_ID = 403

export const cameraFocusFixtures: Record<number, CameraFocusDto> = {
  1: {
    cameraId: 1,
    cameraName: 'Entry Zone CAM-01',
    processType: 'Inspection',
    zoneName: 'Entry Zone',
    lineName: 'Line 1',
    location: 'Manufacturing Area A',
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
  },
  2: {
    cameraId: 2,
    cameraName: 'Assembly CAM-02',
    processType: 'Assembly',
    zoneName: 'Assembly Zone',
    lineName: 'Line 1',
    location: 'Manufacturing Area B',
    status: 'online',
    recordingEnabled: true,
    capabilities: {
      live: true,
      recording: true,
      ptz: true,
      overlay: false,
    },
    lastSeenAt: '2026-08-15T08:58:45+09:00',
    recentEventSummary: {
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: 0,
    },
  },
  3: {
    cameraId: 3,
    cameraName: 'Camera 3',
    processType: 'Production',
    zoneName: 'Zone 1',
    lineName: 'Line A',
    location: 'Line A-3',
    status: 'online',
    recordingEnabled: true,
    capabilities: {
      live: true,
      recording: true,
      ptz: false,
      overlay: false,
    },
    lastSeenAt: '2026-08-15T08:59:00+09:00',
    recentEventSummary: {
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: 0,
    },
  },
  4: buildGridCompatibleCameraFocus(4),
  5: buildGridCompatibleCameraFocus(5),
  6: buildGridCompatibleCameraFocus(6),
  7: buildGridCompatibleCameraFocus(7),
}

export function findCameraFocusFixture(cameraId: number): CameraFocusDto | undefined {
  const fixture = cameraFocusFixtures[cameraId]
  return fixture ? structuredClone(fixture) : undefined
}

function buildGridCompatibleCameraFocus(cameraId: number): CameraFocusDto {
  return {
    cameraId,
    cameraName: `Camera ${cameraId}`,
    processType: 'Production',
    zoneName: 'Zone 1',
    lineName: 'Line A',
    location: `Line A-${cameraId}`,
    status: 'online',
    recordingEnabled: true,
    capabilities: {
      live: true,
      recording: true,
      ptz: false,
      overlay: false,
    },
    lastSeenAt: '2026-08-15T08:59:00+09:00',
    recentEventSummary: {
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: 0,
    },
  }
}
