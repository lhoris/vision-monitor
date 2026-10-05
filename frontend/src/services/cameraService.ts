/**
 * Camera Service
 */

import { apiClient } from './api'
import { getCameraFocusMock } from './cameraFocusMockAdapter'
import { getCameraLiveStreamMock } from './cameraLiveStreamMockAdapter'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type { Camera, CameraDetail } from '@/types/camera'
import type { CameraFocusDto, LiveStreamDto } from '@/types/cameraFocus'

const OFFLINE_STATUS = 'offline'
const OFFLINE_HEALTH = { online: false }

class CameraService {
  private readonly detailRequests = new Map<number, Promise<CameraDetail | null>>()

  async getAllCameras(): Promise<Camera[]> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<Camera[]>('/cameras'), []),
      [],
      'Failed to fetch all cameras:'
    )
  }

  async getCameraDetail(cameraId: number): Promise<CameraDetail | null> {
    const existingRequest = this.detailRequests.get(cameraId)
    if (existingRequest) return existingRequest

    const request = withServiceFallback(
      async () => getResponseData(await apiClient.get<CameraDetail>(`/cameras/${cameraId}`), null),
      null,
      `Failed to fetch camera detail for ${cameraId}:`
    )
    this.detailRequests.set(cameraId, request)
    request.finally(() => this.detailRequests.delete(cameraId)).catch(() => undefined)
    return request
  }

  async getCameraFocus(cameraId: number): Promise<ApiResponse<CameraFocusDto>> {
    const camera = await this.getCameraDetail(cameraId)
    if (camera) {
      return {
        success: true,
        data: toCameraFocus(camera),
        timestamp: new Date().toISOString(),
      }
    }
    return getCameraFocusMock(cameraId)
  }

  async getCameraLiveStream(cameraId: number): Promise<ApiResponse<LiveStreamDto>> {
    const camera = await this.getCameraDetail(cameraId)
    if (camera) {
      return {
        success: true,
        data: toLiveStream(camera),
        timestamp: new Date().toISOString(),
      }
    }
    return getCameraLiveStreamMock(cameraId)
  }

  async getCameraStatus(cameraId: number): Promise<string> {
    return withServiceFallback(
      async () =>
        getResponseData(
          await apiClient.get<{ status: string }>(`/cameras/${cameraId}/status`),
          { status: OFFLINE_STATUS }
        ).status,
      OFFLINE_STATUS,
      `Failed to fetch camera status for ${cameraId}:`
    )
  }

  async createCamera(camera: Omit<Camera, 'id'>): Promise<Camera | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.post<Camera>('/cameras', camera), null),
      null,
      'Failed to create camera:'
    )
  }

  async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.put<Camera>(`/cameras/${id}`, camera), null),
      null,
      `Failed to update camera ${id}:`
    )
  }

  async deleteCamera(id: number): Promise<boolean> {
    return withServiceFallback(
      async () => {
        await apiClient.delete(`/cameras/${id}`)
        return true
      },
      false,
      `Failed to delete camera ${id}:`
    )
  }

  async getCamerasByZone(zone: string): Promise<Camera[]> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<Camera[]>('/cameras', { zone }), []),
      [],
      `Failed to fetch cameras by zone ${zone}:`
    )
  }

  async checkCameraHealth(cameraId: number): Promise<{ online: boolean; latency?: number }> {
    return withServiceFallback(
      async () =>
        getResponseData(
          await apiClient.get<{ online: boolean; latency?: number }>(`/cameras/${cameraId}/health`),
          OFFLINE_HEALTH
        ),
      OFFLINE_HEALTH,
      `Failed to check camera health for ${cameraId}:`
    )
  }
}

function toCameraFocus(camera: CameraDetail): CameraFocusDto {
  const status: CameraFocusDto['status'] = camera.status === 'online'
    ? 'online'
    : camera.status === 'error'
      ? 'error'
      : 'offline'

  return {
    cameraId: camera.id,
    cameraName: camera.name,
    processType: 'unknown',
    zoneName: camera.zone,
    lineName: camera.location,
    location: camera.location,
    status,
    recordingEnabled: Boolean(camera.recordingEnabled),
    capabilities: {
      live: Boolean(camera.streamUrl),
      recording: Boolean(camera.recordingEnabled),
      ptz: false,
      overlay: false,
    },
    lastSeenAt: camera.lastSeen ? new Date(camera.lastSeen).toISOString() : null,
    recentEventSummary: {
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: camera.alerts ?? 0,
    },
  }
}

function toLiveStream(camera: CameraDetail): LiveStreamDto {
  const protocol: LiveStreamDto['streamProtocol'] = camera.streamProtocol === 'hls'
    ? 'hls'
    : camera.streamProtocol === 'webrtc'
      ? 'webrtc'
      : camera.streamProtocol === 'rtsp'
        ? 'rtsp_bridge'
        : 'unknown'
  const status: LiveStreamDto['status'] = camera.status === 'online'
    ? 'active'
    : camera.status === 'error'
      ? 'error'
      : 'inactive'

  return {
    cameraId: camera.id,
    streamUrl: camera.streamUrl,
    streamProtocol: protocol,
    expiresAt: null,
    status,
    resolution: camera.resolution ?? null,
    fps: camera.fps ?? null,
    metadata: {
      provider: 'video-source',
      latencyClass: status === 'active' ? 'live' : 'unknown',
    },
  }
}

export const cameraService = new CameraService()
