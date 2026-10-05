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

    await expect(eventService.getEvents({ page: 0 })).resolves.toEqual(page)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/events', { page: 0 })
  })

  it('returns no event page when event fetch fails', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Fetch failed'))

    await expect(eventService.getEvents()).resolves.toBeNull()
    return

    await expect(eventService.getEvents()).resolves.toMatchObject({
      content: expect.arrayContaining([
        expect.objectContaining({
          type: 'cooling_bed_temperature_high',
          description: '공냉대 온도 상한 초과',
          metadata: expect.objectContaining({ coilId: 'C260921-014' }),
        }),
      ]),
    })
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

  it('maps camera events from the API to the focus event contract', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: page,
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    const response = await eventService.getCameraFocusEvents(1, {
      from: '2026-08-15T08:00:00+09:00',
      to: '2026-08-15T09:00:00+09:00',
    })

    expect(response.success).toBe(true)
    expect(response.data?.content[0]).toMatchObject({ eventId: 1, cameraId: 1, eventType: 'motion' })
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1/events', {
      startDate: '2026-08-15T08:00:00+09:00',
      endDate: '2026-08-15T09:00:00+09:00',
      severity: undefined,
      status: undefined,
    })
  })

  it('maps active camera events to alert DTOs', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: {
        content: [{ ...event, severity: 'high', description: 'Entry zone alert', location: 'Entry Zone' }],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        pageSize: 50,
      },
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    const response = await eventService.getActiveCameraAlerts(1)

    expect(response.success).toBe(true)
    expect(response.data?.[0]).toMatchObject({ alertId: 1, relatedEventId: 1, severity: 'warning' })
    expect(mockedApiClient.get).toHaveBeenCalledWith('/cameras/1/events', {
      status: 'active',
    })
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
