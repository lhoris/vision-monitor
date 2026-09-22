import type { AlarmOffsetConfig, AlarmRecordingClip } from '@/types'
import type { Event } from '@/types'

const DEFAULT_OFFSETS: AlarmOffsetConfig = {
  beforeSeconds: 10,
  afterSeconds: 20,
  source: 'mock',
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

  if (event.id === 6) {
    return {
      status: 'unavailable',
      requestedFrom,
      requestedTo,
      message: 'No recording is available for this alarm.',
    }
  }

  const availableFrom = event.id === 3
    ? new Date(event.timestamp.getTime() - 4 * 1000)
    : requestedFrom

  return {
    status: event.id === 3 ? 'partial' : 'available',
    requestedFrom,
    requestedTo,
    availableFrom,
    availableTo: requestedTo,
    playbackUrl: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAA==',
    downloadUrl: `data:text/plain;charset=utf-8,Mock alarm clip ${event.id}`,
    message: event.id === 3 ? 'Only part of the requested range is available.' : undefined,
  }
}

export async function downloadAlarmRecordingClip(event: Event, config?: AlarmOffsetConfig) {
  const clip = await getAlarmRecordingClip(event, config)
  if (!clip.downloadUrl || clip.status === 'unavailable' || clip.status === 'error') {
    throw new Error(clip.message ?? 'The alarm clip is not available.')
  }
  return clip
}
