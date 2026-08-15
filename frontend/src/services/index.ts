/**
 * Services Export
 */

export { apiClient } from './api'
export { cameraService } from './cameraService'
export {
  CAMERA_FOCUS_ENDPOINT_TEMPLATE,
  buildCameraFocusEndpoint,
  getCameraFocusMock,
} from './cameraFocusMockAdapter'
export {
  CAMERA_LIVE_STREAM_ENDPOINT_TEMPLATE,
  buildCameraLiveStreamEndpoint,
  getCameraLiveStreamMock,
} from './cameraLiveStreamMockAdapter'
export {
  CAMERA_PLAYBACK_ENDPOINT_TEMPLATE,
  buildCameraPlaybackEndpoint,
  getCameraPlaybackMock,
} from './cameraPlaybackMockAdapter'
export {
  CAMERA_EVENTS_ENDPOINT_TEMPLATE,
  buildCameraEventsEndpoint,
  getCameraEventsMock,
} from './cameraEventsMockAdapter'
export {
  ACTIVE_CAMERA_ALERTS_ENDPOINT_TEMPLATE,
  buildActiveCameraAlertsEndpoint,
  getActiveCameraAlertsMock,
} from './cameraAlertsMockAdapter'
export {
  EVENT_ACKNOWLEDGE_ENDPOINT_TEMPLATE,
  EVENT_DETAIL_ENDPOINT_TEMPLATE,
  acknowledgeEventMock,
  buildEventAcknowledgeEndpoint,
  buildEventDetailEndpoint,
  getEventDetailMock,
} from './eventDetailMockAdapter'
export { eventService } from './eventService'
export { focusApiService } from './focusApiService'
export { layoutService } from './layoutService'
export { recordingService } from './recordingService'
