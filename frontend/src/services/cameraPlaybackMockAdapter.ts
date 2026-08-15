import type { ApiResponse } from '@/types/api'
import type { PlaybackSessionDto } from '@/types/cameraFocus'
import {
  CAMERA_PLAYBACK_MOCK_TIMESTAMP,
  FORBIDDEN_CAMERA_PLAYBACK_ID,
  type CameraPlaybackRange,
  findCameraPlaybackFixture,
} from '@/mocks/cameraPlayback'

export const CAMERA_PLAYBACK_ENDPOINT_TEMPLATE = '/api/cameras/{cameraId}/playback'

export function buildCameraPlaybackEndpoint(cameraId: number): string {
  if (!isValidCameraId(cameraId)) {
    throw new RangeError('cameraId must be a positive integer.')
  }
  return CAMERA_PLAYBACK_ENDPOINT_TEMPLATE.replace('{cameraId}', String(cameraId))
}

export async function getCameraPlaybackMock(
  cameraId: number,
  _range: CameraPlaybackRange
): Promise<ApiResponse<PlaybackSessionDto>> {
  if (!isValidCameraId(cameraId)) {
    return {
      success: false,
      error: 'INVALID_CAMERA_ID',
      message: 'Camera id must be a positive integer.',
      timestamp: CAMERA_PLAYBACK_MOCK_TIMESTAMP,
    }
  }

  if (cameraId === FORBIDDEN_CAMERA_PLAYBACK_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera playback.',
      timestamp: CAMERA_PLAYBACK_MOCK_TIMESTAMP,
    }
  }

  if (cameraId === 3) {
    return {
      success: false,
      error: 'PLAYBACK_UNAVAILABLE',
      message: 'Camera playback is not available for the requested range.',
      timestamp: CAMERA_PLAYBACK_MOCK_TIMESTAMP,
    }
  }

  const data = findCameraPlaybackFixture(cameraId)
  if (!data) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera playback not found.',
      timestamp: CAMERA_PLAYBACK_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data,
    timestamp: CAMERA_PLAYBACK_MOCK_TIMESTAMP,
  }
}

function isValidCameraId(cameraId: number): boolean {
  return Number.isSafeInteger(cameraId) && cameraId > 0
}
