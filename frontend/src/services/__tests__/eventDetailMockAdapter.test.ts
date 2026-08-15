import { describe, expect, it } from 'vitest'
import {
  EVENT_ACKNOWLEDGE_ENDPOINT_TEMPLATE,
  EVENT_DETAIL_ENDPOINT_TEMPLATE,
  buildEventAcknowledgeEndpoint,
  buildEventDetailEndpoint,
  acknowledgeEventMock,
  getEventDetailMock,
} from '../eventDetailMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/

describe('event detail mock adapter', () => {
  it('returns event detail with playback hint and metadata', async () => {
    const response = await getEventDetailMock(50001)

    expect(response.success).toBe(true)
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toMatchObject({
      eventId: 50001,
      cameraId: 1,
      eventType: 'entry_zone_jam',
      severity: 'warning',
      title: 'Entry Zone 치입불 발생',
      occurredAt: '2026-08-15T08:55:00+09:00',
      playbackHint: {
        from: '2026-08-15T08:54:00+09:00',
        to: '2026-08-15T08:57:00+09:00',
        seekAt: '2026-08-15T08:54:50+09:00',
      },
      metadata: expect.objectContaining({
        coolingCode: 'P06',
      }),
    })
  })

  it('returns acknowledge response using the POST contract boundary', async () => {
    const response = await acknowledgeEventMock(50001)

    expect(response).toMatchObject({
      success: true,
      data: {
        eventId: 50001,
        status: 'acknowledged',
        acknowledgedBy: 1,
        acknowledgedAt: '2026-08-15T09:02:00+09:00',
      },
    })
  })

  it('returns not found without data for an unknown event', async () => {
    const response = await getEventDetailMock(9999)

    expect(response).toMatchObject({
      success: false,
      error: 'NOT_FOUND',
      message: 'Event detail not found.',
    })
    expect('data' in response).toBe(false)
  })

  it('returns forbidden without metadata for a restricted event', async () => {
    const response = await getEventDetailMock(403)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this event.',
    })
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('coolingCode')
  })

  it('keeps event detail and acknowledge endpoint paths stable', () => {
    expect(EVENT_DETAIL_ENDPOINT_TEMPLATE).toBe('/api/events/{eventId}')
    expect(EVENT_ACKNOWLEDGE_ENDPOINT_TEMPLATE).toBe('/api/events/{eventId}/acknowledge')
    expect(buildEventDetailEndpoint(50001)).toBe('/api/events/50001')
    expect(buildEventAcknowledgeEndpoint(50001)).toBe('/api/events/50001/acknowledge')
  })
})
