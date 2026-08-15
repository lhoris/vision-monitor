import type { ActiveAlertDto } from '@/types/cameraFocus'

export const CAMERA_ALERTS_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_CAMERA_ALERTS_ID = 403

export const cameraAlertFixtures: Record<number, ActiveAlertDto[]> = {
  1: [
    {
      alertId: 90001,
      cameraId: 1,
      severity: 'warning',
      message: '[경고!] Entry Zone 치입불 발생 중',
      location: 'Entry Zone',
      startedAt: '2026-08-15T08:55:00+09:00',
      status: 'active',
      relatedEventId: 50001,
      metadata: {
        controlResponse: '자동 감속',
        materialId: 'M-20260815-001',
        coolingCode: 'P06',
        currentSpeed: '0.5m/s',
        detectedSpeed: '1.0m/s',
        holdTimeSeconds: 55,
      },
    },
  ],
  2: [],
}

export function findCameraAlertFixtures(cameraId: number): ActiveAlertDto[] | undefined {
  const fixture = cameraAlertFixtures[cameraId]
  return fixture ? structuredClone(fixture) : undefined
}
