import { useEffect, useMemo, useState } from 'react'
import { focusApiService } from '@/services'
import type { CameraPlaybackRange, PlaybackSessionDto } from '@/types/cameraFocus'
import { MVP_RECORDING_RANGE } from '@/services/recordingService'

export const DEFAULT_PLAYBACK_RANGE = MVP_RECORDING_RANGE

interface UseCameraPlaybackOptions {
  cameraId: number | null
  recordingBaseUrl?: string | null
  enabled: boolean
  eventId?: number
  range?: CameraPlaybackRange
}

export interface UseCameraPlaybackResult {
  playbackSession: PlaybackSessionDto | null
  playbackLoading: boolean
  playbackError: string | null
  range: CameraPlaybackRange
}

export function useCameraPlayback({
  cameraId,
  recordingBaseUrl,
  enabled,
  eventId,
  range: requestedRange,
}: UseCameraPlaybackOptions): UseCameraPlaybackResult {
  const [playbackSession, setPlaybackSession] = useState<PlaybackSessionDto | null>(null)
  const [playbackLoading, setPlaybackLoading] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const range = useMemo<CameraPlaybackRange>(
    () => requestedRange ?? DEFAULT_PLAYBACK_RANGE,
    [requestedRange?.from, requestedRange?.to, requestedRange?.eventId]
  )

  useEffect(() => {
    let cancelled = false

    async function loadPlayback() {
      if (!enabled || !cameraId) {
        setPlaybackSession(null)
        setPlaybackLoading(false)
        setPlaybackError(null)
        return
      }

      setPlaybackLoading(true)
      setPlaybackError(null)

      const response = await focusApiService.getCameraPlayback(cameraId, {
        ...range,
        eventId,
      }, recordingBaseUrl)

      if (!cancelled) {
        setPlaybackSession(response.success ? response.data ?? null : null)
        setPlaybackError(response.success ? null : response.error ?? 'UNKNOWN')
        setPlaybackLoading(false)
      }
    }

    void loadPlayback()

    return () => {
      cancelled = true
    }
  }, [cameraId, enabled, eventId, range, recordingBaseUrl])

  return {
    playbackSession,
    playbackLoading,
    playbackError,
    range,
  }
}
