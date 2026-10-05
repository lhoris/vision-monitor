import { apiClient } from './api'
import type { AlarmOffsetConfig, AlarmRecordingClip } from '@/types'
import type { Event } from '@/types'

const DEFAULT_OFFSETS: AlarmOffsetConfig = {
  beforeSeconds: 10,
  afterSeconds: 20,
  source: 'alarm-rule',
}

interface AlarmRecordingClipResponse {
  status: AlarmRecordingClip['status']
  requestedFrom: string
  requestedTo: string
  availableFrom?: string
  availableTo?: string
  playbackUrl?: string
  downloadUrl?: string
  message?: string
}

export function getAlarmOffsetConfig(): AlarmOffsetConfig {
  return { ...DEFAULT_OFFSETS }
}

export async function getAlarmRecordingClip(
  event: Event,
  config: AlarmOffsetConfig = DEFAULT_OFFSETS,
): Promise<AlarmRecordingClip> {
  const requestedFrom = new Date(event.timestamp.getTime() - config.beforeSeconds * 1000)
  const requestedTo = new Date(event.timestamp.getTime() + config.afterSeconds * 1000)

  try {
    const response = await apiClient.get<AlarmRecordingClipResponse>(`/recordings/events/${event.id}/clip`, {
      cameraId: event.cameraId,
      from: requestedFrom.toISOString(),
      to: requestedTo.toISOString(),
      beforeSeconds: config.beforeSeconds,
      afterSeconds: config.afterSeconds,
    })

    if (!response.success || !response.data) {
      return unavailableClip(requestedFrom, requestedTo, response.message)
    }

    return normalizeClip(response.data, requestedFrom, requestedTo)
  } catch (error) {
    console.error('Failed to fetch alarm recording clip:', error)
    return unavailableClip(requestedFrom, requestedTo)
  }
}

export async function downloadAlarmRecordingClip(event: Event, config?: AlarmOffsetConfig) {
  const clip = await getAlarmRecordingClip(event, config)
  if (!clip.downloadUrl || clip.status === 'unavailable' || clip.status === 'error') {
    throw new Error(clip.message ?? 'The alarm clip is not available.')
  }
  return clip
}

function normalizeClip(
  clip: AlarmRecordingClipResponse,
  fallbackFrom: Date,
  fallbackTo: Date,
): AlarmRecordingClip {
  return {
    ...clip,
    requestedFrom: new Date(clip.requestedFrom || fallbackFrom.toISOString()),
    requestedTo: new Date(clip.requestedTo || fallbackTo.toISOString()),
    availableFrom: clip.availableFrom ? new Date(clip.availableFrom) : undefined,
    availableTo: clip.availableTo ? new Date(clip.availableTo) : undefined,
  }
}

function unavailableClip(requestedFrom: Date, requestedTo: Date, message?: string): AlarmRecordingClip {
  return {
    status: 'unavailable',
    requestedFrom,
    requestedTo,
    message: message ?? 'No recording is available for this alarm.',
  }
}
