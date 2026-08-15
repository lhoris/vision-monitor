import { getCameraPlaybackMock } from './cameraPlaybackMockAdapter'
import type { ApiResponse } from '@/types/api'
import type { PlaybackSessionDto } from '@/types/cameraFocus'
import type { CameraPlaybackRange } from '@/mocks/cameraPlayback'

class RecordingService {
  async getCameraPlayback(
    cameraId: number,
    range: CameraPlaybackRange
  ): Promise<ApiResponse<PlaybackSessionDto>> {
    return getCameraPlaybackMock(cameraId, range)
  }
}

export const recordingService = new RecordingService()
