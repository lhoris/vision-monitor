import { useEffect, useRef, useState } from 'react'
import type { CameraEventDto, PlaybackSessionDto, TimelineSegmentDto } from '@/types/cameraFocus'
import {
  DAY_SECONDS,
  dateToDaySeconds,
  daySecondsToDate,
  formatTimelineDateTime,
  formatTimelineTime,
  moveWorkArea,
  normalizeWorkArea,
  percentToSeconds,
  resizeWorkArea,
  secondsToPercent,
  type TimelineRangeSeconds,
  type WorkAreaDragMode,
} from './recordingTimelineModel'

interface RecordingTimelineProps {
  playbackSession: PlaybackSessionDto
  events: CameraEventDto[]
  dayStart: string
  workArea: TimelineRangeSeconds
  playheadTimestamp?: string | null
  onWorkAreaChange?: (range: TimelineRangeSeconds) => void
  onSeek?: (timestamp: string) => void
  onSelectEvent?: (eventId: number) => void
}

interface DragState {
  mode: WorkAreaDragMode
  startClientX: number
  initialRange: TimelineRangeSeconds
}

export function RecordingTimeline({ playbackSession, events, dayStart, workArea, playheadTimestamp, onWorkAreaChange, onSeek, onSelectEvent }: RecordingTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const normalizedWorkArea = normalizeWorkArea(workArea)
  const playheadSeconds = playheadTimestamp ? dateToDaySeconds(playheadTimestamp, dayStart) : normalizedWorkArea.from
  const dayLabel = new Date(dayStart).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const ticks = Array.from({ length: 13 }, (_, index) => index * 2 * 60 * 60)
  const dayKey = dayStart.slice(0, 10)
  const visibleSegments = playbackSession.timelineSegments.filter((segment) => segment.from.slice(0, 10) === dayKey)
  const visibleEvents = events.filter((event) => event.occurredAt.slice(0, 10) === dayKey)

  useEffect(() => {
    if (!dragState) return
    const activeDrag = dragState
    function handlePointerMove(event: PointerEvent) {
      const bounds = timelineRef.current?.getBoundingClientRect()
      if (!bounds || !onWorkAreaChange || bounds.width <= 0) return
      const deltaSeconds = ((event.clientX - activeDrag.startClientX) / bounds.width) * DAY_SECONDS
      if (activeDrag.mode === 'move') {
        onWorkAreaChange(moveWorkArea(activeDrag.initialRange, deltaSeconds))
      } else {
        const target = activeDrag.mode === 'start' ? activeDrag.initialRange.from : activeDrag.initialRange.to
        const targetSeconds = percentToSeconds(secondsToPercent(target) + (deltaSeconds / DAY_SECONDS) * 100)
        onWorkAreaChange(resizeWorkArea(activeDrag.initialRange, activeDrag.mode, targetSeconds))
      }
    }
    function handlePointerUp() { setDragState(null) }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, onWorkAreaChange])

  function handleTrackClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek || event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0) return
    const seconds = percentToSeconds(((event.clientX - bounds.left) / bounds.width) * 100)
    onSeek(formatTimelineDateTime(daySecondsToDate(seconds, dayStart)))
  }

  function handleTrackKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onSeek || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    event.preventDefault()
    const delta = event.key === 'ArrowLeft' ? -1 : 1
    onSeek(formatTimelineDateTime(daySecondsToDate(playheadSeconds + delta, dayStart)))
  }

  function beginDrag(mode: WorkAreaDragMode, event: React.PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    setDragState({ mode, startClientX: event.clientX, initialRange: normalizedWorkArea })
  }

  function moveHandleWithKeyboard(edge: 'start' | 'end', delta: number) {
    const value = edge === 'start' ? normalizedWorkArea.from : normalizedWorkArea.to
    onWorkAreaChange?.(resizeWorkArea(normalizedWorkArea, edge, value + delta))
  }

  return (
    <section className="focus-recording-panel border-t px-4 py-3" aria-label="녹화 타임라인">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div><span className="font-semibold">{dayLabel}</span><span className="focus-recording-muted ml-2">24시간 녹화 타임라인</span></div>
        <div className="font-semibold">선택 구간 {formatTimelineDateTime(daySecondsToDate(normalizedWorkArea.from, dayStart)).replace('T', ' ')} ~ {formatTimelineDateTime(daySecondsToDate(normalizedWorkArea.to, dayStart)).replace('T', ' ')}</div>
      </div>

      <div className="relative px-1 pb-5">
        <div className="pointer-events-none absolute inset-x-1 bottom-0 flex justify-between text-[10px] text-slate-400">
          {ticks.map((tick) => <span key={tick}>{formatTimelineTime(tick)}</span>)}
        </div>
        <div ref={timelineRef} className="focus-recording-timeline relative h-16 cursor-crosshair overflow-visible rounded border border-slate-600 bg-slate-950" role="slider" aria-label="녹화 재생 위치" aria-valuemin={0} aria-valuemax={DAY_SECONDS} aria-valuenow={Math.round(playheadSeconds)} tabIndex={0} onClick={handleTrackClick} onKeyDown={handleTrackKeyDown}>
          {ticks.map((tick) => <span key={`grid-${tick}`} aria-hidden="true" className="pointer-events-none absolute inset-y-0 border-l border-slate-700" style={{ left: `${secondsToPercent(tick)}%` }} />)}
          <div className="pointer-events-none absolute inset-x-0 top-5 h-7">
            {visibleSegments.length > 0 ? visibleSegments.map((segment) => <TimelineSegment key={`${segment.from}-${segment.to}-${segment.status}`} segment={segment} dayStart={dayStart} />) : <p className="focus-recording-muted absolute inset-0 flex items-center justify-center text-xs">표시할 녹화 구간이 없습니다.</p>}
          </div>

          <div className="absolute top-3 h-11 rounded border-2 border-sky-300 bg-sky-400/20 shadow-[0_0_0_1px_rgba(14,165,233,0.35)]" style={{ left: `${secondsToPercent(normalizedWorkArea.from)}%`, width: `${Math.max(secondsToPercent(normalizedWorkArea.to - normalizedWorkArea.from), 0.4)}%` }} onPointerDown={(event) => beginDrag('move', event)} title="선택 구간을 드래그하여 이동">
            <button type="button" aria-label="녹화 선택 구간 시작 핸들" className="absolute -left-2 top-1/2 h-8 w-4 -translate-y-1/2 cursor-ew-resize rounded-sm border border-sky-100 bg-sky-400 shadow" onPointerDown={(event) => beginDrag('start', event)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') moveHandleWithKeyboard('start', -1); if (event.key === 'ArrowRight') moveHandleWithKeyboard('start', 1) }} />
            <button type="button" aria-label="녹화 선택 구간 종료 핸들" className="absolute -right-2 top-1/2 h-8 w-4 -translate-y-1/2 cursor-ew-resize rounded-sm border border-sky-100 bg-sky-400 shadow" onPointerDown={(event) => beginDrag('end', event)} onKeyDown={(event) => { if (event.key === 'ArrowLeft') moveHandleWithKeyboard('end', -1); if (event.key === 'ArrowRight') moveHandleWithKeyboard('end', 1) }} />
          </div>

          {visibleEvents.map((event) => {
            const left = secondsToPercent(dateToDaySeconds(event.occurredAt, dayStart))
            return <button key={event.eventId} type="button" aria-label={`알람 marker ${event.occurredAt} ${event.title}`} className="absolute top-0 z-20 h-5 w-2 -translate-x-1/2 cursor-pointer rounded-t bg-amber-400 ring-2 ring-amber-200/50" style={{ left: `${left}%` }} title={`${event.title} ${event.occurredAt}`} onClick={(clickEvent) => { clickEvent.stopPropagation(); onSelectEvent?.(event.eventId); onSeek?.(event.occurredAt) }} />
          })}

          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-white shadow-[0_0_0_1px_rgba(14,165,233,0.9)]" style={{ left: `${secondsToPercent(playheadSeconds)}%` }}><span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-white shadow" /></span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-2 w-4 rounded bg-emerald-500" />녹화 가능</span>
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-2 w-4 rounded bg-slate-700" />녹화 공백</span>
        <span className="focus-recording-muted inline-flex items-center gap-1"><i className="h-3 w-1 rounded bg-amber-400" />알람</span>
        <span className="focus-recording-muted">핸들: 범위 조절 · 선택 영역: 범위 이동 · 빈 영역: 위치 이동</span>
        {visibleEvents.length === 0 ? <span className="focus-recording-muted">표시할 알람이 없습니다.</span> : null}
      </div>
    </section>
  )
}

function TimelineSegment({ segment, dayStart }: { segment: TimelineSegmentDto; dayStart: string }) {
  const from = dateToDaySeconds(segment.from, dayStart)
  const to = dateToDaySeconds(segment.to, dayStart)
  return <span role="img" aria-label={segment.status === 'gap' ? `녹화 공백 구간 ${segment.from}부터 ${segment.to}까지, seek 불가` : `녹화 가능 구간 ${segment.from}부터 ${segment.to}까지`} className={`absolute inset-y-0 ${segment.status === 'gap' ? 'focus-recording-segment--gap' : 'focus-recording-segment--available'}`} style={{ left: `${secondsToPercent(from)}%`, width: `${Math.max(secondsToPercent(to - from), 0.2)}%` }} />
}
