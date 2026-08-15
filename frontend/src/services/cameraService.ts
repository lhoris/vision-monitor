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
  async getAllCameras(): Promise<Camera[]> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<Camera[]>('/cameras'), []),
      [],
      'Failed to fetch all cameras:'
    )
  }

  async getCameraDetail(cameraId: number): Promise<CameraDetail | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<CameraDetail>(`/cameras/${cameraId}`), null),
      null,
      `Failed to fetch camera detail for ${cameraId}:`
    )
  }

  async getCameraFocus(cameraId: number): Promise<ApiResponse<CameraFocusDto>> {
    return getCameraFocusMock(cameraId)
  }

  async getCameraLiveStream(cameraId: number): Promise<ApiResponse<LiveStreamDto>> {
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

export const cameraService = new CameraService()
