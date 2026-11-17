import { useEffect, useMemo, useRef, useState } from 'react'
import type { CameraEventDto, PlaybackSessionDto, TimelineSegmentDto } from '@/types/cameraFocus'
import {
  DAY_SECONDS,
  dateToDaySeconds,
  daySecondsToDate,
  formatTimelineClockTime,
  formatTimelineDateTime,
  formatTimelineDuration,
  formatTimelineScaleTime,
  getTimelineTickStep,
  getTimelineViewRange,
  moveWorkArea,
  normalizeWorkArea,
  parseTimelineClockTime,
  percentToRangeSeconds,
  resizeWorkArea,
  resizeWorkAreaFromStart,
  resizeWorkAreaToDuration,
  secondsToRangePercent,
  TIMELINE_ZOOM_LEVELS,
  type TimelineRangeSeconds,
  type TimelineZoomLevel,
  type WorkAreaDragMode,
} from './recordingTimelineModel'

interface RecordingTimelineProps {
  playbackSession: PlaybackSessionDto
  events: CameraEventDto[]
  dayStart: string
  workArea: TimelineRangeSeconds
  playheadTimestamp?: string | null
  loading?: boolean
  onDateChange?: (date: string) => void
  onPlay?: () => void
  onWorkAreaChange?: (range: TimelineRangeSeconds) => void
  onWorkAreaCommit?: (range: TimelineRangeSeconds) => void
  onSeek?: (timestamp: string) => void
  onSelectEvent?: (eventId: number) => void
}

interface DragState {
  mode: WorkAreaDragMode
  startClientX: number
  initialRange: TimelineRangeSeconds
}

const WORK_AREA_PRESETS = [
  { label: '30초', seconds: 30 },
  { label: '1분', seconds: 60 },
  { label: '3분', seconds: 3 * 60 },
  { label: '5분', seconds: 5 * 60 },
  { label: '10분', seconds: 10 * 60 },
  { label: '30분', seconds: 30 * 60 },
  { label: '1시간', seconds: 60 * 60 },
  { label: '3시간', seconds: 3 * 60 * 60 },
  { label: '무한', seconds: DAY_SECONDS },
]

