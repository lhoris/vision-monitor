import { describe, expect, it } from 'vitest'
import {
  CAMERA_LIVE_STREAM_ENDPOINT_TEMPLATE,
  buildCameraLiveStreamEndpoint,
  getCameraLiveStreamMock,
} from '../cameraLiveStreamMockAdapter'

const SEOUL_OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/

describe('camera live stream mock adapter', () => {
  it('returns a LiveStreamDto success envelope for an active camera stream', async () => {
    const response = await getCameraLiveStreamMock(1)

    expect(response.success).toBe(true)
    expect(response.error).toBeUndefined()
    expect(response.message).toBeUndefined()
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect(response.data).toMatchObject({
      cameraId: 1,
      streamUrl: 'http://220.81.187.50:1984/stream.html?src=video_high1',
      streamProtocol: 'stream_page',
      expiresAt: '2026-08-15T09:05:00+09:00',
      status: 'active',
      resolution: '1920x1080',
      fps: 30,
      metadata: {
        provider: 'external-vms',
        latencyClass: 'live',
      },
    })
  })

  it('keeps streamUrl opaque to contract tests', async () => {
    const response = await getCameraLiveStreamMock(2)

    expect(response.success).toBe(true)
    expect(response.data?.streamUrl).toEqual(expect.any(String))
    expect(response.data?.streamUrl.length).toBeGreaterThan(0)
    expect(response.data?.streamProtocol).toBe('stream_page')
  })

  it('returns stream page URLs for every live grid mock camera', async () => {
    const responses = await Promise.all([1, 2, 3, 4, 5, 6, 7].map((cameraId) => getCameraLiveStreamMock(cameraId)))

    expect(responses.every((response) => response.success)).toBe(true)
    expect(responses[6].data).toMatchObject({
      cameraId: 7,
      streamUrl: 'http://220.81.187.50:1984/stream.html?src=video_high7',
      streamProtocol: 'stream_page',
    })
  })

  it('returns an unavailable error envelope without data for a camera without live capability', async () => {
    const response = await getCameraLiveStreamMock(8)

    expect(response).toMatchObject({
      success: false,
      error: 'STREAM_UNAVAILABLE',
      message: 'Camera live stream is not available.',
    })
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('streamUrl')
  })

  it('returns a not found error envelope without data for an unknown camera', async () => {
    const response = await getCameraLiveStreamMock(9999)

    expect(response).toMatchObject({
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera live stream not found.',
    })
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('streamUrl')
    expect(JSON.stringify(response)).not.toContain('streamUrl')
  })

  it('returns a forbidden error envelope without stream URL or data', async () => {
    const response = await getCameraLiveStreamMock(403)

    expect(response).toMatchObject({
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera stream.',
    })
    expect(response.timestamp).toMatch(SEOUL_OFFSET_TIMESTAMP)
    expect('data' in response).toBe(false)
    expect(JSON.stringify(response)).not.toContain('streamUrl')
    expect(JSON.stringify(response)).not.toContain('streamUrl')
  })

  it('keeps the replaceable live-stream endpoint path in the adapter boundary', () => {
    expect(CAMERA_LIVE_STREAM_ENDPOINT_TEMPLATE).toBe('/api/cameras/{cameraId}/live-stream')
    expect(buildCameraLiveStreamEndpoint(12)).toBe('/api/cameras/12/live-stream')
  })

  it('rejects invalid camera ids without creating a live-stream path or data', async () => {
    const response = await getCameraLiveStreamMock(Number.NaN)

    expect(response).toMatchObject({
      success: false,
      error: 'INVALID_CAMERA_ID',
      message: 'Camera id must be a positive integer.',
    })
    expect('data' in response).toBe(false)
    expect(() => buildCameraLiveStreamEndpoint(-1)).toThrow('cameraId must be a positive integer.')
  })
})
