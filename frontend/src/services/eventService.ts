/**
 * Event Service
 */

import { apiClient } from './api'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type {
  ActiveAlertDto,
  AcknowledgeEventDto,
  CameraEventListDto,
  EventDetailDto,
} from '@/types/cameraFocus'
import type { CameraEventsRange } from '@/types/cameraFocus'
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
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', params || {})
      const data = getResponseData(response, null)
      if (!data) return null
      return {
        ...data,
        content: data.content.map((event) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        })),
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return null
    }
  }

  async getEventDetail(eventId: number): Promise<Event | null> {
    return withServiceFallback(
      async () => {
        const event = getResponseData(await apiClient.get<Event>(`/events/${eventId}`), null)
        return event ? normalizeEvent(event) : null
      },
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
        normalizeEventPage(getResponseData(
          await apiClient.get<PaginatedResponse<Event>>(`/cameras/${cameraId}/events`, params || {}),
          null
        )),
      null,
      'Failed to fetch camera events:'
    )
  }

  async getCameraFocusEvents(
    cameraId: number,
    range: CameraEventsRange
  ): Promise<ApiResponse<CameraEventListDto>> {
    const result = await this.getCameraEvents(cameraId, {
      startDate: range.from,
      endDate: range.to,
      severity: range.severity,
      status: range.status,
    })
    if (!result) {
      return {
        success: false,
        error: 'CAMERA_EVENTS_UNAVAILABLE',
        message: 'Camera event history is unavailable.',
        timestamp: new Date().toISOString(),
      }
    }
    return {
      success: true,
      data: {
        content: result.content.map(toCameraEventDto),
        page: result.currentPage,
        size: result.pageSize,
        totalElements: result.totalElements,
      },
      timestamp: new Date().toISOString(),
    }
  }

  async getActiveCameraAlerts(cameraId: number): Promise<ApiResponse<ActiveAlertDto[]>> {
    const result = await this.getCameraEvents(cameraId, { status: 'active' })
    if (!result) {
      return {
        success: false,
        error: 'CAMERA_ALERTS_UNAVAILABLE',
        message: 'Active camera alerts are unavailable.',
        timestamp: new Date().toISOString(),
      }
    }
    return {
      success: true,
      data: result.content
        .filter((event) => event.severity === 'high' || event.severity === 'critical')
        .filter((event) => !event.acknowledged)
        .map(toActiveAlertDto),
      timestamp: new Date().toISOString(),
    }
  }

  async getFocusEventDetail(eventId: number): Promise<ApiResponse<EventDetailDto>> {
    const event = await this.getEventDetail(eventId)
    if (!event) {
      return {
        success: false,
        error: 'EVENT_DETAIL_UNAVAILABLE',
        message: 'Event detail is unavailable.',
        timestamp: new Date().toISOString(),
      }
    }
    const occurredAt = event.timestamp.toISOString()
    return {
      success: true,
      data: {
        ...toCameraEventDto(event),
        playbackHint: {
          from: new Date(event.timestamp.getTime() - 10_000).toISOString(),
          to: new Date(event.timestamp.getTime() + 20_000).toISOString(),
          seekAt: occurredAt,
        },
      },
      timestamp: new Date().toISOString(),
    }
  }

  async acknowledgeFocusEvent(eventId: number): Promise<ApiResponse<AcknowledgeEventDto>> {
    const event = await this.acknowledgeEvent(eventId)
    if (!event) {
      return {
        success: false,
        error: 'EVENT_ACKNOWLEDGE_UNAVAILABLE',
        message: 'Event acknowledgement is unavailable.',
        timestamp: new Date().toISOString(),
      }
    }
    return {
      success: true,
      data: {
        eventId: event.id,
        status: 'acknowledged',
        acknowledgedBy: 0,
        acknowledgedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }
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

function toCameraEventDto(event: Event): CameraEventListDto['content'][number] {
  const occurredAt = event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp)
  return {
    eventId: event.id,
    cameraId: event.cameraId,
    eventType: event.type,
    severity: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'warning' : 'info',
    title: event.description,
    occurredAt: occurredAt.toISOString(),
    endedAt: null,
    status: event.acknowledged ? 'acknowledged' : 'active',
    metadata: event.metadata ?? {},
  }
}

function normalizeEvent(event: Event): Event {
  return {
    ...event,
    timestamp: event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp),
  }
}

function normalizeEventPage(page: PaginatedResponse<Event> | null): PaginatedResponse<Event> | null {
  if (!page) return null
  return {
    ...page,
    content: page.content.map(normalizeEvent),
  }
}

function toActiveAlertDto(event: Event): ActiveAlertDto {
  return {
    alertId: event.id,
    cameraId: event.cameraId,
    severity: event.severity === 'critical' ? 'critical' : 'warning',
    message: event.description,
    location: event.location ?? '',
    startedAt: event.timestamp.toISOString(),
    status: 'active',
    relatedEventId: event.id,
    metadata: event.metadata ?? {},
  }
}