export function RecordingTimeline({ playbackSession, events, dayStart, workArea, playheadTimestamp, loading = false, onDateChange, onPlay, onWorkAreaChange, onWorkAreaCommit, onSeek, onSelectEvent }: RecordingTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [zoom, setZoom] = useState<TimelineZoomLevel>(1)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [contextDraft, setContextDraft] = useState<TimelineRangeSeconds>(normalizeWorkArea(workArea))
  const [customDuration, setCustomDuration] = useState('')
  const latestDragRange = useRef(normalizeWorkArea(workArea))
  const dragFinished = useRef(false)
  const normalizedWorkArea = normalizeWorkArea(workArea)
  const playheadSeconds = playheadTimestamp ? dateToDaySeconds(playheadTimestamp, dayStart) : normalizedWorkArea.from
  const viewRange = getTimelineViewRange(zoom, (normalizedWorkArea.from + normalizedWorkArea.to) / 2)
  const dayKey = dayStart.slice(0, 10)
  const visibleEvents = events
    .filter((event) => event.occurredAt.slice(0, 10) === dayKey)
    .filter((event) => {
      const seconds = dateToDaySeconds(event.occurredAt, dayStart)
      return isRangeOverlapping(seconds, seconds, viewRange)
    })
  const visibleSegments = playbackSession.timelineSegments
    .filter((segment) => segment.from.slice(0, 10) === dayKey)
    .filter((segment) => isRangeOverlapping(dateToDaySeconds(segment.from, dayStart), dateToDaySeconds(segment.to, dayStart), viewRange))
  const ticks = useMemo(() => createTicks(viewRange), [viewRange.from, viewRange.to])

  useEffect(() => {
    if (!dragState) return
    const activeDrag = dragState
    function handlePointerMove(event: PointerEvent) {
      const bounds = timelineRef.current?.getBoundingClientRect()
      if (!bounds || !onWorkAreaChange || bounds.width <= 0) return
      const deltaSeconds = ((event.clientX - activeDrag.startClientX) / bounds.width) * (viewRange.to - viewRange.from)
      const nextRange = activeDrag.mode === 'move'
        ? moveWorkArea(activeDrag.initialRange, deltaSeconds)
        : resizeWorkArea(activeDrag.initialRange, activeDrag.mode, (activeDrag.mode === 'start' ? activeDrag.initialRange.from : activeDrag.initialRange.to) + deltaSeconds)
      latestDragRange.current = nextRange
      if (activeDrag.mode === 'move') {
        onWorkAreaChange(nextRange)
      } else {
        onWorkAreaChange(nextRange)
      }
    }
    function handlePointerUp() {
      if (dragFinished.current) return
      dragFinished.current = true
      onWorkAreaCommit?.(latestDragRange.current)
      setDragState(null)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, onWorkAreaChange, onWorkAreaCommit, viewRange.from, viewRange.to])

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [contextMenu])

  function seekFromTrack(event: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek || event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0) return
    const seconds = percentToRangeSeconds(((event.clientX - bounds.left) / bounds.width) * 100, viewRange)
    onSeek(formatTimelineDateTime(daySecondsToDate(seconds, dayStart)))
  }

  function handleTrackKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onSeek || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    event.preventDefault()
    onSeek(formatTimelineDateTime(daySecondsToDate(playheadSeconds + (event.key === 'ArrowLeft' ? -1 : 1), dayStart)))
  }

  function handleTimelineWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    const index = TIMELINE_ZOOM_LEVELS.indexOf(zoom)
    const nextIndex = event.deltaY < 0 ? Math.min(index + 1, TIMELINE_ZOOM_LEVELS.length - 1) : Math.max(index - 1, 0)
    setZoom(TIMELINE_ZOOM_LEVELS[nextIndex])
  }

  function beginDrag(mode: WorkAreaDragMode, event: React.PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    dragFinished.current = false
    const pointerTarget = event.currentTarget as HTMLElement
    pointerTarget.setPointerCapture?.(event.pointerId)
    latestDragRange.current = normalizedWorkArea
    setDragState({ mode, startClientX: event.clientX, initialRange: normalizedWorkArea })
  }

  function finishDrag() {
    if (!dragState || dragFinished.current) return
    dragFinished.current = true
    onWorkAreaCommit?.(latestDragRange.current)
    setDragState(null)
  }

  function moveHandleWithKeyboard(edge: 'start' | 'end', delta: number) {
    const value = edge === 'start' ? normalizedWorkArea.from : normalizedWorkArea.to
    onWorkAreaChange?.(resizeWorkArea(normalizedWorkArea, edge, value + delta))
  }

  function openContextMenu(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setContextDraft(normalizedWorkArea)
    setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 300), y: Math.min(event.clientY, window.innerHeight - 250) })
  }

  function applyContextDraft() {
    commitWorkArea(contextDraft)
    setContextMenu(null)
  }

  function applyCustomDuration() {
    const duration = Number(customDuration)
    if (!Number.isFinite(duration)) return
    commitWorkArea(resizeWorkAreaToDuration(normalizedWorkArea, duration))
  }

  function commitWorkArea(nextRange: TimelineRangeSeconds) {
    const normalized = normalizeWorkArea(nextRange)
    onWorkAreaChange?.(normalized)
    onWorkAreaCommit?.(normalized)
  }

  const activePreset = WORK_AREA_PRESETS.find((preset) => normalizedWorkArea.to - normalizedWorkArea.from === preset.seconds || (preset.seconds === DAY_SECONDS && normalizedWorkArea.to === DAY_SECONDS))

  return (
    <section className="focus-recording-panel min-h-[236px] shrink-0 border-t px-4 py-3" aria-label="녹화 타임라인">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button type="button" className="focus-recording-zoom-button" aria-label="이전 날짜" onClick={() => onDateChange?.(shiftDate(dayKey, -1))}>‹</button>
          <input type="date" aria-label="탐색 날짜" value={dayKey} onChange={(event) => onDateChange?.(event.target.value)} className="border border-slate-500 bg-slate-900 px-2 py-1 text-xs font-semibold text-white" />
          <button type="button" className="focus-recording-zoom-button" aria-label="다음 날짜" onClick={() => onDateChange?.(shiftDate(dayKey, 1))}>›</button>
        </div>
        <button type="button" className="focus-action-button border px-3 py-1.5 text-xs font-semibold" aria-label="녹화 재생" onClick={onPlay} disabled={loading}>{loading ? '조회 중...' : '▶ 재생'}</button>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="focus-recording-muted">선택 구간 <strong className="text-sm font-semibold text-slate-100">{formatTimelineClockTime(normalizedWorkArea.from)}</strong> ~ <strong className="text-sm font-semibold text-slate-100">{formatTimelineClockTime(normalizedWorkArea.to)}</strong></span>
        <span className="focus-recording-muted">작업 구간 길이: <strong className="text-slate-200">{formatTimelineDuration(normalizedWorkArea.to - normalizedWorkArea.from)}</strong></span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="focus-recording-muted">빠른 설정</span>
        <span className="rounded border border-sky-300/70 bg-sky-900/60 px-2 py-1 text-[11px] font-semibold text-sky-100" aria-label={`현재 빠른 설정: ${activePreset?.label ?? '사용자 지정'}`}>현재: {activePreset?.label ?? '사용자 지정'}</span>
        {WORK_AREA_PRESETS.map((preset) => {
          const active = normalizedWorkArea.to - normalizedWorkArea.from === preset.seconds || (preset.seconds === DAY_SECONDS && normalizedWorkArea.to === DAY_SECONDS)
          return <button key={preset.seconds} type="button" aria-pressed={active} className={`focus-recording-zoom-button !h-6 !min-w-0 px-2 text-[11px] ${active ? 'border-sky-300 bg-sky-600 text-white' : ''}`} onClick={() => commitWorkArea(resizeWorkAreaFromStart(normalizedWorkArea, preset.seconds))}>{preset.label}</button>
        })}
        <label className="flex items-center gap-1 text-[11px] text-slate-300">
          직접 입력
          <input type="number" min={5} max={DAY_SECONDS} step={1} aria-label="직접 길이(초)" value={customDuration} placeholder="초" onChange={(event) => setCustomDuration(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyCustomDuration() }} className="h-6 w-20 border border-slate-500 bg-slate-900 px-2 text-[11px] text-white" />
          <button type="button" aria-label="직접 길이 적용" className="focus-recording-zoom-button !h-6 !min-w-0 px-2 text-[11px]" onClick={applyCustomDuration}>적용</button>
        </label>
        <span className="focus-recording-muted">핸들 드래그 또는 우클릭으로 정밀 조절</span>
        <div className="ml-auto flex items-center gap-1" aria-label="타임라인 확대 축소">
          <button type="button" className="focus-recording-zoom-button" aria-label="타임라인 축소" onClick={() => setZoom(TIMELINE_ZOOM_LEVELS[Math.max(TIMELINE_ZOOM_LEVELS.indexOf(zoom) - 1, 0)])} disabled={zoom === 1}>−</button>
          <button type="button" className="focus-recording-zoom-button min-w-12" aria-label="전체 보기" onClick={() => setZoom(1)}>{zoom}x</button>
          <button type="button" className="focus-recording-zoom-button" aria-label="타임라인 확대" onClick={() => setZoom(TIMELINE_ZOOM_LEVELS[Math.min(TIMELINE_ZOOM_LEVELS.indexOf(zoom) + 1, TIMELINE_ZOOM_LEVELS.length - 1)])} disabled={zoom === TIMELINE_ZOOM_LEVELS[TIMELINE_ZOOM_LEVELS.length - 1]}>＋</button>
        </div>
      </div>

      <div className="relative px-1 pb-5 pt-1">
        <div className="pointer-events-none absolute inset-x-1 bottom-0 flex justify-between text-[10px] text-slate-400">{ticks.map((tick) => <span key={tick}>{formatTimelineScaleTime(tick)}</span>)}</div>
        <div ref={timelineRef} className="focus-recording-timeline relative h-16 cursor-crosshair overflow-visible rounded border border-slate-600 bg-slate-950" role="slider" aria-label="녹화 재생 위치" aria-valuemin={Math.round(viewRange.from)} aria-valuemax={Math.round(viewRange.to)} aria-valuenow={Math.round(Math.min(Math.max(playheadSeconds, viewRange.from), viewRange.to))} tabIndex={0} onClick={seekFromTrack} onKeyDown={handleTrackKeyDown} onWheel={handleTimelineWheel} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
          {ticks.map((tick) => <span key={`grid-${tick}`} aria-hidden="true" className="pointer-events-none absolute inset-y-0 border-l border-slate-700" style={{ left: `${secondsToRangePercent(tick, viewRange)}%` }} />)}
          <div className="pointer-events-none absolute inset-x-0 top-5 h-7">{visibleSegments.length > 0 ? visibleSegments.map((segment) => <TimelineSegment key={`${segment.from}-${segment.to}-${segment.status}`} segment={segment} dayStart={dayStart} range={viewRange} />) : <p className="focus-recording-muted absolute inset-0 flex items-center justify-center text-xs">표시할 녹화 구간이 없습니다.</p>}</div>
          <WorkAreaSelection range={normalizedWorkArea} viewRange={viewRange} onPointerDown={beginDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onHandleKeyDown={moveHandleWithKeyboard} onContextMenu={openContextMenu} />
          {visibleEvents.map((event) => <AlarmMarker key={event.eventId} event={event} dayStart={dayStart} range={viewRange} onSelectEvent={onSelectEvent} onSeek={onSeek} />)}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-white shadow-[0_0_0_1px_rgba(14,165,233,0.9)]" style={{ left: `${secondsToRangePercent(playheadSeconds, viewRange)}%` }}><span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-white shadow" /></span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-3 w-4 rounded border-2 border-sky-300 bg-sky-400/20" />선택 구간(work area): 녹화 재생 범위</span>
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-4 w-0.5 bg-white shadow-[0_0_0_1px_rgba(14,165,233,0.9)]" />현재 재생 위치</span>
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-3 w-1 rounded bg-amber-400" />알람</span>
        <span className="focus-recording-muted">빈 영역 클릭: 위치 이동</span>
        <span className="focus-recording-muted">마우스 휠: 타임라인 확대/축소</span>
        <span className="focus-recording-muted">work area 우클릭: 시작·종료 시각 정밀 조절</span>
      </div>

      {contextMenu ? <ManualRangeMenu draft={contextDraft} position={contextMenu} onChange={setContextDraft} onCancel={() => setContextMenu(null)} onApply={applyContextDraft} /> : null}
    </section>
  )
}

