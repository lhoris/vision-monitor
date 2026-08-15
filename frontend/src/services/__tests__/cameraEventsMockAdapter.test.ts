import { describe, expect, it } from 'vitest'
import {
  CAMERA_EVENTS_ENDPOINT_TEMPLATE,
  buildCameraEventsEndpoint,
  getCameraEventsMock,
} from '../cameraEventsMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/
const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('camera events mock adapter', () => {
  it('returns camera events with extensible metadata for a requested range', async () => {
    const response = await getCameraEventsMock(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toMatchObject({
      page: 0,
      size: 50,
      totalElements: 2,
    })
    expect(response.data?.content[0]).toMatchObject({
      eventId: 50001,
      cameraId: 1,
      eventType: 'entry_zone_jam',
      severity: 'warning',
      title: 'Entry Zone 치입불 발생',
      occurredAt: '2026-08-15T08:55:00+09:00',
      endedAt: null,
      status: 'active',
      metadata: expect.objectContaining({
        coolingCode: 'P06',
        holdTimeSeconds: 55,
      }),
    })
  })

  it('returns an empty successful event list when no events exist for the range', async () => {
    const response = await getCameraEventsMock(2, RANGE)

    expect(response.success).toBe(true)
    expect(response.data).toMatchObject({
      content: [],
      page: 0,
      size: 50,
      totalElements: 0,
    })
  })

  it('returns forbidden without data or event metadata', async () => {
    const response = await getCameraEventsMock(403, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera events.',
    })
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('coolingCode')
  })

  it('returns not found without data for an unknown camera', async () => {
    const response = await getCameraEventsMock(9999, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera events not found.',
    })
    expect('data' in response).toBe(false)
  })

  it('keeps the replaceable camera events endpoint path in the adapter boundary', () => {
    expect(CAMERA_EVENTS_ENDPOINT_TEMPLATE).toBe('/api/cameras/{cameraId}/events')
    expect(buildCameraEventsEndpoint(12)).toBe('/api/cameras/12/events')
  })
})
