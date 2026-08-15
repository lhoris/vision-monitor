import { cameraService } from './cameraService'
import { eventService } from './eventService'
import { recordingService } from './recordingService'
import type { ApiResponse } from '@/types/api'
import type {
  ActiveAlertDto,
  CameraEventListDto,
  CameraFocusDto,
  EventDetailDto,
  LiveStreamDto,
  PlaybackSessionDto,
} from '@/types/cameraFocus'
import type { CameraEventsRange } from '@/mocks/cameraEvents'
import type { CameraPlaybackRange } from '@/mocks/cameraPlayback'

class FocusApiService {
  async getCameraFocus(cameraId: number): Promise<ApiResponse<CameraFocusDto>> {
    return cameraService.getCameraFocus(cameraId)
  }

  async getCameraLiveStream(cameraId: number): Promise<ApiResponse<LiveStreamDto>> {
    return cameraService.getCameraLiveStream(cameraId)
  }

  async getCameraPlayback(
    cameraId: number,
    range: CameraPlaybackRange
  ): Promise<ApiResponse<PlaybackSessionDto>> {
    return recordingService.getCameraPlayback(cameraId, range)
  }

  async getCameraEvents(
    cameraId: number,
    range: CameraEventsRange
  ): Promise<ApiResponse<CameraEventListDto>> {
    return eventService.getCameraFocusEvents(cameraId, range)
  }

  async getActiveAlerts(cameraId: number): Promise<ApiResponse<ActiveAlertDto[]>> {
    return eventService.getActiveCameraAlerts(cameraId)
  }

  async getEventDetail(eventId: number): Promise<ApiResponse<EventDetailDto>> {
    return eventService.getFocusEventDetail(eventId)
  }
}

export const focusApiService = new FocusApiService()
