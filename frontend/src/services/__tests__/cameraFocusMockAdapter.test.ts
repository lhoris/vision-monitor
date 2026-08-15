import { describe, expect, it } from 'vitest'
import {
  CAMERA_FOCUS_ENDPOINT_TEMPLATE,
  buildCameraFocusEndpoint,
  getCameraFocusMock,
} from '../cameraFocusMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/

describe('camera focus mock adapter', () => {
  it('returns a CameraFocusDto success envelope for a valid camera with a recent event', async () => {
    const response = await getCameraFocusMock(1)

    expect(response.success).toBe(true)
    expect(response.error).toBeUndefined()
    expect(response.message).toBeUndefined()
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toMatchObject({
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
      recentEventSummary: {
        lastEventId: 50001,
        lastSeverity: 'warning',
        lastOccurredAt: '2026-08-15T08:55:00+09:00',
        openCount: 2,
      },
    })
    expect(response.data?.lastSeenAt).toBe('2026-08-15T08:59:30+09:00')
  })

  it('returns null and zero recent event fields when no recent event exists', async () => {
    const response = await getCameraFocusMock(2)

    expect(response.success).toBe(true)
    expect(response.data?.recentEventSummary).toEqual({
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: 0,
    })
  })

  it('returns focus metadata for every live grid mock camera', async () => {
    const responses = await Promise.all([1, 2, 3, 4, 5, 6, 7].map((cameraId) => getCameraFocusMock(cameraId)))

    expect(responses.every((response) => response.success)).toBe(true)
    expect(responses[6].data).toMatchObject({
      cameraId: 7,
      cameraName: 'Camera 7',
      status: 'online',
    })
  })

  it('returns a not found error envelope without data for an unknown camera', async () => {
    const response = await getCameraFocusMock(9999)

    expect(response).toMatchObject({
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera not found.',
    })
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect('data' in response).toBe(false)
  })

  it('returns a forbidden error envelope without protected metadata or data', async () => {
    const response = await getCameraFocusMock(403)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera.',
    })
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('Restricted')
  })

  it('keeps the replaceable focus endpoint path in the adapter boundary', () => {
    expect(CAMERA_FOCUS_ENDPOINT_TEMPLATE).toBe('/api/cameras/{cameraId}/focus')
    expect(buildCameraFocusEndpoint(12)).toBe('/api/cameras/12/focus')
  })
})
