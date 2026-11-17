import { beforeEach, describe, expect, it, vi } from 'vitest'

import { recordingService } from '../recordingService'

const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('recordingService', () => {
  it('builds the MVP MP4 playback URL with the requested range', async () => {
    const response = await recordingService.getCameraPlayback(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.playbackProtocol).toBe('mp4')
    expect(response.data?.playbackUrl).toContain('/playback/video6.mp4')
    expect(response.data?.playbackUrl).toContain('start=2026-08-15T08%3A00%3A00')
    expect(response.data?.playbackUrl).toContain('end=2026-08-15T09%3A00%3A00')
  })

  it('rejects an invalid playback range before building a URL', async () => {
    const response = await recordingService.getCameraPlayback(1, {
      from: '2026-08-15T09:00:00+09:00',
      to: '2026-08-15T08:00:00+09:00',
    })

    expect(response).toMatchObject({
      success: false,
      error: 'INVALID_RANGE',
    })
  })
})
