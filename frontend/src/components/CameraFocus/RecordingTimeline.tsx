import type { CameraEventDto, PlaybackSessionDto, TimelineSegmentDto } from '@/types/cameraFocus'

interface RecordingTimelineProps {
  playbackSession: PlaybackSessionDto
  events: CameraEventDto[]
  currentTimeSeconds?: number
  onSeek?: (seconds: number) => void
}

export function RecordingTimeline({ playbackSession, events, currentTimeSeconds = 0, onSeek }: RecordingTimelineProps) {
  const hasSegments = playbackSession.timelineSegments.length > 0
  const hasEvents = events.length > 0
  const durationSeconds = getDurationSeconds(playbackSession)
  const currentPercent = durationSeconds > 0 ? Math.min(Math.max(currentTimeSeconds / durationSeconds, 0), 1) * 100 : 0

  function handleTimelineClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek || !playbackSession.seekable || durationSeconds <= 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const percent = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1)
    onSeek(percent * durationSeconds)
  }

  function handleTimelineKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onSeek || !playbackSession.seekable) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const delta = event.key === 'ArrowLeft' ? -1 : 1
      onSeek(Math.min(Math.max(currentTimeSeconds + delta, 0), durationSeconds))
    }
  }

  return (
    <div className="focus-recording-panel border-t px-4 py-3" aria-label="녹화 타임라인">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="focus-recording-muted">{formatTime(playbackSession.availableFrom)}</span>
        <span className="font-semibold">재생 위치 {formatDuration(currentTimeSeconds)} / {formatDuration(durationSeconds)}</span>
        <span className="focus-recording-muted">{formatTime(playbackSession.availableTo)}</span>
      </div>

      <div
        className="focus-recording-timeline relative h-14 cursor-pointer rounded"
        role="slider"
        aria-label="녹화 재생 위치"
        aria-valuemin={0}
        aria-valuemax={durationSeconds}
        aria-valuenow={Math.round(currentTimeSeconds)}
        aria-valuetext={`${formatDuration(currentTimeSeconds)} 위치`}
        tabIndex={playbackSession.seekable ? 0 : -1}
        onClick={handleTimelineClick}
        onKeyDown={handleTimelineKeyDown}
      >
        {hasSegments ? (
          playbackSession.timelineSegments.map((segment) => (
            <TimelineSegment
              key={`${segment.from}-${segment.to}-${segment.status}`}
              segment={segment}
              playbackSession={playbackSession}
            />
          ))
        ) : (
          <p className="focus-recording-muted flex h-full items-center justify-center text-xs">표시할 녹화 구간이 없습니다.</p>
        )}

        {events.map((event) => (
          <span
            key={event.eventId}
            role="img"
            aria-label={`알람 marker ${event.occurredAt} ${event.title}`}
            className="focus-recording-event-marker absolute top-1 h-10 w-1 rounded ring-2"
            style={{ left: `${formatPercent(toPercent(event.occurredAt, playbackSession))}%` }}
          />
        ))}

        <span
          aria-hidden="true"
          className="focus-recording-playhead absolute top-0 h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(14,165,233,0.9)]"
          style={{ left: `${formatPercent(currentPercent)}%` }}
        >
          <span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-sky-400" />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="focus-recording-muted">색상 막대: 녹화 가능 구간</span>
        <span className="focus-recording-muted">알람 marker를 클릭하면 해당 알람으로 이동합니다.</span>
        {!hasEvents ? <span className="focus-recording-muted">표시할 알람이 없습니다.</span> : null}
      </div>
    </div>
  )
}

function TimelineSegment({
  segment,
  playbackSession,
}: {
  segment: TimelineSegmentDto
  playbackSession: PlaybackSessionDto
}) {
  const left = toPercent(segment.from, playbackSession)
  const right = toPercent(segment.to, playbackSession)
  const width = Math.max(0, right - left)
  const isGap = segment.status === 'gap'

  return (
    <span
      role="img"
      aria-label={
        isGap
          ? `녹화 공백 구간 ${segment.from}부터 ${segment.to}까지, seek 불가`
          : `녹화 가능 구간 ${segment.from}부터 ${segment.to}까지`
      }
      className={`absolute top-4 h-4 ${isGap ? 'focus-recording-segment--gap' : 'focus-recording-segment--available'}`}
      style={{
        left: `${formatPercent(left)}%`,
        width: `${formatPercent(width)}%`,
      }}
    />
  )
}

function toPercent(value: string, playbackSession: PlaybackSessionDto): number {
  const start = new Date(playbackSession.availableFrom).getTime()
  const end = new Date(playbackSession.availableTo).getTime()
  const current = new Date(value).getTime()
  const duration = end - start

  if (!Number.isFinite(duration) || duration <= 0) {
    return 0
  }

  const clamped = Math.min(Math.max(current - start, 0), duration)
  return (clamped / duration) * 100
}

function formatPercent(value: number): string {
  return value.toFixed(2)
}

function getDurationSeconds(playbackSession: PlaybackSessionDto): number {
  const duration = (new Date(playbackSession.availableTo).getTime() - new Date(playbackSession.availableFrom).getTime()) / 1000
  return Number.isFinite(duration) && duration > 0 ? duration : 0
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