function ManualRangeMenu({ draft, position, onChange, onCancel, onApply }: { draft: TimelineRangeSeconds; position: { x: number; y: number }; onChange: React.Dispatch<React.SetStateAction<TimelineRangeSeconds>>; onCancel: () => void; onApply: () => void }) {
  return (
    <div role="dialog" aria-label="작업 구간 정밀 조정" className="fixed z-[140] w-72 rounded border border-slate-500 bg-slate-800 p-3 text-white shadow-2xl" style={{ left: position.x, top: position.y }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      <div className="mb-2 text-xs font-semibold">작업 구간 정밀 조정</div>
      <div className="grid grid-cols-2 gap-2">
        <ClockField label="시작 시각" value={draft.from} onChange={(value) => { if (value !== null) onChange((current) => ({ ...current, from: value })) }} />
        <ClockField label="종료 시각" value={draft.to} onChange={(value) => { if (value !== null) onChange((current) => ({ ...current, to: value })) }} />
      </div>
      <label className="mt-2 flex flex-col gap-1 text-[11px] text-slate-300">길이(초)<input type="number" min={5} max={DAY_SECONDS} aria-label="작업 구간 길이(초)" value={Math.max(0, draft.to - draft.from)} onChange={(event) => { const duration = Number(event.target.value); if (Number.isFinite(duration)) onChange((current) => ({ from: current.from, to: Math.min(DAY_SECONDS, current.from + duration) })) }} className="border border-slate-500 bg-slate-900 px-2 py-1.5 text-xs text-white" /></label>
      <p className="mt-2 text-[11px] text-slate-400">시작·종료 시각 또는 길이를 입력한 뒤 적용하세요.</p>
      <div className="mt-3 flex justify-end gap-2"><button type="button" className="border border-slate-500 px-2 py-1 text-xs" onClick={onCancel}>취소</button><button type="button" aria-label="작업 구간 적용" className="border border-sky-400 bg-sky-600 px-2 py-1 text-xs font-semibold" onClick={onApply}>적용</button></div>
    </div>
  )
}

function ClockField({ label, value, onChange }: { label: string; value: number; onChange: (value: number | null) => void }) {
  return <label className="flex flex-col gap-1 text-[11px] text-slate-300">{label}<input type="time" step="1" aria-label={label} value={formatTimelineClockTime(value)} onChange={(event) => onChange(parseTimelineClockTime(event.target.value))} className="border border-slate-500 bg-slate-900 px-2 py-1.5 text-xs text-white" /></label>
}

function WorkAreaSelection({ range, viewRange, onPointerDown, onPointerUp, onPointerCancel, onHandleKeyDown, onContextMenu }: { range: TimelineRangeSeconds; viewRange: TimelineRangeSeconds; onPointerDown: (mode: WorkAreaDragMode, event: React.PointerEvent) => void; onPointerUp: () => void; onPointerCancel: () => void; onHandleKeyDown: (edge: 'start' | 'end', delta: number) => void; onContextMenu: (event: React.MouseEvent) => void }) {
  const left = secondsToRangePercent(range.from, viewRange)
  const right = secondsToRangePercent(range.to, viewRange)
  return <div className="absolute top-3 h-11 rounded border-2 border-sky-300 bg-sky-400/20 shadow-[0_0_0_1px_rgba(14,165,233,0.35)]" style={{ left: `${left}%`, width: `${Math.max(right - left, 0.03)}%` }} onPointerDown={(event) => onPointerDown('move', event)} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onContextMenu={onContextMenu} title="선택 구간을 드래그하여 이동 · 우클릭하여 정밀 조정"><button type="button" aria-label="녹화 선택 구간 시작 핸들" className="absolute -left-1 top-1/2 h-7 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-sm border border-sky-100 bg-sky-400 shadow" onPointerDown={(event) => onPointerDown('start', event)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') onHandleKeyDown('start', -1); if (event.key === 'ArrowRight') onHandleKeyDown('start', 1) }} /><button type="button" aria-label="녹화 선택 구간 종료 핸들" className="absolute -right-1 top-1/2 h-7 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-sm border border-sky-100 bg-sky-400 shadow" onPointerDown={(event) => onPointerDown('end', event)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') onHandleKeyDown('end', -1); if (event.key === 'ArrowRight') onHandleKeyDown('end', 1) }} /></div>
}

