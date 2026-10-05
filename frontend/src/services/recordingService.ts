import { getCameraPlaybackMock } from './cameraPlaybackMockAdapter'
import type { ApiResponse } from '@/types/api'
import type { CameraPlaybackRange, PlaybackSessionDto } from '@/types/cameraFocus'

class RecordingService {
  async getCameraPlayback(
    cameraId: number,
    range: CameraPlaybackRange
  ): Promise<ApiResponse<PlaybackSessionDto>> {
    return getCameraPlaybackMock(cameraId, range)
  }
}

export const recordingService = new RecordingService()
