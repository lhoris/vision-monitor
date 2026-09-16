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
import type { TemporaryVideoSource } from '@/types/streamPlayer'
import type { Camera } from '@/types/camera'

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
  const temporarySources = useMemo(
    () => parseTemporarySources(searchParams.get('temporarySources')),
    [searchParams]
  )
  const cameraNameOverrides = useMemo(
    () => parseCameraNameOverrides(searchParams.get('cameraNames')),
    [searchParams]
  )
  const cameraList = useMemo(() => {
    const allCameras = createMockCameras()
    const cameraIds = parseCameraIds(searchParams.get('cameraIds'))
    const applyNameOverride = (cameraItem: ReturnType<typeof createMockCameras>[number]) => {
      const override = cameraNameOverrides[cameraItem.id]
      return override ? { ...cameraItem, name: override } : cameraItem
    }

    if (cameraIds.length === 0) {
      return allCameras.map(applyNameOverride)
    }

    const cameraMap = new Map(allCameras.map((cameraItem) => [cameraItem.id, cameraItem]))
    return cameraIds.flatMap((id) => {
      const temporarySource = temporarySources[id]
      if (temporarySource) {
        return [{
          id,
          name: temporarySource.displayName,
          location: 'Temporary video',
          zone: temporarySource.protocol.toUpperCase(),
          streamUrl: temporarySource.url,
          streamProtocol: temporarySource.protocol,
          status: temporarySource.playbackStatus === 'error' ? 'error' : 'online',
        } satisfies Camera]
      }

      const cameraItem = cameraMap.get(id)
      return cameraItem ? [applyNameOverride(cameraItem)] : []
    })
  }, [cameraNameOverrides, searchParams, temporarySources])
  const displayCamera = useMemo(() => {
    if (!camera) {
      return null
    }

    const override = cameraNameOverrides[camera.cameraId]
    return override ? { ...camera, cameraName: override } : camera
  }, [camera, cameraNameOverrides])
  const routeState = useMemo(
    () => parseCameraFocusRouteState(cameraId, searchParams),
    [cameraId, searchParams]
  )
  const selectedTemporarySource = routeState.cameraId ? temporarySources[routeState.cameraId] : undefined
  const apiCameraId = routeState.cameraId && routeState.cameraId > 0 ? routeState.cameraId : null
  const { playbackSession, playbackLoading, playbackError } = useCameraPlayback({
    cameraId: apiCameraId,
    enabled: routeState.mode === 'recording',
    eventId: routeState.selectedEventId,
  })
  const { alerts } = useActiveCameraAlerts(apiCameraId)
  const visibleAlerts = useMemo(() => [...manualAlerts, ...alerts], [alerts, manualAlerts])
  const eventRange = useMemo(
    () => ({
      from: playbackSession?.availableFrom ?? '2026-08-15T08:00:00+09:00',
      to: playbackSession?.availableTo ?? '2026-08-15T09:00:00+09:00',
    }),
    [playbackSession?.availableFrom, playbackSession?.availableTo]
  )
  const { events, eventsError } = useCameraFocusEvents({
    cameraId: apiCameraId,
    enabled: routeState.mode === 'recording',
    range: eventRange,
  })

  useEffect(() => {
    let cancelled = false

    async function loadCamera() {
      if (!apiCameraId) {
        setCamera(null)
        setCameraError(null)
        return
      }

      const response = await focusApiService.getCameraFocus(apiCameraId)
      if (!cancelled) {
        setCamera(response.success ? response.data ?? null : null)
        setCameraError(response.success ? null : response.error ?? 'UNKNOWN')
      }
    }

    void loadCamera()

    return () => {
      cancelled = true
    }
  }, [apiCameraId])

  useEffect(() => {
    let cancelled = false

    async function loadLiveStream() {
      if (selectedTemporarySource && routeState.mode === 'live') {
        setLiveStream(toTemporaryLiveStream(routeState.cameraId ?? -1, selectedTemporarySource))
        setLiveLoading(false)
        setLiveError(null)
        return
      }

      if (!apiCameraId || routeState.mode !== 'live') {
        setLiveStream(null)
        setLiveLoading(false)
        return
      }

      setLiveLoading(true)
      setLiveError(null)
      const response = await focusApiService.getCameraLiveStream(apiCameraId)
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
  }, [apiCameraId, routeState.cameraId, routeState.mode, selectedTemporarySource])

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
    const currentCameraId = apiCameraId
    if (!currentCameraId) {
      return
    }

    const now = new Date().toISOString()
    setManualAlerts((current) => [
      buildManualTestAlert({
        alertId: Date.now(),
        cameraId: currentCameraId,
        message,
        location: displayCamera?.location ?? 'Entry Zone',
        startedAt: now,
      }),
      ...current,
    ])
  }

  const temporaryCamera = routeState.cameraId && selectedTemporarySource
    ? toTemporaryCameraFocus(routeState.cameraId, selectedTemporarySource)
    : null
  const focusCamera = displayCamera ?? temporaryCamera

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
      camera={focusCamera}
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
      onTriggerTestAlert={apiCameraId ? handleTriggerTestAlert : undefined}
    />
  )
}

function parseTemporarySources(value: string | null): Record<number, TemporaryVideoSource> {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value) as Record<string, TemporaryVideoSource>
    return Object.entries(parsed).reduce<Record<number, TemporaryVideoSource>>((sources, [id, source]) => {
      const numericId = Number(id)
      if (
        Number.isSafeInteger(numericId) &&
        numericId !== 0 &&
        source &&
        typeof source.url === 'string' &&
        typeof source.displayName === 'string' &&
        (source.protocol === 'hls' || source.protocol === 'webrtc' || source.protocol === 'rtsp')
      ) {
        sources[numericId] = source
      }
      return sources
    }, {})
  } catch {
    return {}
  }
}

function toTemporaryCameraFocus(cameraId: number, source: TemporaryVideoSource): CameraFocusDto {
  return {
    cameraId,
    cameraName: source.displayName,
    processType: 'temporary',
    zoneName: source.protocol.toUpperCase(),
    lineName: 'Temporary video',
    location: 'Temporary video',
    status: source.playbackStatus === 'error' ? 'error' : 'online',
    recordingEnabled: false,
    capabilities: {
      live: true,
      recording: false,
      ptz: false,
      overlay: false,
    },
    lastSeenAt: null,
    recentEventSummary: {
      lastEventId: null,
      lastSeverity: null,
      lastOccurredAt: null,
      openCount: 0,
    },
  }
}

function toTemporaryLiveStream(cameraId: number, source: TemporaryVideoSource): LiveStreamDto {
  return {
    cameraId,
    streamUrl: source.url,
    streamProtocol: source.protocol === 'rtsp' ? 'rtsp_bridge' : source.protocol,
    expiresAt: null,
    status: source.playbackStatus === 'error' ? 'error' : 'active',
    resolution: null,
    fps: null,
    metadata: {
      provider: 'temporary',
      latencyClass: 'live',
    },
  }
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
    .filter((id) => Number.isSafeInteger(id) && id !== 0)
}

function parseCameraNameOverrides(value: string | null): Record<number, string> {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.entries(parsed).reduce<Record<number, string>>((overrides, [rawId, rawName]) => {
      const id = Number(rawId)
      if (Number.isSafeInteger(id) && id !== 0 && typeof rawName === 'string' && rawName.trim()) {
        overrides[id] = rawName.trim()
      }
      return overrides
    }, {})
  } catch {
    return {}
  }
}
