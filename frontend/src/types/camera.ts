/**
 * Camera Type Definitions
 * Phase 3에서 구현될 카메라 관련 타입
 */

export interface Camera {
  id: number
  name: string
  location: string
  zone: string
  streamUrl: string
  status: 'online' | 'offline' | 'error'
  lastSeen?: Date
  resolution?: string
  fps?: number
}

export interface Stream {
  id: number
  cameraId: number
  url: string
  type: 'rtsp' | 'http' | 'ws'
  status: 'active' | 'inactive' | 'error'
  bandwidth?: number
}

export interface CameraDetail extends Camera {
  stream?: Stream
  alerts?: number
  recordingEnabled: boolean
}
