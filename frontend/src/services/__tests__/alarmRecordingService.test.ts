import { describe, expect, it } from 'vitest'
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
  it('calculates the configured clip range around an alarm', async () => {
    const clip = await getAlarmRecordingClip(event(1), { beforeSeconds: 5, afterSeconds: 15, source: 'alarm-rule' })
    expect(clip.status).toBe('available')
    expect(clip.requestedFrom.toISOString()).toBe('2026-09-23T09:59:55.000Z')
    expect(clip.requestedTo.toISOString()).toBe('2026-09-23T10:00:15.000Z')
    expect(clip.downloadUrl).toBeTruthy()
  })

  it('reports an unavailable recording without offering a download', async () => {
    const clip = await getAlarmRecordingClip(event(6))
    expect(clip.status).toBe('unavailable')
    await expect(downloadAlarmRecordingClip(event(6))).rejects.toThrow()
  })
})
