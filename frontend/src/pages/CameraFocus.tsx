import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CameraFocusShell } from '@/components/CameraFocus'
import { useActiveCameraAlerts } from '@/hooks/useActiveCameraAlerts'
import { useCameraFocusEvents } from '@/hooks/useCameraFocusEvents'
import { DEFAULT_PLAYBACK_RANGE, useCameraPlayback } from '@/hooks/useCameraPlayback'
import { cameraService, focusApiService } from '@/services'
import { useAppSelector } from '@/store'
import type { ActiveAlertDto, CameraFocusDto, CameraPlaybackRange, EventDetailDto, LiveStreamDto } from '@/types/cameraFocus'
import { parseCameraFocusRouteState, type CameraFocusMode } from './cameraFocusRoute'
import type { TemporaryVideoSource } from '@/types/streamPlayer'
import type { Camera } from '@/types/camera'
import {
  DAY_SECONDS,
  dateToDaySeconds,
  daySecondsToDate,
  formatTimelineDateTime,
  normalizeWorkArea,
  type TimelineRangeSeconds,
} from '@/components/CameraFocus/recordingTimelineModel'

const DEFAULT_RECORDING_DATE = DEFAULT_PLAYBACK_RANGE.from.slice(0, 10)
const DEFAULT_RECORDING_DAY_START = `${DEFAULT_RECORDING_DATE}T00:00:00`
const DEFAULT_RECORDING_WORK_AREA: TimelineRangeSeconds = {
  from: dateToDaySeconds(DEFAULT_PLAYBACK_RANGE.from, DEFAULT_RECORDING_DAY_START),
  to: dateToDaySeconds(DEFAULT_PLAYBACK_RANGE.to, DEFAULT_RECORDING_DAY_START),
}

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
  const [recordingDraftRange, setRecordingDraftRange] = useState<CameraPlaybackRange>(DEFAULT_PLAYBACK_RANGE)
  const [playbackRange, setPlaybackRange] = useState<CameraPlaybackRange>(DEFAULT_PLAYBACK_RANGE)
  const [recordingDate, setRecordingDate] = useState(DEFAULT_RECORDING_DATE)
  const [recordingWorkArea, setRecordingWorkArea] = useState<TimelineRangeSeconds>(DEFAULT_RECORDING_WORK_AREA)
  const realtimeAlarm = useAppSelector((state) => state.event.realtimeEvent)
  const [catalogCameras, setCatalogCameras] = useState<Camera[] | null>(null)
  const temporarySources = useMemo(
    () => parseTemporarySources(searchParams.get('temporarySources')),
    [searchParams]
  )
  const cameraNameOverrides = useMemo(
    () => parseCameraNameOverrides(searchParams.get('cameraNames')),
    [searchParams]
  )
  const modelProcessIdOverrides = useMemo(
    () => parseModelProcessIdOverrides(searchParams.get('modelProcessIds')),
    [searchParams]
  )

  useEffect(() => {
    let cancelled = false

    void cameraService.getAllCameras().then((cameras) => {
      if (!cancelled && cameras.length > 0) setCatalogCameras(cameras)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const cameraList = useMemo(() => {
    const cameraIds = parseCameraIds(searchParams.get('cameraIds'))
    const allCameras = catalogCameras ?? []
    const applyNameOverride = (cameraItem: Camera) => {
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
          modelProcessId: temporarySource.modelProcessId ?? null,
          status: temporarySource.playbackStatus === 'error' ? 'error' : 'online',
        } satisfies Camera]
      }

      const cameraItem = cameraMap.get(id)
      return cameraItem ? [applyNameOverride(cameraItem)] : []
    })
  }, [cameraNameOverrides, catalogCameras, searchParams, temporarySources])
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
  const metadataSourceId = apiCameraId ?? parseManagedSourceId(selectedTemporarySource?.id)
  const activeCatalogCamera = routeState.cameraId
    ? cameraList.find((cameraItem) => cameraItem.id === routeState.cameraId)
    : undefined
  const sourceCatalogCamera = selectedTemporarySource
    ? catalogCameras?.find((cameraItem) => cameraItem.id === parseManagedSourceId(selectedTemporarySource.id))
    : undefined
  const activeModelProcessId = displayCamera?.modelProcessId
    ?? activeCatalogCamera?.modelProcessId
    ?? sourceCatalogCamera?.modelProcessId
    ?? selectedTemporarySource?.modelProcessId
    ?? (routeState.cameraId ? modelProcessIdOverrides[routeState.cameraId] : null)
    ?? null
  const { playbackSession, playbackLoading, playbackError } = useCameraPlayback({
    cameraId: apiCameraId,
    enabled: routeState.mode === 'recording',
    eventId: routeState.selectedEventId,
    range: playbackRange,
  })
  const { alerts } = useActiveCameraAlerts(apiCameraId)
  const visibleAlerts = useMemo(() => [...manualAlerts, ...alerts], [alerts, manualAlerts])

  useEffect(() => {
    if (realtimeAlarm) {
      console.info('[CameraFocus alarm] matching', {
        routeCameraId: routeState.cameraId,
        activeModelProcessId,
        catalogModelProcessId: activeCatalogCamera?.modelProcessId ?? null,
        sourceCatalogModelProcessId: sourceCatalogCamera?.modelProcessId ?? null,
        focusModelProcessId: displayCamera?.modelProcessId ?? null,
        temporaryModelProcessId: selectedTemporarySource?.modelProcessId ?? null,
        routeModelProcessId: routeState.cameraId ? modelProcessIdOverrides[routeState.cameraId] ?? null : null,
        alarmModelProcessId: realtimeAlarm.modelProcessId,
        matched: activeModelProcessId != null && Number(realtimeAlarm.modelProcessId) === Number(activeModelProcessId),
      })
    }

    if (
      !realtimeAlarm
      || activeModelProcessId == null
      || Number(realtimeAlarm.modelProcessId) !== Number(activeModelProcessId)
    ) {
      return
    }

    const occurredAt = realtimeAlarm.timestamp instanceof Date
      ? realtimeAlarm.timestamp
      : new Date(realtimeAlarm.timestamp)

    setManualAlerts((current) => {
      if (current.some((alert) => alert.alertId === realtimeAlarm.id)) {
        return current
      }

      return [
        buildManualTestAlert({
          alertId: realtimeAlarm.id,
          cameraId: realtimeAlarm.cameraId,
          modelProcessId: realtimeAlarm.modelProcessId,
          message: realtimeAlarm.description,
          location: displayCamera?.location ?? 'Entry Zone',
          startedAt: occurredAt.toISOString(),
          severity: realtimeAlarm.severity === 'critical' ? 'critical' : 'warning',
          source: 'sse',
        }),
        ...current,
      ]
    })
  }, [activeModelProcessId, displayCamera?.location, realtimeAlarm])
  const eventRange = useMemo(
    () => ({
      from: playbackSession?.availableFrom ?? playbackRange.from,
      to: playbackSession?.availableTo ?? playbackRange.to,
    }),
    [playbackRange.from, playbackRange.to, playbackSession?.availableFrom, playbackSession?.availableTo]
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
    if (mode === 'recording') {
      setRecordingDraftRange(DEFAULT_PLAYBACK_RANGE)
      setPlaybackRange(DEFAULT_PLAYBACK_RANGE)
      setRecordingDate(DEFAULT_RECORDING_DATE)
      setRecordingWorkArea(DEFAULT_RECORDING_WORK_AREA)
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

  function handleRecordingSubmit() {
    setPlaybackRange({ ...recordingDraftRange, eventId: undefined })
  }

  function handleRecordingDateChange(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
    setRecordingDate(date)
    const nextRange: CameraPlaybackRange = {
      from: `${date}T00:00:00`,
      to: `${date}T00:00:30`,
    }
    setRecordingDraftRange(nextRange)
    setRecordingWorkArea({ from: 0, to: 30 })
  }

  function handleRecordingWorkAreaChange(range: TimelineRangeSeconds) {
    const normalized = normalizeWorkArea(range)
    const dayStart = `${recordingDate}T00:00:00`
    setRecordingWorkArea(normalized)
    setRecordingDraftRange({
      from: formatTimelineDateTime(daySecondsToDate(normalized.from, dayStart)),
      to: formatTimelineDateTime(daySecondsToDate(normalized.to, dayStart)),
    })
  }

  function handleTimelineSeek(timestamp: string) {
    const targetTime = new Date(timestamp).getTime()
    const loadedFrom = new Date(playbackRange.from).getTime()
    const loadedTo = new Date(playbackRange.to).getTime()
    if (Number.isFinite(targetTime) && targetTime >= loadedFrom && targetTime <= loadedTo) {
      return
    }

    const dayStart = `${recordingDate}T00:00:00`
    const seconds = dateToDaySeconds(timestamp, dayStart)
    const currentWidth = recordingWorkArea.to - recordingWorkArea.from
    const halfWidth = Math.max(currentWidth / 2, 15)
    const from = Math.max(0, Math.min(seconds - halfWidth, DAY_SECONDS - currentWidth))
    handleRecordingWorkAreaChange({ from, to: from + currentWidth })
  }

  useEffect(() => {
    const eventTime = selectedEventDetail?.playbackHint?.seekAt ?? selectedEventDetail?.occurredAt
    if (!eventTime || routeState.mode !== 'recording') return

    const center = new Date(eventTime).getTime()
    if (!Number.isFinite(center)) return

    const nextRange: CameraPlaybackRange = {
      from: toLocalDateTimeInput(new Date(center - 30_000)),
      to: toLocalDateTimeInput(new Date(center + 30_000)),
      eventId: routeState.selectedEventId,
    }
    setRecordingDraftRange(nextRange)
    setPlaybackRange(nextRange)
  }, [routeState.mode, routeState.selectedEventId, selectedEventDetail])

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
        location: displayCamera?.location ?? (selectedTemporarySource ? 'Temporary video' : 'Entry Zone'),
        startedAt: now,
      }),
      ...current,
    ])
  }

  function handleBackToLive() {
    navigate('/live')
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
      metadataSourceId={metadataSourceId}
      selectedCameraId={routeState.cameraId}
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
      onBackToLive={handleBackToLive}
      onDateChange={handleRecordingDateChange}
      onRecordingSubmit={handleRecordingSubmit}
      timelineDate={`${recordingDate}T00:00:00`}
      recordingWorkArea={recordingWorkArea}
      onRecordingWorkAreaChange={handleRecordingWorkAreaChange}
      onTimelineSeek={handleTimelineSeek}
    />
  )
}

