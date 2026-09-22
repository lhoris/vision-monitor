import type { Event } from './api'

export type AlarmClipStatus = 'loading' | 'available' | 'partial' | 'unavailable' | 'error'

export interface AlarmOffsetConfig {
  beforeSeconds: number
  afterSeconds: number
  source: 'mock' | 'alarm-rule'
}

export interface AlarmRecordingClip {
  status: AlarmClipStatus
  requestedFrom: Date
  requestedTo: Date
  availableFrom?: Date
  availableTo?: Date
  playbackUrl?: string
  downloadUrl?: string
  message?: string
}

export interface AlarmHistoryItem extends Event {
  processCode: string
  processName: string
  modelName: string
  location: string
  judgment: 'OK' | 'NG'
}
