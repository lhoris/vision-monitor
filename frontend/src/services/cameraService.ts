/**
 * Camera Service
 * 카메라 관련 API 호출
 */

import { apiClient } from './api'
import type { Camera, CameraDetail } from '@/types/camera'
import type { ApiResponse } from '@/types'

class CameraService {
  /**
   * 모든 카메라 조회
   */
  async getAllCameras(): Promise<Camera[]> {
    try {
      const response = await apiClient.get<Camera[]>('/cameras')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch all cameras:', error)
      return []
    }
  }

  /**
   * 카메라 상세 정보 조회
   */
  async getCameraDetail(cameraId: number): Promise<CameraDetail | null> {
    try {
      const response = await apiClient.get<CameraDetail>(`/cameras/${cameraId}`)
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch camera detail for ${cameraId}:`, error)
      return null
    }
  }

  /**
   * 카메라 상태 조회
   */
  async getCameraStatus(cameraId: number): Promise<string> {
    try {
      const response = await apiClient.get<{ status: string }>(`/cameras/${cameraId}/status`)
      return response.data?.status || 'offline'
    } catch (error) {
      console.error(`Failed to fetch camera status for ${cameraId}:`, error)
      return 'offline'
    }
  }

  /**
   * 카메라 등록
   */
  async createCamera(camera: Omit<Camera, 'id'>): Promise<Camera | null> {
    try {
      const response = await apiClient.post<Camera>('/cameras', camera)
      return response.data || null
    } catch (error) {
      console.error('Failed to create camera:', error)
      return null
    }
  }

  /**
   * 카메라 업데이트
   */
  async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | null> {
    try {
      const response = await apiClient.put<Camera>(`/cameras/${id}`, camera)
      return response.data || null
    } catch (error) {
      console.error(`Failed to update camera ${id}:`, error)
      return null
    }
  }

  /**
   * 카메라 삭제
   */
  async deleteCamera(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/cameras/${id}`)
      return true
    } catch (error) {
      console.error(`Failed to delete camera ${id}:`, error)
      return false
    }
  }

  /**
   * 카메라 리스트 조회 (필터링 지원)
   */
  async getCamerasByZone(zone: string): Promise<Camera[]> {
    try {
      const response = await apiClient.get<Camera[]>('/cameras', { zone })
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch cameras by zone ${zone}:`, error)
      return []
    }
  }

  /**
   * 카메라 온라인 상태 체크
   */
  async checkCameraHealth(cameraId: number): Promise<{ online: boolean; latency?: number }> {
    try {
      const response = await apiClient.get<{ online: boolean; latency?: number }>(
        `/cameras/${cameraId}/health`
      )
      return response.data || { online: false }
    } catch (error) {
      console.error(`Failed to check camera health for ${cameraId}:`, error)
      return { online: false }
    }
  }
}

export const cameraService = new CameraService()
