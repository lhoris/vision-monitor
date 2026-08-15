import { useEffect, useState } from 'react'
import { focusApiService } from '@/services'
import type { CameraEventDto } from '@/types/cameraFocus'
import type { CameraEventsRange } from '@/mocks/cameraEvents'

interface UseCameraFocusEventsOptions {
  cameraId: number | null
  enabled: boolean
  range: CameraEventsRange
}

export interface UseCameraFocusEventsResult {
  events: CameraEventDto[]
  eventsLoading: boolean
  eventsError: string | null
}

export function useCameraFocusEvents({
  cameraId,
  enabled,
  range,
}: UseCameraFocusEventsOptions): UseCameraFocusEventsResult {
  const [events, setEvents] = useState<CameraEventDto[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      if (!enabled || !cameraId) {
        setEvents([])
        setEventsLoading(false)
        setEventsError(null)
        return
      }

      setEventsLoading(true)
      setEventsError(null)

      const response = await focusApiService.getCameraEvents(cameraId, range)
      if (!cancelled) {
        setEvents(response.success ? response.data?.content ?? [] : [])
        setEventsError(response.success ? null : response.error ?? 'UNKNOWN')
        setEventsLoading(false)
      }
    }

    void loadEvents()

    return () => {
      cancelled = true
    }
  }, [cameraId, enabled, range])

  return {
    events,
    eventsLoading,
    eventsError,
  }
}
