import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('@/services/api', () => ({
  apiClient: { get },
}))
import { downloadAlarmRecordingClip, getAlarmRecordingClip } from '@/services/alarmRecordingService'
import type { Event } from '@/types'

const event = (id: number): Event => ({
  id,
  cameraId: 1,
  type: 'motion_detected',
  severity: 'high',
  description: 'test',
  timestamp: new Date('2026-09-23T10:00:00Z'),
  acknowledged: false,
})

describe('alarmRecordingService', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('calculates the configured range and maps the API clip response', async () => {
    get.mockResolvedValue({
      success: true,
      data: {
        status: 'available',
        requestedFrom: '2026-09-23T09:59:55.000Z',
        requestedTo: '2026-09-23T10:00:15.000Z',
        availableFrom: '2026-09-23T09:59:55.000Z',
        availableTo: '2026-09-23T10:00:15.000Z',
        playbackUrl: 'https://media.test/alarm-1.m3u8',
        downloadUrl: 'https://media.test/alarm-1.mp4',
      },
      timestamp: '2026-09-23T10:00:00.000Z',
    })

    const clip = await getAlarmRecordingClip(event(1), { beforeSeconds: 5, afterSeconds: 15, source: 'alarm-rule' })
    expect(clip.status).toBe('available')
    expect(clip.requestedFrom.toISOString()).toBe('2026-09-23T09:59:55.000Z')
    expect(clip.requestedTo.toISOString()).toBe('2026-09-23T10:00:15.000Z')
    expect(clip.downloadUrl).toBe('https://media.test/alarm-1.mp4')
    expect(get).toHaveBeenCalledWith('/recordings/events/1/clip', {
      cameraId: 1,
      from: '2026-09-23T09:59:55.000Z',
      to: '2026-09-23T10:00:15.000Z',
      beforeSeconds: 5,
      afterSeconds: 15,
    })
  })

  it('reports an unavailable recording when the API rejects the request', async () => {
    get.mockRejectedValue(new Error('network failure'))

    const clip = await getAlarmRecordingClip(event(6))
    expect(clip.status).toBe('unavailable')
    await expect(downloadAlarmRecordingClip(event(6))).rejects.toThrow()
  })
})
