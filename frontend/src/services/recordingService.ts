import { apiClient } from './api'
import type { ApiResponse } from '@/types/api'
import type { CameraPlaybackRange, PlaybackSessionDto } from '@/types/cameraFocus'

class RecordingService {
  async getCameraPlayback(
    cameraId: number,
    range: CameraPlaybackRange
  ): Promise<ApiResponse<PlaybackSessionDto>> {
    if (!Number.isSafeInteger(cameraId) || cameraId <= 0) {
      return {
        success: false,
        error: 'INVALID_CAMERA_ID',
        message: 'Camera id must be a positive integer.',
        timestamp: new Date().toISOString(),
      }
    }

    try {
      return await apiClient.get<PlaybackSessionDto>(`/cameras/${cameraId}/playback`, {
        from: range.from,
        to: range.to,
        ...(range.eventId === undefined ? {} : { eventId: range.eventId }),
      })
    } catch (error) {
      console.error('Failed to fetch camera playback:', error)
      return {
        success: false,
        error: 'PLAYBACK_UNAVAILABLE',
        message: 'Camera playback is not available for the requested range.',
        timestamp: new Date().toISOString(),
      }
    }
  }
}

export const recordingService = new RecordingService()
