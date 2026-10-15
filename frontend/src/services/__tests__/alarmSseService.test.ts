import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseSseChunk, subscribeToAlarmStream } from '../alarmSseService'

describe('alarmSseService', () => {
  beforeEach(() => {
    localStorage.setItem('authToken', 'session-token')
  })

  it('parses event and data frames while retaining incomplete frames', () => {
    const first = parseSseChunk('event: alarm\ndata: {"id":1}\n\npartial')
    const second = parseSseChunk(' tail\n\n', first.remainder)

    expect(first.events).toEqual([{ event: 'alarm', data: '{"id":1}' }])
    expect(second.events).toEqual([])
    expect(second.remainder).toBe('')
  })

  it('sends bearer credentials and delivers alarm payloads', async () => {
    const alarm = { id: 1, cameraId: 2, type: 'PERSON', severity: 'high', description: 'Alarm', timestamp: new Date().toISOString(), acknowledged: false }
    const read = vi.fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(`event: alarm\ndata: ${JSON.stringify(alarm)}\n\n`) })
      .mockResolvedValueOnce({ done: true, value: undefined })
    const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200, body: { getReader: () => ({ read }) } })
    const onAlarm = vi.fn()

    const subscription = subscribeToAlarmStream(onAlarm, { fetcher, maxRetries: 0 })
    await vi.waitFor(() => expect(onAlarm).toHaveBeenCalledWith(alarm))

    expect(fetcher).toHaveBeenCalledWith('/api/alarms/stream', expect.objectContaining({
      headers: { Accept: 'text/event-stream', Authorization: 'Bearer session-token' },
    }))
    subscription.unsubscribe()
  })

  it('does not reconnect after unsubscribe', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'))
    const subscription = subscribeToAlarmStream(vi.fn(), { fetcher, retryDelayMs: 1 })
    subscription.unsubscribe()
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
