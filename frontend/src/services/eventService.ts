/**
 * Event Service
 */

import { apiClient } from './api'
import { getActiveCameraAlertsMock } from './cameraAlertsMockAdapter'
import { getCameraEventsMock } from './cameraEventsMockAdapter'
import { acknowledgeEventMock, getEventDetailMock } from './eventDetailMockAdapter'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type {
  ActiveAlertDto,
  AcknowledgeEventDto,
  CameraEventListDto,
  EventDetailDto,
} from '@/types/cameraFocus'
import type { CameraEventsRange } from '@/mocks/cameraEvents'
import type { Event, AlertSetting, PaginatedResponse } from '@/types'

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
  async getEvents(params?: EventQueryParams): Promise<PaginatedResponse<Event> | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<PaginatedResponse<Event>>('/events', params || {}), null),
      null,
      'Failed to fetch events:'
    )
  }

  async getEventDetail(eventId: number): Promise<Event | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.get<Event>(`/events/${eventId}`), null),
      null,
      'Failed to fetch event detail:'
    )
  }

  async getCameraEvents(
    cameraId: number,
    params?: Omit<EventQueryParams, 'cameraId'>
  ): Promise<PaginatedResponse<Event> | null> {
    return withServiceFallback(
      async () =>
        getResponseData(
          await apiClient.get<PaginatedResponse<Event>>(`/cameras/${cameraId}/events`, params || {}),
          null
        ),
      null,
      'Failed to fetch camera events:'
    )
  }

  async getCameraFocusEvents(
    cameraId: number,
    range: CameraEventsRange
  ): Promise<ApiResponse<CameraEventListDto>> {
    return getCameraEventsMock(cameraId, range)
  }

  async getActiveCameraAlerts(cameraId: number): Promise<ApiResponse<ActiveAlertDto[]>> {
    return getActiveCameraAlertsMock(cameraId)
  }

  async getFocusEventDetail(eventId: number): Promise<ApiResponse<EventDetailDto>> {
    return getEventDetailMock(eventId)
  }

  async acknowledgeFocusEvent(eventId: number): Promise<ApiResponse<AcknowledgeEventDto>> {
    return acknowledgeEventMock(eventId)
  }

  async acknowledgeEvent(eventId: number): Promise<Event | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.put<Event>(`/events/${eventId}/acknowledge`, {}), null),
      null,
      'Failed to acknowledge event:'
    )
  }

  async acknowledgeEvents(eventIds: number[]): Promise<boolean> {
    return withServiceFallback(
      async () => {
        await apiClient.post('/events/acknowledge', { eventIds })
        return true
      },
      false,
      'Failed to acknowledge events:'
    )
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    return withServiceFallback(
      async () => {
        await apiClient.delete(`/events/${eventId}`)
        return true
      },
      false,
      'Failed to delete event:'
    )
  }

  async deleteEvents(eventIds: number[]): Promise<boolean> {
    return withServiceFallback(
      async () => {
        await apiClient.post('/events/delete', { eventIds })
        return true
      },
      false,
      'Failed to delete events:'
    )
  }

  async getAlertSettings(cameraId?: number): Promise<AlertSetting[]> {
    return withServiceFallback(
      async () => {
        const url = cameraId ? `/alerts/settings/${cameraId}` : '/alerts/settings'
        return getResponseData(await apiClient.get<AlertSetting[]>(url), [])
      },
      [],
      'Failed to fetch alert settings:'
    )
  }

  async createAlertSetting(setting: Omit<AlertSetting, 'id'>): Promise<AlertSetting | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.post<AlertSetting>('/alerts/settings', setting), null),
      null,
      'Failed to create alert setting:'
    )
  }

  async updateAlertSetting(id: number, setting: Partial<AlertSetting>): Promise<AlertSetting | null> {
    return withServiceFallback(
      async () => getResponseData(await apiClient.put<AlertSetting>(`/alerts/settings/${id}`, setting), null),
      null,
      'Failed to update alert setting:'
    )
  }

  async deleteAlertSetting(id: number): Promise<boolean> {
    return withServiceFallback(
      async () => {
        await apiClient.delete(`/alerts/settings/${id}`)
        return true
      },
      false,
      'Failed to delete alert setting:'
    )
  }
}

export const eventService = new EventService()
