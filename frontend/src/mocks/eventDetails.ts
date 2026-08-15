import type { AcknowledgeEventDto, EventDetailDto } from '@/types/cameraFocus'

export const EVENT_DETAIL_MOCK_TIMESTAMP = '2026-08-15T09:00:00+09:00'
export const FORBIDDEN_EVENT_DETAIL_ID = 403

export const eventDetailFixtures: Record<number, EventDetailDto> = {
  50001: {
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
    metadata: {
      controlResponse: '자동 감속',
      materialId: 'M-20260815-001',
      coolingCode: 'P06',
      currentSpeed: '0.5m/s',
      detectedSpeed: '1.0m/s',
      holdTimeSeconds: 55,
    },
  },
}

export function findEventDetailFixture(eventId: number): EventDetailDto | undefined {
  const fixture = eventDetailFixtures[eventId]
  return fixture ? structuredClone(fixture) : undefined
}

export function buildAcknowledgeEventFixture(eventId: number): AcknowledgeEventDto {
  return {
    eventId,
    status: 'acknowledged',
    acknowledgedBy: 1,
    acknowledgedAt: '2026-08-15T09:02:00+09:00',
  }
}
