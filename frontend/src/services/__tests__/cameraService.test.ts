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

  it('normalizes API lastSeen strings to Date values', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: [{ ...camera, lastSeen: '2026-08-13T00:00:00.000Z' }],
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    const cameras = await cameraService.getAllCameras()

    expect(cameras[0]?.lastSeen).toBeInstanceOf(Date)
    expect(cameras[0]?.lastSeen?.toISOString()).toBe('2026-08-13T00:00:00.000Z')
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

  it('returns null when a camera mutation response has no data', async () => {
    const { id: _cameraId, ...cameraInput } = camera
    mockedApiClient.post.mockResolvedValue({ success: true, timestamp: '2026-08-13T00:00:00.000Z' })
    await expect(cameraService.createCamera(cameraInput)).resolves.toBeNull()

    mockedApiClient.put.mockResolvedValue({ success: true, timestamp: '2026-08-13T00:00:00.000Z' })
    await expect(cameraService.updateCamera(1, { name: 'Updated camera' })).resolves.toBeNull()
  })

  it('maps camera details from the API to the focus contract', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: { ...camera, recordingEnabled: true, alerts: 2 },
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    const response = await cameraService.getCameraFocus(1)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.cameraName).toBe('Camera 1')
    expect(response.data?.recordingEnabled).toBe(true)
    expect(response.data?.recentEventSummary.openCount).toBe(2)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1')
  })

  it('returns an unavailable response when the camera detail API is unavailable', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Network failed'))

    const response = await cameraService.getCameraFocus(1)

    expect(response.success).toBe(false)
    expect(response.error).toBe('CAMERA_UNAVAILABLE')
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1')
  })

  it('maps the camera detail API to the live stream contract', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: { ...camera, streamProtocol: 'webrtc', status: 'online' },
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    const response = await cameraService.getCameraLiveStream(1)

    expect(response.success).toBe(true)
    expect(response.data?.cameraId).toBe(1)
    expect(response.data?.streamUrl).toBe(camera.streamUrl)
    expect(response.data?.streamProtocol).toBe('webrtc')
    expect(response.data?.status).toBe('active')
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1')
  })

  it('shares an in-flight camera detail request across focus consumers', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    mockedApiClient.get.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    const focusRequest = cameraService.getCameraFocus(1)
    const streamRequest = cameraService.getCameraLiveStream(1)
    expect(mockedApiClient.get).toHaveBeenCalledTimes(1)

    resolveRequest?.({
      success: true,
      data: { ...camera, streamProtocol: 'webrtc', status: 'online' },
      timestamp: '2026-08-13T00:00:00.000Z',
    })
    await Promise.all([focusRequest, streamRequest])
  })

  it('returns an unavailable response when the camera detail API is unavailable', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Network failed'))

    const response = await cameraService.getCameraLiveStream(1)

    expect(response.success).toBe(false)
    expect(response.error).toBe('CAMERA_UNAVAILABLE')
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1')
  })
})
