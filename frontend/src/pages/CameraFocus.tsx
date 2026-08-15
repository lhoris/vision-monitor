import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CameraFocusShell } from '@/components/CameraFocus'
import { useActiveCameraAlerts } from '@/hooks/useActiveCameraAlerts'
import { useCameraFocusEvents } from '@/hooks/useCameraFocusEvents'
import { useCameraPlayback } from '@/hooks/useCameraPlayback'
import { createMockCameras } from '@/mocks/liveMonitoring'
import { focusApiService } from '@/services'
import type { ActiveAlertDto, CameraFocusDto, EventDetailDto, LiveStreamDto } from '@/types/cameraFocus'
import { parseCameraFocusRouteState, type CameraFocusMode } from './cameraFocusRoute'

export default function CameraFocus() {
  const { cameraId } = useParams<{ cameraId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [camera, setCamera] = useState<CameraFocusDto | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [liveStream, setLiveStream] = useState<LiveStreamDto | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventDetailDto | null>(null)
  const [manualAlerts, setManualAlerts] = useState<ActiveAlertDto[]>([])
  const cameraList = useMemo(() => {
    const allCameras = createMockCameras()
    const cameraIds = parseCameraIds(searchParams.get('cameraIds'))

    if (cameraIds.length === 0) {
      return allCameras
    }

    const cameraMap = new Map(allCameras.map((cameraItem) => [cameraItem.id, cameraItem]))
    return cameraIds.flatMap((id) => {
      const cameraItem = cameraMap.get(id)
      return cameraItem ? [cameraItem] : []
    })
  }, [searchParams])
  const routeState = useMemo(
    () => parseCameraFocusRouteState(cameraId, searchParams),
    [cameraId, searchParams]
  )
  const { playbackSession, playbackLoading, playbackError } = useCameraPlayback({
    cameraId: routeState.cameraId,
    enabled: routeState.mode === 'recording',
    eventId: routeState.selectedEventId,
  })
  const { alerts } = useActiveCameraAlerts(routeState.cameraId)
  const visibleAlerts = useMemo(() => [...manualAlerts, ...alerts], [alerts, manualAlerts])
  const eventRange = useMemo(
    () => ({
      from: playbackSession?.availableFrom ?? '2026-08-15T08:00:00+09:00',
      to: playbackSession?.availableTo ?? '2026-08-15T09:00:00+09:00',
    }),
    [playbackSession?.availableFrom, playbackSession?.availableTo]
  )
  const { events, eventsError } = useCameraFocusEvents({
    cameraId: routeState.cameraId,
    enabled: routeState.mode === 'recording',
    range: eventRange,
  })

  useEffect(() => {
    let cancelled = false

    async function loadCamera() {
      if (!routeState.cameraId) {
        setCamera(null)
        return
      }

      const response = await focusApiService.getCameraFocus(routeState.cameraId)
      if (!cancelled) {
        setCamera(response.success ? response.data ?? null : null)
        setCameraError(response.success ? null : response.error ?? 'UNKNOWN')
      }
    }

    void loadCamera()

    return () => {
      cancelled = true
    }
  }, [routeState.cameraId])

  useEffect(() => {
    let cancelled = false

    async function loadLiveStream() {
      if (!routeState.cameraId || routeState.mode !== 'live') {
        setLiveStream(null)
        setLiveLoading(false)
        return
      }

      setLiveLoading(true)
      setLiveError(null)
      const response = await focusApiService.getCameraLiveStream(routeState.cameraId)
      if (!cancelled) {
        setLiveStream(response.success ? response.data ?? null : null)
        setLiveError(response.success ? null : response.error ?? 'UNKNOWN')
        setLiveLoading(false)
      }
    }

    void loadLiveStream()

    return () => {
      cancelled = true
    }
  }, [routeState.cameraId, routeState.mode])

  useEffect(() => {
    let cancelled = false

    async function loadEventDetail() {
      if (!routeState.selectedEventId) {
        setSelectedEventDetail(null)
        return
      }

      const response = await focusApiService.getEventDetail(routeState.selectedEventId)
      if (!cancelled) {
        setSelectedEventDetail(response.success ? response.data ?? null : null)
      }
    }

    void loadEventDetail()

    return () => {
      cancelled = true
    }
  }, [routeState.selectedEventId])

  function handleModeChange(mode: CameraFocusMode) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', mode)
    if (mode === 'live') {
      nextParams.delete('eventId')
    }
    setSearchParams(nextParams)
  }

  function handleSelectCamera(nextCameraId: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', routeState.mode)
    nextParams.delete('eventId')
    navigate(`/live/cameras/${nextCameraId}?${nextParams.toString()}`)
  }

  function handleSelectEvent(eventId: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', 'recording')
    nextParams.set('eventId', String(eventId))
    setSearchParams(nextParams)
  }

  function handleTriggerTestAlert(message: string) {
    const currentCameraId = routeState.cameraId
    if (!currentCameraId) {
      return
    }

    const now = new Date().toISOString()
    setManualAlerts((current) => [
      buildManualTestAlert({
        alertId: Date.now(),
        cameraId: currentCameraId,
        message,
        location: camera?.location ?? 'Entry Zone',
        startedAt: now,
      }),
      ...current,
    ])
  }

  if (!routeState.cameraId) {
    return (
      <section className="p-6" aria-labelledby="camera-focus-title">
        <h1 id="camera-focus-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          화면 확대 보기
        </h1>
        <p className="mt-4 text-sm text-red-600">유효하지 않은 카메라 ID입니다.</p>
      </section>
    )
  }

  return (
    <CameraFocusShell
      mode={routeState.mode}
      selectedEventId={routeState.selectedEventId}
      alerts={visibleAlerts}
      camera={camera}
      cameraList={cameraList}
      liveStream={liveStream}
      liveLoading={liveLoading}
      liveError={liveError}
      playbackSession={playbackSession}
      playbackLoading={playbackLoading}
      playbackError={playbackError}
      events={events}
      eventsError={eventsError}
      selectedEventDetail={selectedEventDetail}
      cameraError={cameraError}
      onModeChange={handleModeChange}
      onSelectCamera={handleSelectCamera}
      onSelectEvent={handleSelectEvent}
      onTriggerTestAlert={handleTriggerTestAlert}
    />
  )
}

function buildManualTestAlert({
  alertId,
  cameraId,
  message,
  location,
  startedAt,
}: {
  alertId: number
  cameraId: number
  message: string
  location: string
  startedAt: string
}): ActiveAlertDto {
  return {
    alertId,
    cameraId,
    severity: 'warning',
    message,
    location,
    startedAt,
    status: 'active',
    relatedEventId: null,
    metadata: {
      source: 'manual-test',
    },
  }
}

function parseCameraIds(value: string | null): number[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
}
