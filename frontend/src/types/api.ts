/**
 * API Response Type Definitions
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface Event {
  id: number
  cameraId: number
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: Date
  acknowledged: boolean
  metadata?: Record<string, unknown>
  processCode?: string
  processName?: string
  modelName?: string
  location?: string
  judgment?: 'OK' | 'NG'
  acknowledgementByUser?: Record<string, {
    acknowledged: boolean
    acknowledgedAt?: Date
  }>
}

export interface AlertSetting {
  id: number
  cameraId: number
  eventType: string
  enabled: boolean
  notificationMethod: 'email' | 'sms' | 'in-app'
  threshold?: number
}

export interface Recording {
  id: number
  cameraId: number
  startTime: Date
  endTime: Date
  duration: number
  fileSize: number
  status: 'recording' | 'completed' | 'archived'
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
