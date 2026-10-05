import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('@/services/api', () => ({
  apiClient: { get },
}))

import { recordingService } from '../recordingService'

const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('recordingService', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('loads camera playback data through the API contract', async () => {
    get.mockResolvedValue({
      success: true,
      data: {
        cameraId: 1,
        playbackUrl: 'https://media.test/playback/camera-1.m3u8',
        playbackProtocol: 'hls',
        sessionId: 'session-1',
        expiresAt: '2026-08-15T09:15:00+09:00',
        availableFrom: RANGE.from,
        availableTo: RANGE.to,
        seekable: true,
        preRollSeconds: 10,
        timelineSegments: [],
      },
      timestamp: '2026-08-15T09:00:00+09:00',
    })

    const response = await recordingService.getCameraPlayback(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.playbackUrl).toEqual(expect.any(String))
    expect(get).toHaveBeenCalledWith('/cameras/1/playback', {
      from: RANGE.from,
      to: RANGE.to,
    })
  })

  it('returns an unavailable envelope when the API cannot load playback', async () => {
    get.mockRejectedValue(new Error('network failure'))

    const response = await recordingService.getCameraPlayback(1, RANGE)

    expect(response).toMatchObject({
      success: false,
      error: 'PLAYBACK_UNAVAILABLE',
    })
  })
})
