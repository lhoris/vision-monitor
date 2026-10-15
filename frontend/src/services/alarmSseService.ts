import type { Event } from '@/types/api'
import type { AlarmSseStatus, AlarmSseSubscription } from '@/types/alarm'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const STREAM_URL = `${API_BASE_URL}/alarms/stream`
const DEFAULT_MAX_RETRIES = 5
const DEFAULT_RETRY_DELAY_MS = 1000

export interface AlarmSseOptions {
  onStatus?: (status: AlarmSseStatus) => void
  maxRetries?: number
  retryDelayMs?: number
  fetcher?: typeof fetch
}

interface ParsedSseEvent {
  event: string
  data: string
}

export function parseSseChunk(chunk: string, buffered = ''): { events: ParsedSseEvent[]; remainder: string } {
  const sections = `${buffered}${chunk}`.split(/\r?\n\r?\n/)
  const remainder = sections.pop() ?? ''
  const events = sections.flatMap((section) => {
    let event = 'message'
    const dataLines: string[] = []
    section.split(/\r?\n/).forEach((line) => {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
    })
    return dataLines.length > 0 ? [{ event, data: dataLines.join('\n') }] : []
  })
  return { events, remainder }
}

function getToken(): string | null {
  return localStorage.getItem('authToken')
}

export function subscribeToAlarmStream(
  onAlarm: (alarm: Event) => void,
  options: AlarmSseOptions = {}
): AlarmSseSubscription {
  const fetcher = options.fetcher ?? fetch
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
  const controller = new AbortController()
  let stopped = false
  let retryCount = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  const setStatus = (status: AlarmSseStatus) => options.onStatus?.(status)

  const connect = async (): Promise<void> => {
    if (stopped) return
    setStatus('connecting')
    const token = getToken()
    if (!token) {
      setStatus('error')
      return
    }

    try {
      const response = await fetcher(STREAM_URL, {
        headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      if (!response.ok || !response.body) {
        if (response.status === 401) {
          setStatus('error')
          return
        }
        throw new Error(`Alarm stream failed with status ${response.status}`)
      }

      retryCount = 0
      setStatus('connected')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffered = ''
      while (!stopped) {
        const result = await reader.read()
        if (result.done) break
        const parsed = parseSseChunk(decoder.decode(result.value, { stream: true }), buffered)
        buffered = parsed.remainder
        parsed.events.forEach((event) => {
          if (event.event === 'alarm') onAlarm(JSON.parse(event.data) as Event)
        })
      }
      if (!stopped) throw new Error('Alarm stream closed')
    } catch (error) {
      if (stopped || (error instanceof DOMException && error.name === 'AbortError')) return
      if (retryCount >= maxRetries) {
        setStatus('error')
        return
      }
      retryCount += 1
      setStatus('retrying')
      retryTimer = setTimeout(() => void connect(), retryDelayMs * (2 ** (retryCount - 1)))
    }
  }

  void connect()
  return {
    unsubscribe: () => {
      stopped = true
      if (retryTimer) clearTimeout(retryTimer)
      controller.abort()
      setStatus('closed')
    },
  }
}

export const alarmSseService = { subscribe: subscribeToAlarmStream }
