import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AlertSetting, Event, PaginatedResponse } from '@/types'

vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const { apiClient } = await import('../api')
const { eventService } = await import('../eventService')

const mockedApiClient = vi.mocked(apiClient)

const event: Event = {
  id: 1,
  cameraId: 1,
  type: 'motion',
  severity: 'medium',
  description: 'Motion detected',
  timestamp: new Date('2026-08-13T00:00:00.000Z'),
  acknowledged: false,
}

const page: PaginatedResponse<Event> = {
  content: [event],
  totalElements: 1,
  totalPages: 1,
  currentPage: 0,
  pageSize: 20,
}

const alertSetting: AlertSetting = {
  id: 1,
  cameraId: 1,
  eventType: 'motion',
  enabled: true,
  notificationMethod: 'in-app',
}

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('returns paginated events', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: page,
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(eventService.getEvents({ page: 0 })).resolves.toBe(page)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/events', { page: 0 })
  })

  it('returns null when event fetch fails', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Fetch failed'))

    await expect(eventService.getEvents()).resolves.toBeNull()
  })

  it('returns alert settings for camera endpoint', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: [alertSetting],
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(eventService.getAlertSettings(1)).resolves.toEqual([alertSetting])
    expect(mockedApiClient.get).toHaveBeenCalledWith('/alerts/settings/1')
  })

  it('returns false when bulk acknowledge fails', async () => {
    mockedApiClient.post.mockRejectedValue(new Error('Acknowledge failed'))

    await expect(eventService.acknowledgeEvents([1, 2])).resolves.toBe(false)
  })

  it('returns camera focus events from the mock adapter boundary', async () => {
    const response = await eventService.getCameraFocusEvents(1, {
      from: '2026-08-15T08:00:00+09:00',
      to: '2026-08-15T09:00:00+09:00',
    })

    expect(response.success).toBe(true)
    expect(response.data?.content[0]).toMatchObject({
      eventId: 50001,
      cameraId: 1,
      eventType: 'entry_zone_jam',
    })
    expect(mockedApiClient.get).not.toHaveBeenCalled()
  })

  it('returns active camera alerts from the mock adapter boundary', async () => {
    const response = await eventService.getActiveCameraAlerts(1)

    expect(response.success).toBe(true)
    expect(response.data?.[0]).toMatchObject({
      alertId: 90001,
      relatedEventId: 50001,
    })
    expect(mockedApiClient.get).not.toHaveBeenCalled()
  })

  it('returns focus event detail from the mock adapter boundary', async () => {
    const response = await eventService.getFocusEventDetail(50001)

    expect(response.success).toBe(true)
    expect(response.data?.playbackHint?.seekAt).toBe('2026-08-15T08:54:50+09:00')
    expect(mockedApiClient.get).not.toHaveBeenCalled()
  })

  it('acknowledges focus event with the POST mock contract boundary', async () => {
    const response = await eventService.acknowledgeFocusEvent(50001)

    expect(response.success).toBe(true)
    expect(response.data?.status).toBe('acknowledged')
    expect(mockedApiClient.put).not.toHaveBeenCalled()
  })
})
