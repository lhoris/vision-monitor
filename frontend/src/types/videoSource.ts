export type VideoProtocol = 'WEBRTC' | 'RTSP' | 'HLS'
export type VideoSourceStatus = 'ACTIVE' | 'INACTIVE'

export interface VideoSource {
  id: number
  name: string
  url: string
  protocol: VideoProtocol
  location?: string
  zone?: string
  status: VideoSourceStatus
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export type VideoSourceInput = Omit<VideoSource, 'id' | 'createdAt' | 'updatedAt'>
