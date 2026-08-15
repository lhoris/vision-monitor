import type { ApiResponse } from '@/types/api'
import type { CameraEventListDto } from '@/types/cameraFocus'
import {
  CAMERA_EVENTS_MOCK_TIMESTAMP,
  FORBIDDEN_CAMERA_EVENTS_ID,
  type CameraEventsRange,
  findCameraEventFixtures,
} from '@/mocks/cameraEvents'

export const CAMERA_EVENTS_ENDPOINT_TEMPLATE = '/api/cameras/{cameraId}/events'

export function buildCameraEventsEndpoint(cameraId: number): string {
  if (!isValidCameraId(cameraId)) {
    throw new RangeError('cameraId must be a positive integer.')
  }
  return CAMERA_EVENTS_ENDPOINT_TEMPLATE.replace('{cameraId}', String(cameraId))
}

export async function getCameraEventsMock(
  cameraId: number,
  _range: CameraEventsRange
): Promise<ApiResponse<CameraEventListDto>> {
  if (!isValidCameraId(cameraId)) {
    return {
      success: false,
      error: 'INVALID_CAMERA_ID',
      message: 'Camera id must be a positive integer.',
      timestamp: CAMERA_EVENTS_MOCK_TIMESTAMP,
    }
  }

  if (cameraId === FORBIDDEN_CAMERA_EVENTS_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera events.',
      timestamp: CAMERA_EVENTS_MOCK_TIMESTAMP,
    }
  }

  const events = findCameraEventFixtures(cameraId)
  if (!events) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera events not found.',
      timestamp: CAMERA_EVENTS_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data: {
      content: events,
      page: 0,
      size: 50,
      totalElements: events.length,
    },
    timestamp: CAMERA_EVENTS_MOCK_TIMESTAMP,
  }
}

function isValidCameraId(cameraId: number): boolean {
  return Number.isSafeInteger(cameraId) && cameraId > 0
}
