export type CameraFocusStatus = 'online' | 'offline' | 'error' | 'maintenance' | 'forbidden'

export type EventSeverity = 'info' | 'warning' | 'critical'

export interface CameraCapabilitiesDto {
  live: boolean
  recording: boolean
  ptz: boolean
  overlay: boolean
}

export interface RecentEventSummaryDto {
  lastEventId: number | null
  lastSeverity: EventSeverity | null
  lastOccurredAt: string | null
  openCount: number
}

export interface CameraFocusDto {
  cameraId: number
  cameraName: string
  processType: string
  zoneName: string
  lineName: string
  location: string
  status: CameraFocusStatus
  recordingEnabled: boolean
  capabilities: CameraCapabilitiesDto
  lastSeenAt: string | null
  recentEventSummary: RecentEventSummaryDto
}

export type LiveStreamProtocol = 'stream_page' | 'hls' | 'webrtc' | 'rtsp_bridge' | 'unknown'

export type LiveStreamStatus = 'active' | 'inactive' | 'maintenance' | 'error'

export interface LiveStreamMetadataDto {
  provider: string
  latencyClass: 'live' | 'near-live' | 'unknown'
  [key: string]: unknown
}

export interface LiveStreamDto {
  cameraId: number
  streamUrl: string
  streamProtocol: LiveStreamProtocol
  expiresAt: string | null
  status: LiveStreamStatus
  resolution: string | null
  fps: number | null
  metadata: LiveStreamMetadataDto
}

export type PlaybackProtocol = 'hls' | 'stream_page' | 'webrtc' | 'unknown'

export type TimelineSegmentStatus = 'available' | 'gap'

export interface TimelineSegmentDto {
  from: string
  to: string
  status: TimelineSegmentStatus
  seekable: boolean
}

export interface PlaybackSessionDto {
  cameraId: number
  playbackUrl: string
  playbackProtocol: PlaybackProtocol
  sessionId: string
  expiresAt: string | null
  availableFrom: string
  availableTo: string
  seekable: boolean
  preRollSeconds: number
  timelineSegments: TimelineSegmentDto[]
}

export type CameraEventSeverity = 'info' | 'warning' | 'critical'

export type CameraEventStatus = 'active' | 'ended' | 'acknowledged'

export interface CameraEventDto {
  eventId: number
  cameraId: number
  eventType: string
  severity: CameraEventSeverity
  title: string
  occurredAt: string
  endedAt: string | null
  status: CameraEventStatus
  metadata: Record<string, unknown>
}

export interface CameraEventListDto {
  content: CameraEventDto[]
  page: number
  size: number
  totalElements: number
}

export type ActiveAlertSeverity = 'warning' | 'critical'

export type ActiveAlertStatus = 'active'

export interface ActiveAlertDto {
  alertId: number
  cameraId: number
  severity: ActiveAlertSeverity
  message: string
  location: string
  startedAt: string
  status: ActiveAlertStatus
  relatedEventId: number | null
  metadata: Record<string, unknown>
}

export interface EventPlaybackHintDto {
  from: string
  to: string
  seekAt: string
}

export interface EventDetailDto extends CameraEventDto {
  playbackHint: EventPlaybackHintDto | null
}

export interface AcknowledgeEventDto {
  eventId: number
  status: 'acknowledged'
  acknowledgedBy: number
  acknowledgedAt: string
}
