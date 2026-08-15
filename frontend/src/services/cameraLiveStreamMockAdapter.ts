import type { ApiResponse } from '@/types/api'
import type { LiveStreamDto } from '@/types/cameraFocus'
import {
  CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
  FORBIDDEN_CAMERA_LIVE_STREAM_ID,
  findCameraLiveStreamFixture,
  isLiveStreamDto,
} from '@/mocks/cameraLiveStream'

export const CAMERA_LIVE_STREAM_ENDPOINT_TEMPLATE = '/api/cameras/{cameraId}/live-stream'

export function buildCameraLiveStreamEndpoint(cameraId: number): string {
  if (!isValidCameraId(cameraId)) {
    throw new RangeError('cameraId must be a positive integer.')
  }
  return CAMERA_LIVE_STREAM_ENDPOINT_TEMPLATE.replace('{cameraId}', String(cameraId))
}

export async function getCameraLiveStreamMock(cameraId: number): Promise<ApiResponse<LiveStreamDto>> {
  if (!isValidCameraId(cameraId)) {
    return {
      success: false,
      error: 'INVALID_CAMERA_ID',
      message: 'Camera id must be a positive integer.',
      timestamp: CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
    }
  }

  if (cameraId === FORBIDDEN_CAMERA_LIVE_STREAM_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this camera stream.',
      timestamp: CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
    }
  }

  const data = findCameraLiveStreamFixture(cameraId)

  if (!data) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Camera live stream not found.',
      timestamp: CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
    }
  }

  if (!isLiveStreamDto(data) || data.status !== 'active' || !data.streamUrl.trim()) {
    return {
      success: false,
      error: 'STREAM_UNAVAILABLE',
      message: 'Camera live stream is not available.',
      timestamp: CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data,
    timestamp: CAMERA_LIVE_STREAM_MOCK_TIMESTAMP,
  }
}

function isValidCameraId(cameraId: number): boolean {
  return Number.isSafeInteger(cameraId) && cameraId > 0
}
