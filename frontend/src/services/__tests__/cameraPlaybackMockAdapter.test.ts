import { describe, expect, it } from 'vitest'
import {
  CAMERA_PLAYBACK_ENDPOINT_TEMPLATE,
  buildCameraPlaybackEndpoint,
  getCameraPlaybackMock,
} from '../cameraPlaybackMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/
const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('camera playback mock adapter', () => {
  it('returns a PlaybackSessionDto success envelope for an available recording range', async () => {
    const response = await getCameraPlaybackMock(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toMatchObject({
      cameraId: 1,
      playbackUrl: expect.any(String),
      playbackProtocol: 'hls',
      sessionId: 'playback-cam-1-20260815-0800',
      expiresAt: '2026-08-15T09:15:00+09:00',
      availableFrom: RANGE.from,
      availableTo: RANGE.to,
      seekable: true,
      preRollSeconds: 10,
    })
    expect(response.data?.timelineSegments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'available', seekable: true }),
        expect.objectContaining({ status: 'gap', seekable: false }),
      ])
    )
  })

  it('keeps playbackUrl opaque to contract tests', async () => {
    const response = await getCameraPlaybackMock(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.playbackUrl).toEqual(expect.any(String))
    expect(response.data?.playbackUrl.length).toBeGreaterThan(0)
  })

  it('returns a no recording envelope without playback data for an unavailable range', async () => {
    const response = await getCameraPlaybackMock(3, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'PLAYBACK_UNAVAILABLE',
      message: 'Camera playback is not available for the requested range.',
    })
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('playbackUrl')
  })

  it('returns forbidden without data or playback URL', async () => {
    const response = await getCameraPlaybackMock(403, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera playback.',
    })
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('playbackUrl')
  })

  it('returns not found without data for an unknown camera', async () => {
    const response = await getCameraPlaybackMock(9999, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera playback not found.',
    })
    expect('data' in response).toBe(false)
  })

  it('keeps the replaceable playback endpoint path in the adapter boundary', () => {
    expect(CAMERA_PLAYBACK_ENDPOINT_TEMPLATE).toBe('/api/cameras/{cameraId}/playback')
    expect(buildCameraPlaybackEndpoint(12)).toBe('/api/cameras/12/playback')
  })
})
