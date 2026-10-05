import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('@/services/api', () => ({
  apiClient: { get },
}))

import { focusApiService } from '../focusApiService'

const RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('focusApiService', () => {
  beforeEach(() => {
    get.mockImplementation((url: string) => {
      if (url === '/cameras/1/events') {
        return Promise.resolve({
          data: {
            content: [{ id: 50001, cameraId: 1, type: 'entry_zone_jam', severity: 'high', description: 'Entry zone event', timestamp: new Date('2026-08-15T08:55:00+09:00'), acknowledged: false, metadata: {} }],
            totalElements: 1,
            totalPages: 1,
            currentPage: 0,
            pageSize: 50,
          },
        })
      }
      return Promise.resolve({
        data: {
          id: 1,
          name: 'Entry Zone CAM-01',
          location: 'Line 1',
          zone: 'Entry Zone',
          streamUrl: 'https://media.test/camera-1.m3u8',
          streamProtocol: 'hls',
          status: 'online',
          recordingEnabled: true,
          lastSeen: '2026-10-05T00:00:00Z',
        },
      })
    })
  })

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
