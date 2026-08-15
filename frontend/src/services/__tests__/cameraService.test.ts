import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Camera } from '@/types/camera'

vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const { apiClient } = await import('../api')
const { cameraService } = await import('../cameraService')

const mockedApiClient = vi.mocked(apiClient)

const camera: Camera = {
  id: 1,
  name: 'Camera 1',
  location: 'Line A-1',
  zone: 'Zone 1',
  streamUrl: 'http://example.com/stream.m3u8',
  streamProtocol: 'hls',
  status: 'online',
}

describe('cameraService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('returns cameras from getAllCameras', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: [camera],
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(cameraService.getAllCameras()).resolves.toEqual([camera])
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras')
  })

  it('returns empty camera list on failure', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Network failed'))

    await expect(cameraService.getAllCameras()).resolves.toEqual([])
  })

  it('returns offline status on missing status data', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(cameraService.getCameraStatus(1)).resolves.toBe('offline')
  })

  it('returns false when deleteCamera fails', async () => {
    mockedApiClient.delete.mockRejectedValue(new Error('Delete failed'))

    await expect(cameraService.deleteCamera(1)).resolves.toBe(false)
  })

  it('returns focus metadata from the mock adapter boundary', async () => {
    const response = await cameraService.getCameraFocus(1)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(mockedApiClient.get).not.toHaveBeenCalled()
  })

  it('returns live stream data from the mock adapter boundary', async () => {
    const response = await cameraService.getCameraLiveStream(1)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.streamUrl).toBe('http://220.81.187.50:1984/stream.html?src=video_high1')
    expect(mockedApiClient.get).not.toHaveBeenCalled()
  })
})
