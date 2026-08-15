import type { ApiResponse } from '@/types/api'
import type { ActiveAlertDto } from '@/types/cameraFocus'
import {
  CAMERA_ALERTS_MOCK_TIMESTAMP,
  FORBIDDEN_CAMERA_ALERTS_ID,
  findCameraAlertFixtures,
} from '@/mocks/cameraAlerts'

export const ACTIVE_CAMERA_ALERTS_ENDPOINT_TEMPLATE = '/api/cameras/{cameraId}/alerts/active'

export function buildActiveCameraAlertsEndpoint(cameraId: number): string {
  if (!isValidId(cameraId)) {
    throw new RangeError('cameraId must be a positive integer.')
  }
  return ACTIVE_CAMERA_ALERTS_ENDPOINT_TEMPLATE.replace('{cameraId}', String(cameraId))
}

export async function getActiveCameraAlertsMock(
  cameraId: number
): Promise<ApiResponse<ActiveAlertDto[]>> {
  if (!isValidId(cameraId)) {
    return {
      success: false,
      error: 'INVALID_CAMERA_ID',
      message: 'Camera id must be a positive integer.',
      timestamp: CAMERA_ALERTS_MOCK_TIMESTAMP,
    }
  }

  if (cameraId === FORBIDDEN_CAMERA_ALERTS_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera alerts.',
      timestamp: CAMERA_ALERTS_MOCK_TIMESTAMP,
    }
  }

  const data = findCameraAlertFixtures(cameraId)
  if (!data) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera alerts not found.',
      timestamp: CAMERA_ALERTS_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data,
    timestamp: CAMERA_ALERTS_MOCK_TIMESTAMP,
  }
}

function isValidId(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0
}
