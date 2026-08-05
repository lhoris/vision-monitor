/**
 * Camera Service
 * Phase 3에서 구현될 카메라 관련 API 호출
 */

import { apiClient } from './api'
import type { Camera, CameraDetail } from '@/types/camera'
import type { ApiResponse } from '@/types'

class CameraService {
  /**
   * 모든 카메라 조회
   * Phase 3에서 구현
   */
  async getAllCameras(): Promise<Camera[]> {
    // TODO: Phase 3에서 구현
    return []
  }

  /**
   * 카메라 상세 정보 조회
   * Phase 3에서 구현
   */
  async getCameraDetail(cameraId: number): Promise<CameraDetail | null> {
    // TODO: Phase 3에서 구현
    return null
  }

  /**
   * 카메라 상태 조회
   * Phase 3에서 구현
   */
  async getCameraStatus(cameraId: number): Promise<string> {
    // TODO: Phase 3에서 구현
    return 'offline'
  }

  /**
   * 카메라 등록
   * Phase 3에서 구현
   */
  async createCamera(camera: Omit<Camera, 'id'>): Promise<Camera | null> {
    // TODO: Phase 3에서 구현
    return null
  }

  /**
   * 카메라 업데이트
   * Phase 3에서 구현
   */
  async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera | null> {
    // TODO: Phase 3에서 구현
    return null
  }

  /**
   * 카메라 삭제
   * Phase 3에서 구현
   */
  async deleteCamera(id: number): Promise<boolean> {
    // TODO: Phase 3에서 구현
    return false
  }
}

export const cameraService = new CameraService()
