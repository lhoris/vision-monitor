import { describe, expect, it } from 'vitest'
import { focusApiService } from '../focusApiService'

const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('focusApiService', () => {
  it('exposes camera focus metadata through the focus facade', async () => {
    const response = await focusApiService.getCameraFocus(1)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
  })

  it('exposes live stream through the focus facade', async () => {
    const response = await focusApiService.getCameraLiveStream(1)

    expect(response.success).toBe(true)
    expect(response.data?.streamUrl).toEqual(expect.any(String))
  })

  it('exposes playback through the focus facade', async () => {
    const response = await focusApiService.getCameraPlayback(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.timelineSegments).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'gap' })])
    )
  })

  it('exposes camera events through the focus facade', async () => {
    const response = await focusApiService.getCameraEvents(1, RANGE)

    expect(response.success).toBe(true)
    expect(response.data?.content[0]?.eventId).toBe(50001)
  })

  it('exposes active alerts through the focus facade', async () => {
    const response = await focusApiService.getActiveAlerts(1)

    expect(response.success).toBe(true)
    expect(response.data?.[0]?.relatedEventId).toBe(50001)
  })

  it('exposes event detail through the focus facade', async () => {
    const response = await focusApiService.getEventDetail(50001)

    expect(response.success).toBe(true)
    expect(response.data?.playbackHint?.seekAt).toBe('2026-08-15T08:54:50+09:00')
  })
})
