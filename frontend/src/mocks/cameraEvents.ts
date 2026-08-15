import type { CameraEventDto } from '@/types/cameraFocus'

export const CAMERA_EVENTS_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_CAMERA_EVENTS_ID = 403

export interface CameraEventsRange {
  from: string
  to: string
  severity?: string
  status?: string
}

export const cameraEventFixtures: Record<number, CameraEventDto[]> = {
  1: [
    {
      eventId: 50001,
      cameraId: 1,
      eventType: 'entry_zone_jam',
      severity: 'warning',
      title: 'Entry Zone 치입불 발생',
      occurredAt: '2026-08-15T08:55:00+09:00',
      endedAt: null,
      status: 'active',
      metadata: {
        controlResponse: '자동 감속',
        materialId: 'M-20260815-001',
        coolingCode: 'P06',
        currentSpeed: '0.5m/s',
        detectedSpeed: '1.0m/s',
        holdTimeSeconds: 55,
      },
    },
    {
      eventId: 50002,
      cameraId: 1,
      eventType: 'material_size_detected',
      severity: 'info',
      title: '소재 규격 감지',
      occurredAt: '2026-08-15T08:42:00+09:00',
      endedAt: '2026-08-15T08:43:00+09:00',
      status: 'ended',
      metadata: {
        materialSpec: 'SAE9254S',
        sizeMm: 22,
      },
    },
  ],
  2: [],
}

export function findCameraEventFixtures(cameraId: number): CameraEventDto[] | undefined {
  const fixture = cameraEventFixtures[cameraId]
  return fixture ? structuredClone(fixture) : undefined
}
