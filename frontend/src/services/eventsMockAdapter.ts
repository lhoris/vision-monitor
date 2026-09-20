import type { Event, PaginatedResponse } from '@/types'

export const eventsMock: Event[] = [
  {
    id: 1,
    cameraId: 1,
    type: 'motion_detected',
    severity: 'low',
    description: 'Motion detected in area A',
    timestamp: new Date('2026-08-15T08:55:00+09:00'),
    acknowledged: false,
  },
  {
    id: 2,
    cameraId: 2,
    type: 'camera_offline',
    severity: 'high',
    description: 'Camera 2 went offline',
    timestamp: new Date('2026-08-15T08:45:00+09:00'),
    acknowledged: false,
  },
  {
    id: 3,
    cameraId: 3,
    type: 'tampering_detected',
    severity: 'critical',
    description: 'Tampering detected on camera lens',
    timestamp: new Date('2026-08-15T08:59:00+09:00'),
    acknowledged: false,
  },
]

export function getEventsMock(): PaginatedResponse<Event> {
  return {
    content: eventsMock.map((event) => ({ ...event })),
    totalElements: eventsMock.length,
    totalPages: 1,
    currentPage: 0,
    pageSize: eventsMock.length,
  }
}
