import { describe, expect, it } from 'vitest'
import { recordingService } from '../recordingService'

const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('recordingService', () => {
  it('returns camera playback data from the mock adapter boundary', async () => {
    const response = await recordingService.getCameraPlayback(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.playbackUrl).toEqual(expect.any(String))
  })
})
