import { useEffect, useMemo, useState } from 'react'
import { focusApiService } from '@/services'
import type { PlaybackSessionDto } from '@/types/cameraFocus'

export const DEFAULT_PLAYBACK_RANGE = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
} as const

interface UseCameraPlaybackOptions {
  cameraId: number | null
  enabled: boolean
  eventId?: number
}

export interface UseCameraPlaybackResult {
  playbackSession: PlaybackSessionDto | null
  playbackLoading: boolean
  playbackError: string | null
  range: typeof DEFAULT_PLAYBACK_RANGE
}

export function useCameraPlayback({
  cameraId,
  enabled,
  eventId,
}: UseCameraPlaybackOptions): UseCameraPlaybackResult {
  const [playbackSession, setPlaybackSession] = useState<PlaybackSessionDto | null>(null)
  const [playbackLoading, setPlaybackLoading] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const range = useMemo(() => DEFAULT_PLAYBACK_RANGE, [])

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
      })

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
  }, [cameraId, enabled, eventId, range])

  return {
    playbackSession,
    playbackLoading,
    playbackError,
    range,
  }
}
