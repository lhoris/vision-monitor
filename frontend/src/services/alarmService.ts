import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { Event } from '@/types'

function normalizeAlarm(alarm: Event): Event {
  return {
    ...alarm,
    cameraId: alarm.cameraId == null ? 0 : Number(alarm.cameraId),
    modelProcessId: alarm.modelProcessId == null ? null : Number(alarm.modelProcessId),
    timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp),
  }
}

export const alarmService = {
  async getUnacknowledged(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/alarms/unacknowledged')
    return getResponseData(response, []).map(normalizeAlarm)
  },

  async acknowledge(alarmId: number): Promise<Event> {
    const response = await apiClient.put<Event>(`/alarms/${alarmId}/acknowledge`)
    const alarm = getResponseData(response, null)
    if (!alarm) throw new Error('Acknowledged alarm was not returned')
    return normalizeAlarm(alarm)
  },
}