function toLocalDateTimeInput(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
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

function parseManagedSourceId(sourceId?: string): number | null {
  const match = sourceId?.match(/^video-source-(\d+)$/)
  if (!match) return null
  const id = Number(match[1])
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function toTemporaryCameraFocus(cameraId: number, source: TemporaryVideoSource): CameraFocusDto {
  return {
    cameraId,
    modelProcessId: source.modelProcessId ?? null,
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
  modelProcessId,
  message,
  location,
  startedAt,
  severity = 'warning',
  source = 'manual-test',
}: {
  alertId: number
  cameraId: number
  modelProcessId?: number | null
  message: string
  location: string
  startedAt: string
  severity?: ActiveAlertDto['severity']
  source?: string
}): ActiveAlertDto {
  return {
    alertId,
    cameraId,
    modelProcessId: modelProcessId ?? null,
    severity,
    message,
    location,
    startedAt,
    status: 'active',
    relatedEventId: null,
    metadata: {
      source,
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

function parseModelProcessIdOverrides(value: string | null): Record<number, number> {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.entries(parsed).reduce<Record<number, number>>((overrides, [rawCameraId, rawProcessId]) => {
      const cameraId = Number(rawCameraId)
      const modelProcessId = Number(rawProcessId)
      if (Number.isSafeInteger(cameraId) && cameraId !== 0 && Number.isSafeInteger(modelProcessId) && modelProcessId > 0) {
        overrides[cameraId] = modelProcessId
      }
      return overrides
    }, {})
  } catch {
    return {}
  }
}
