export type VideoProtocol = 'WEBRTC' | 'HLS'
export type PlaybackProtocol = 'MP4' | 'HLS'
export type VideoSourceStatus = 'ACTIVE' | 'INACTIVE'

export interface VideoSource {
  id: number
  name: string
  url: string
  playbackBaseUrl?: string
  playbackProtocol?: PlaybackProtocol
  protocol: VideoProtocol
  location?: string
  zone?: string
  status: VideoSourceStatus
  remarks?: string
  modelProcessId?: number | null
  classCode?: string
  createdAt?: string
  updatedAt?: string
}

export type VideoSourceInput = Omit<VideoSource, 'id' | 'createdAt' | 'updatedAt'>
