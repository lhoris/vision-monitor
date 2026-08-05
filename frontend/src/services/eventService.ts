/**
 * Event Service
 * 이벤트/알림 관련 API 호출
 */

import { apiClient } from './api'
import type { Event, AlertSetting, PaginatedResponse } from '@/types'
import type { ApiResponse } from '@/types/api'

interface EventQueryParams {
  page?: number
  size?: number
  cameraId?: number
  severity?: string
  startDate?: string
  endDate?: string
  [key: string]: unknown
}

class EventService {
  /**
   * 이벤트 목록 조회 (페이지네이션)
   */
  async getEvents(params?: EventQueryParams): Promise<PaginatedResponse<Event> | null> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', params || {})
      return response.data || null
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return null
    }
  }

  /**
   * 특정 이벤트 조회
   */
  async getEventDetail(eventId: number): Promise<Event | null> {
    try {
      const response = await apiClient.get<Event>(`/events/${eventId}`)
      return response.data || null
    } catch (error) {
      console.error('Failed to fetch event detail:', error)
      return null
    }
  }

  /**
   * 카메라별 이벤트 조회
   */
  async getCameraEvents(
    cameraId: number,
    params?: Omit<EventQueryParams, 'cameraId'>
  ): Promise<PaginatedResponse<Event> | null> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>(`/cameras/${cameraId}/events`, params || {})
      return response.data || null
    } catch (error) {
      console.error('Failed to fetch camera events:', error)
      return null
    }
  }

  /**
   * 이벤트 확인 처리
   */
  async acknowledgeEvent(eventId: number): Promise<Event | null> {
    try {
      const response = await apiClient.put<Event>(`/events/${eventId}/acknowledge`, {})
      return response.data || null
    } catch (error) {
      console.error('Failed to acknowledge event:', error)
      return null
    }
  }

  /**
   * 여러 이벤트 확인 처리
   */
  async acknowledgeEvents(eventIds: number[]): Promise<boolean> {
    try {
      await apiClient.post(`/events/acknowledge`, { eventIds })
      return true
    } catch (error) {
      console.error('Failed to acknowledge events:', error)
      return false
    }
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/events/${eventId}`)
      return true
    } catch (error) {
      console.error('Failed to delete event:', error)
      return false
    }
  }

  /**
   * 여러 이벤트 삭제
   */
  async deleteEvents(eventIds: number[]): Promise<boolean> {
    try {
      await apiClient.post(`/events/delete`, { eventIds })
      return true
    } catch (error) {
      console.error('Failed to delete events:', error)
      return false
    }
  }

  /**
   * 알림 설정 조회
   */
  async getAlertSettings(cameraId?: number): Promise<AlertSetting[]> {
    try {
      const url = cameraId ? `/alerts/settings/${cameraId}` : '/alerts/settings'
      const response = await apiClient.get<AlertSetting[]>(url)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch alert settings:', error)
      return []
    }
  }

  /**
   * 알림 설정 생성
   */
  async createAlertSetting(setting: Omit<AlertSetting, 'id'>): Promise<AlertSetting | null> {
    try {
      const response = await apiClient.post<AlertSetting>('/alerts/settings', setting)
      return response.data || null
    } catch (error) {
      console.error('Failed to create alert setting:', error)
      return null
    }
  }

  /**
   * 알림 설정 업데이트
   */
  async updateAlertSetting(id: number, setting: Partial<AlertSetting>): Promise<AlertSetting | null> {
    try {
      const response = await apiClient.put<AlertSetting>(`/alerts/settings/${id}`, setting)
      return response.data || null
    } catch (error) {
      console.error('Failed to update alert setting:', error)
      return null
    }
  }

  /**
   * 알림 설정 삭제
   */
  async deleteAlertSetting(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/alerts/settings/${id}`)
      return true
    } catch (error) {
      console.error('Failed to delete alert setting:', error)
      return false
    }
  }
}

export const eventService = new EventService()
