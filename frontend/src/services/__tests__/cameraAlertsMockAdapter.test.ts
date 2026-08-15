import { describe, expect, it } from 'vitest'
import {
  ACTIVE_CAMERA_ALERTS_ENDPOINT_TEMPLATE,
  buildActiveCameraAlertsEndpoint,
  getActiveCameraAlertsMock,
} from '../cameraAlertsMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/

describe('camera alerts mock adapter', () => {
  it('returns an empty active alert list for a camera without active alerts', async () => {
    const response = await getActiveCameraAlertsMock(2)

    expect(response.success).toBe(true)
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toEqual([])
  })

  it('returns active warning alerts with related event metadata', async () => {
    const response = await getActiveCameraAlertsMock(1)

    expect(response.success).toBe(true)
    expect(response.data?.[0]).toMatchObject({
      alertId: 90001,
      cameraId: 1,
      severity: 'warning',
      message: '[경고!] Entry Zone 치입불 발생 중',
      location: 'Entry Zone',
      startedAt: '2026-08-15T08:55:00+09:00',
      status: 'active',
      relatedEventId: 50001,
      metadata: expect.objectContaining({
        coolingCode: 'P06',
        holdTimeSeconds: 55,
      }),
    })
  })

  it('returns forbidden without data or alert metadata', async () => {
    const response = await getActiveCameraAlertsMock(403)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera alerts.',
    })
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('coolingCode')
  })

  it('keeps the replaceable active alerts endpoint path in the adapter boundary', () => {
    expect(ACTIVE_CAMERA_ALERTS_ENDPOINT_TEMPLATE).toBe('/api/cameras/{cameraId}/alerts/active')
    expect(buildActiveCameraAlertsEndpoint(12)).toBe('/api/cameras/12/alerts/active')
  })
})