function AlarmMarker({ event, dayStart, range, onSelectEvent, onSeek }: { event: CameraEventDto; dayStart: string; range: TimelineRangeSeconds; onSelectEvent?: (eventId: number) => void; onSeek?: (timestamp: string) => void }) {
  const seconds = dateToDaySeconds(event.occurredAt, dayStart)
  return <button type="button" aria-label={`알람 marker ${event.occurredAt} ${event.title}`} className="absolute top-0 z-20 h-5 w-2 -translate-x-1/2 cursor-pointer rounded-t bg-amber-400 ring-2 ring-amber-200/50" style={{ left: `${secondsToRangePercent(seconds, range)}%` }} title={`${event.title} ${event.occurredAt}`} onClick={(clickEvent) => { clickEvent.stopPropagation(); onSelectEvent?.(event.eventId); onSeek?.(event.occurredAt) }} />
}

function TimelineSegment({ segment, dayStart, range }: { segment: TimelineSegmentDto; dayStart: string; range: TimelineRangeSeconds }) {
  const from = dateToDaySeconds(segment.from, dayStart)
  const to = dateToDaySeconds(segment.to, dayStart)
  const left = secondsToRangePercent(from, range)
  const right = secondsToRangePercent(to, range)
  return <span role="img" aria-label={segment.status === 'gap' ? `녹화 공백 구간 ${segment.from}부터 ${segment.to}까지, seek 불가` : `녹화 가능 구간 ${segment.from}부터 ${segment.to}까지`} className={`absolute inset-y-0 ${segment.status === 'gap' ? 'focus-recording-segment--gap' : 'focus-recording-segment--available'}`} style={{ left: `${left}%`, width: `${Math.max(right - left, 0.2)}%` }} />
}

function isRangeOverlapping(from: number, to: number, range: TimelineRangeSeconds) {
  return to >= range.from && from <= range.to
}

function createTicks(range: TimelineRangeSeconds) {
  const step = getTimelineTickStep(range)
  const first = Math.ceil(range.from / step) * step
  const ticks: number[] = []
  for (let tick = first; tick <= range.to; tick += step) ticks.push(tick)
  return ticks.length > 1 ? ticks : [range.from, range.to]
}

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`)
  next.setDate(next.getDate() + days)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`
}
