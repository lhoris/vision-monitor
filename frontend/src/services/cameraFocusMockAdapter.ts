import type { ApiResponse } from '@/types/api'
import type { CameraFocusDto } from '@/types/cameraFocus'
import {
  CAMERA_FOCUS_MOCK_TIMESTAMP,
  FORBIDDEN_CAMERA_FOCUS_ID,
  findCameraFocusFixture,
} from '@/mocks/cameraFocus'

export const CAMERA_FOCUS_ENDPOINT_TEMPLATE = '/api/cameras/{cameraId}/focus'

export function buildCameraFocusEndpoint(cameraId: number): string {
  return CAMERA_FOCUS_ENDPOINT_TEMPLATE.replace('{cameraId}', String(cameraId))
}

export async function getCameraFocusMock(cameraId: number): Promise<ApiResponse<CameraFocusDto>> {
  if (cameraId === FORBIDDEN_CAMERA_FOCUS_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera.',
      timestamp: CAMERA_FOCUS_MOCK_TIMESTAMP,
    }
  }

  const data = findCameraFocusFixture(cameraId)

  if (!data) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera not found.',
      timestamp: CAMERA_FOCUS_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data,
    timestamp: CAMERA_FOCUS_MOCK_TIMESTAMP,
  }
}
